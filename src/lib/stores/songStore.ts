import { browser } from '$app/environment';
import { supabase } from '$lib/supabase/client';
import type { Song, SongItem, SongLanguage } from '$lib/types/song';
import { openDB } from 'idb';
import { writable, derived } from 'svelte/store';

const DB_NAME = 'songbook';
const DB_VERSION = 1;
const STORE_NAME = 'songs';
const META_STORE = 'meta';
const SUPABASE_PAGE_SIZE = 1000;
const ITEM_FETCH_BATCH_SIZE = 150;
const PERIODIC_SYNC_INTERVAL_MS = 1000 * 60 * 60; // 1 hour
type SupabaseClient = NonNullable<typeof supabase>;

interface SongRecord {
	key: string;
	song: Song;
}

interface SyncResult {
	changed: boolean;
	songs: Song[];
}

async function getDb() {
	if (!browser) throw new Error('IndexedDB is only available in the browser');
	return openDB(DB_NAME, DB_VERSION, {
		upgrade(db) {
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: 'key' });
			}
			if (!db.objectStoreNames.contains(META_STORE)) {
				db.createObjectStore(META_STORE, { keyPath: 'key' });
			}
		}
	});
}

async function persistSongs(songs: Song[], syncedAt = new Date().toISOString()) {
	if (!browser) return;
	const db = await getDb();
	const tx = db.transaction([STORE_NAME, META_STORE], 'readwrite');
	const store = tx.objectStore(STORE_NAME);
	await store.clear();
	for (const song of songs) {
		await store.put({ key: `${song.id}-${song.language}`, song } satisfies SongRecord);
	}
	await tx.objectStore(META_STORE).put({ key: 'lastSynced', value: syncedAt });
	await tx.done;
}

async function persistLastSynced(syncedAt: string) {
	if (!browser) return;
	const db = await getDb();
	const tx = db.transaction(META_STORE, 'readwrite');
	await tx.objectStore(META_STORE).put({ key: 'lastSynced', value: syncedAt });
	await tx.done;
}

async function readCachedSongs(): Promise<Song[]> {
	if (!browser) return [];
	const db = await getDb();
	const store = db.transaction(STORE_NAME).objectStore(STORE_NAME);
	const records = await store.getAll();
	return records.map((record: SongRecord) => record.song);
}

async function readCachedSong(key: string): Promise<Song | null> {
	if (!browser) return null;
	const db = await getDb();
	const record = await db.transaction(STORE_NAME).objectStore(STORE_NAME).get(key);
	return (record as SongRecord | undefined)?.song ?? null;
}

async function readLastSynced(): Promise<string | null> {
	if (!browser) return null;
	const db = await getDb();
	const meta = await db.transaction(META_STORE).objectStore(META_STORE).get('lastSynced');
	return meta?.value ?? null;
}

function songKey(song: Pick<Song, 'id' | 'language'>) {
	return `${song.id}-${song.language}`;
}

function hasSongHeaderChanged(cachedSong: Song | undefined, remoteHeader: Song) {
	if (!cachedSong) return true;
	return (
		cachedSong.version !== remoteHeader.version ||
		(cachedSong.lastUpdatedAt ?? null) !== (remoteHeader.lastUpdatedAt ?? null) ||
		cachedSong.title !== remoteHeader.title ||
		cachedSong.source !== remoteHeader.source ||
		cachedSong.page !== remoteHeader.page ||
		cachedSong.externalIndex !== remoteHeader.externalIndex ||
		cachedSong.isPublic !== remoteHeader.isPublic
	);
}

function groupItemsBySong(items: SongItem[]) {
	const groupedItems = new Map<string, SongItem[]>();
	for (const item of items) {
		const key = songKey(item);
		if (!groupedItems.has(key)) {
			groupedItems.set(key, []);
		}
		groupedItems.get(key)!.push(item);
	}
	return groupedItems;
}

async function fetchSongsFromSupabase(cachedSongs: Song[]): Promise<SyncResult> {
	if (!supabase) {
		return {
			changed: false,
			songs: cachedSongs
		};
	}

	const client = supabase;
	const headers = (await fetchAllHeaders(client)) as unknown as Song[];
	const cachedByKey = new Map(cachedSongs.map((song) => [songKey(song), song]));
	const staleHeaders = headers.filter((header) =>
		hasSongHeaderChanged(cachedByKey.get(songKey(header)), header)
	);
	const fetchedItems = (await fetchAllItems(client, staleHeaders)) as unknown as SongItem[];
	const groupedItems = groupItemsBySong(fetchedItems);

	const mergedSongs = headers.map((header) => {
		const key = songKey(header);
		const cachedSong = cachedByKey.get(key);
		if (!hasSongHeaderChanged(cachedSong, header) && cachedSong) {
			return cachedSong;
		}

		const songItems = (groupedItems.get(key) ?? []).sort((a, b) => a.lineNumber - b.lineNumber);
		return {
			...header,
			items: songItems
		} satisfies Song;
	});

	const changed =
		staleHeaders.length > 0 ||
		mergedSongs.length !== cachedSongs.length ||
		cachedSongs.some((song) => !headers.some((header) => songKey(header) === songKey(song)));

	return { changed, songs: mergedSongs };
}

async function fetchAllHeaders(client: SupabaseClient) {
	const rows: Record<string, unknown>[] = [];
	let from = 0;
	while (true) {
		const { data, error } = await client
			.from('songsHeaders')
			.select('*')
			.eq('isPublic', true)
			.order('page')
			.range(from, from + SUPABASE_PAGE_SIZE - 1);

		if (error) throw error;
		if (!data?.length) break;
		rows.push(...data);
		if (data.length < SUPABASE_PAGE_SIZE) break;
		from += SUPABASE_PAGE_SIZE;
	}
	return rows;
}

function chunk<T>(items: T[], size: number) {
	const chunks: T[][] = [];
	for (let index = 0; index < items.length; index += size) {
		chunks.push(items.slice(index, index + size));
	}
	return chunks;
}

function groupHeaderIdsByLanguage(headers: Pick<Song, 'id' | 'language'>[]) {
	const grouped = new Map<SongLanguage, number[]>();
	for (const { id, language } of headers) {
		if (!grouped.has(language)) {
			grouped.set(language, []);
		}
		grouped.get(language)!.push(id);
	}
	return grouped;
}

async function fetchAllItems(client: SupabaseClient, headers: Pick<Song, 'id' | 'language'>[]) {
	if (!headers.length) return [];

	const rows: Record<string, unknown>[] = [];
	for (const [language, ids] of groupHeaderIdsByLanguage(headers)) {
		for (const batch of chunk(ids, ITEM_FETCH_BATCH_SIZE)) {
			let from = 0;
			while (true) {
				const { data, error } = await client
					.from('songsItems')
					.select('*')
					.eq('language', language)
					.in('id', batch)
					.order('id')
					.order('lineNumber')
					.range(from, from + SUPABASE_PAGE_SIZE - 1);

				if (error) throw error;
				if (!data?.length) break;
				rows.push(...data);
				if (data.length < SUPABASE_PAGE_SIZE) break;
				from += SUPABASE_PAGE_SIZE;
			}
		}
	}
	return rows;
}

function normalise(text: string) {
	return text
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
}

function sourceSortRank(source: string) {
	const normalisedSource = normalise(source);
	if (normalisedSource.includes('zborowy')) return 0;
	if (normalisedSource.includes('pielgrzym')) return 1;
	return 2;
}

function compareBySourcePriority(a: Pick<Song, 'source'>, b: Pick<Song, 'source'>) {
	return sourceSortRank(a.source) - sourceSortRank(b.source) || a.source.localeCompare(b.source);
}

function mapSearchable(song: Song) {
	return [
		song.title,
		song.externalIndex,
		String(song.page),
		song.items.map((item) => item.text).join(' ')
	]
		.map((value) => normalise(value))
		.join(' ');
}

export const songs = writable<Song[]>([]);
export const isSyncing = writable(false);
export const lastSynced = writable<string | null>(null);

let periodicSyncHandle: number | null = null;
let periodicSyncInFlight = false;

export async function loadSongs(force = false) {
	if (!browser) return;
	isSyncing.set(true);
	let cached: Song[] = [];
	let cachedLastSynced: string | null = null;
	try {
		cached = await readCachedSongs();
		cachedLastSynced = await readLastSynced();
		if (cached.length && !force) {
			songs.set(cached);
			lastSynced.set(cachedLastSynced);
		}
		const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
		if (online && supabase) {
			const syncResult = await fetchSongsFromSupabase(cached);
			const syncedAt = new Date().toISOString();
			if (!cached.length || syncResult.changed) {
				songs.set(syncResult.songs);
				await persistSongs(syncResult.songs, syncedAt);
			} else {
				await persistLastSynced(syncedAt);
			}
			lastSynced.set(syncedAt);
		} else if (!cached.length) {
			songs.set([]);
		}
	} catch (error) {
		console.error('Failed to load songs', error);
		if (cached.length) {
			songs.set(cached);
			lastSynced.set(cachedLastSynced);
		} else {
			songs.set([]);
			lastSynced.set(null);
		}
	} finally {
		isSyncing.set(false);
	}
}

async function performPeriodicSync() {
	if (!browser) return;
	if (!supabase) return;
	if (typeof navigator !== 'undefined' && !navigator.onLine) return;
	if (periodicSyncInFlight) return;
	if (getSnapshot(isSyncing)) return;

	periodicSyncInFlight = true;
	isSyncing.set(true);
	try {
		const currentSongs = getSnapshot(songs);
		const syncResult = await fetchSongsFromSupabase(currentSongs);
		const syncedAt = new Date().toISOString();
		if (syncResult.changed) {
			songs.set(syncResult.songs);
			await persistSongs(syncResult.songs, syncedAt);
		} else {
			await persistLastSynced(syncedAt);
		}
		lastSynced.set(syncedAt);
	} catch (error) {
		console.error('Failed to perform periodic sync', error);
	} finally {
		isSyncing.set(false);
		periodicSyncInFlight = false;
	}
}

export function startPeriodicSync(intervalMs = PERIODIC_SYNC_INTERVAL_MS) {
	if (!browser) return () => undefined;
	stopPeriodicSync();
	periodicSyncHandle = window.setInterval(() => {
		void performPeriodicSync();
	}, intervalMs);
	return stopPeriodicSync;
}

export function stopPeriodicSync() {
	if (periodicSyncHandle !== null) {
		clearInterval(periodicSyncHandle);
		periodicSyncHandle = null;
	}
}

export const searchableSongs = derived(songs, ($songs) =>
	$songs.map((song) => ({ key: `${song.id}-${song.language}`, song, search: mapSearchable(song) }))
);

export type SongSortMode = 'page' | 'alpha' | 'recent';
export type SongSourceFilter = 'all' | 'zborowy' | 'pielgrzym';

function matchesSourceFilter(song: Pick<Song, 'source'>, sourceFilter: SongSourceFilter) {
	const rank = sourceSortRank(song.source);
	if (sourceFilter === 'zborowy') return rank === 0;
	if (sourceFilter === 'pielgrzym') return rank === 1;
	return true;
}

export function filterSongs(
	collection: { key: string; song: Song; search: string }[],
	query: string,
	language: SongLanguage,
	favouritesOnly: boolean,
	favouritesList: string[],
	pageFilter?: number | null,
	sortMode: SongSortMode = 'page',
	sourceFilter: SongSourceFilter = 'all'
) {
	const trimmedQuery = query.trim();
	const normalisedQuery = normalise(trimmedQuery);
	const numericQuery = /^\d+$/.test(trimmedQuery) ? trimmedQuery : null;
	return collection
		.filter(({ song, search }) => {
			if (song.language !== language) return false;
			if (favouritesOnly && !favouritesList.includes(`${song.id}-${song.language}`)) return false;
			if (pageFilter && song.page !== pageFilter) return false;
			if (!matchesSourceFilter(song, sourceFilter)) return false;
			if (!normalisedQuery) return true;

			if (numericQuery) {
				const rank = sourceSortRank(song.source);
				const isZborowy = rank === 0;
				const isPielgrzyma = rank === 1;

				const matchesZborowy = isZborowy && String(song.page).includes(numericQuery);
				const matchesPielgrzyma =
					isPielgrzyma && normalise(song.externalIndex).includes(normalisedQuery);

				return matchesZborowy || matchesPielgrzyma;
			}

			return search.includes(normalisedQuery);
		})
		.map(({ song }) => song)
		.sort((a, b) => {
			const sourcePriority = compareBySourcePriority(a, b);
			if (sourcePriority !== 0) return sourcePriority;

			if (sortMode === 'alpha') {
				return a.title.localeCompare(b.title);
			}

			if (sortMode === 'recent') {
				const aTime = a.lastUpdatedAt ? new Date(a.lastUpdatedAt).getTime() : 0;
				const bTime = b.lastUpdatedAt ? new Date(b.lastUpdatedAt).getTime() : 0;
				return bTime - aTime || a.title.localeCompare(b.title);
			}

			return a.page - b.page || a.title.localeCompare(b.title);
		});
}

export async function getSongByKey(key: string): Promise<Song | null> {
	const [id, language] = key.split('-');
	const $songs = getSnapshot(songs);
	const existing = $songs.find((song) => songKey(song) === key);
	if (existing) return existing;
	if (!browser) return null;
	const cachedSong = await readCachedSong(key);
	if (cachedSong) return cachedSong;
	if (!supabase) return null;
	const { data: header } = await supabase
		.from('songsHeaders')
		.select('*')
		.eq('id', Number(id))
		.eq('language', language)
		.eq('isPublic', true)
		.maybeSingle();
	if (!header) return null;
	const { data: items } = await supabase
		.from('songsItems')
		.select('*')
		.eq('id', Number(id))
		.eq('language', language)
		.order('lineNumber');
	return {
		...(header as unknown as Song),
		items: (items ?? []) as unknown as SongItem[]
	} satisfies Song;
}

function getSnapshot<T>(store: { subscribe: (run: (value: T) => void) => () => void }): T {
	let value: T;
	const unsubscribe = store.subscribe(($value) => (value = $value));
	unsubscribe();
	return value!;
}
