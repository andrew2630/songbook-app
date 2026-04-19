// @vitest-environment jsdom

import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Song, SongItem } from '$lib/types/song';

type SupabaseDataset = {
	headers: Array<Song | Record<string, unknown>>;
	items: Array<SongItem | Record<string, unknown>>;
	failHeaders?: boolean;
	failItems?: boolean;
};

function createSong(id: number, overrides: Partial<Song> = {}): Song {
	return {
		id,
		language: 'PL',
		version: 1,
		title: `Song ${id}`,
		source: 'Spiewnik Zborowy',
		page: id,
		externalIndex: `${id}`,
		isPublic: true,
		items: [],
		...overrides
	};
}

function createItem(id: number, lineNumber: number, overrides: Partial<SongItem> = {}): SongItem {
	return {
		id,
		language: 'PL',
		lineNumber,
		type: 'TEXT',
		text: `Line ${lineNumber}`,
		alignment: 'LEFT',
		isBold: false,
		isItalics: false,
		...overrides
	};
}

function songKey(song: Pick<Song, 'id' | 'language'>) {
	return `${song.id}-${song.language}`;
}

function getField(row: Song | SongItem | Record<string, unknown>, field: string) {
	return (row as Record<string, unknown>)[field];
}

class QueryBuilder {
	data: unknown = [];
	error: Error | null = null;
	private readonly filters: Array<{ kind: 'eq' | 'in'; field: string; value: unknown }> = [];
	private readonly orders: string[] = [];
	private rangeArgs: [number, number] | null = null;
	private single = false;

	constructor(
		private readonly table: 'songsHeaders' | 'songsItems',
		private readonly dataset: SupabaseDataset
	) {
		this.recompute();
	}

	select() {
		return this.recompute();
	}

	eq(field: string, value: unknown) {
		this.filters.push({ kind: 'eq', field, value });
		return this.recompute();
	}

	in(field: string, values: unknown[]) {
		this.filters.push({ kind: 'in', field, value: values });
		return this.recompute();
	}

	order(field: string) {
		this.orders.push(field);
		return this.recompute();
	}

	range(from: number, to: number) {
		this.rangeArgs = [from, to];
		return this.recompute();
	}

	maybeSingle() {
		this.single = true;
		return this.recompute();
	}

	private recompute() {
		const shouldFail =
			(this.table === 'songsHeaders' && this.dataset.failHeaders) ||
			(this.table === 'songsItems' && this.dataset.failItems);
		if (shouldFail) {
			this.error = new Error(`${this.table} query failed`);
			this.data = this.single ? null : [];
			return this;
		}

		let rows = [...(this.table === 'songsHeaders' ? this.dataset.headers : this.dataset.items)];
		for (const filter of this.filters) {
			rows = rows.filter((row) =>
				filter.kind === 'eq'
					? getField(row, filter.field) === filter.value
					: (filter.value as unknown[]).includes(getField(row, filter.field))
			);
		}

		for (const field of this.orders) {
			rows.sort((a, b) => {
				const left = getField(a, field);
				const right = getField(b, field);
				if (typeof left === 'number' && typeof right === 'number') return left - right;
				return String(left).localeCompare(String(right));
			});
		}

		if (this.rangeArgs) {
			rows = rows.slice(this.rangeArgs[0], this.rangeArgs[1] + 1);
		}

		this.error = null;
		this.data = this.single ? (rows[0] ?? null) : rows;
		return this;
	}
}

function createSupabaseMock(dataset: SupabaseDataset) {
	return {
		from: vi.fn((table: 'songsHeaders' | 'songsItems') => new QueryBuilder(table, dataset))
	};
}

function createIndexedDbFixture(cachedSongs: Song[] = [], lastSynced: string | null = null) {
	const songsStore = new Map(
		cachedSongs.map((song) => [songKey(song), { key: songKey(song), song }] as const)
	);
	const metaStore = new Map<string, { key: string; value: string }>(
		lastSynced ? ([['lastSynced', { key: 'lastSynced', value: lastSynced }]] as const) : []
	);

	const openDB = vi.fn(async (_name, _version, options?: { upgrade?: (db: unknown) => void }) => {
		options?.upgrade?.({
			objectStoreNames: {
				contains: () => true
			},
			createObjectStore: vi.fn()
		});

		return {
			transaction(storeNames: string | string[]) {
				const objectStore = (name: string) => {
					if (name === 'songs') {
						return {
							clear: vi.fn(async () => songsStore.clear()),
							put: vi.fn(async (record: { key: string; song: Song }) => {
								songsStore.set(record.key, record);
							}),
							getAll: vi.fn(async () => [...songsStore.values()]),
							get: vi.fn(async (key: string) => songsStore.get(key))
						};
					}

					return {
						put: vi.fn(async (record: { key: string; value: string }) => {
							metaStore.set(record.key, record);
						}),
						get: vi.fn(async (key: string) => metaStore.get(key))
					};
				};

				return {
					objectStore,
					done: Promise.resolve(),
					store: objectStore(Array.isArray(storeNames) ? storeNames[0] : storeNames)
				};
			}
		};
	});

	return { metaStore, openDB, songsStore };
}

async function loadSongStore({
	browser = true,
	cachedSongs = [],
	lastSynced = null,
	online = true,
	supabase = null
}: {
	browser?: boolean;
	cachedSongs?: Song[];
	lastSynced?: string | null;
	online?: boolean;
	supabase?: ReturnType<typeof createSupabaseMock> | null;
} = {}) {
	vi.resetModules();
	const indexedDb = createIndexedDbFixture(cachedSongs, lastSynced);

	Object.defineProperty(window.navigator, 'onLine', {
		configurable: true,
		value: online
	});

	vi.doMock('$app/environment', () => ({ browser }));
	vi.doMock('$lib/supabase/client', () => ({ supabase }));
	vi.doMock('idb', () => ({ openDB: indexedDb.openDB }));

	const module = await import('$lib/stores/songStore');
	return { indexedDb, module };
}

describe('songStore', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('builds searchable entries with normalized text', async () => {
		const { module } = await loadSongStore({ browser: false });
		const song = createSong(1, {
			title: 'Laska',
			externalIndex: 'A-12',
			items: [createItem(1, 1, { text: 'Spiewaj glosno' })]
		});

		module.songs.set([song]);

		expect(get(module.searchableSongs)).toHaveLength(1);
		expect(get(module.searchableSongs)[0]).toMatchObject({
			key: '1-PL',
			song
		});
		expect(get(module.searchableSongs)[0].search).toContain('laska');
		expect(get(module.searchableSongs)[0].search).toContain('spiewaj glosno');
	});

	it('filters songs by query, favourites, page, source and sort mode', async () => {
		const { module } = await loadSongStore({ browser: false });
		const zborowy = createSong(1, {
			title: 'Alpha',
			page: 123,
			source: 'Spiewnik Zborowy',
			items: [createItem(1, 1, { text: 'grace' })]
		});
		const pielgrzym = createSong(2, {
			title: 'Beta',
			page: 8,
			source: 'Spiewnik Pielgrzyma',
			externalIndex: '123A',
			lastUpdatedAt: '2026-04-18T10:00:00.000Z',
			items: [createItem(2, 1, { text: 'chorus' })]
		});
		const other = createSong(3, {
			title: 'Gamma',
			page: 123,
			source: 'Inne',
			lastUpdatedAt: '2026-04-19T10:00:00.000Z'
		});

		const collection = [zborowy, pielgrzym, other].map((song) => ({
			key: songKey(song),
			song,
			search: `${song.title.toLowerCase()} ${song.externalIndex.toLowerCase()} ${song.page} ${song.items
				.map((item) => item.text)
				.join(' ')
				.toLowerCase()}`
		}));

		expect(
			module
				.filterSongs(collection, '123', 'PL', false, [], null, 'page', 'all')
				.map((song) => song.id)
		).toEqual([1, 2]);
		expect(
			module
				.filterSongs(collection, 'beta', 'PL', false, [], null, 'alpha', 'all')
				.map((song) => song.id)
		).toEqual([2]);
		expect(
			module
				.filterSongs(collection, '', 'PL', true, ['2-PL'], null, 'recent', 'pielgrzym')
				.map((song) => song.id)
		).toEqual([2]);
		expect(
			module
				.filterSongs(collection, '', 'PL', false, [], 123, 'recent', 'all')
				.map((song) => song.id)
		).toEqual([1, 3]);
	});

	it('loads cached songs when offline and keeps the last sync marker', async () => {
		const cachedSong = createSong(1, { items: [createItem(1, 1)] });
		const { module } = await loadSongStore({
			browser: true,
			cachedSongs: [cachedSong],
			lastSynced: '2026-04-18T08:00:00.000Z',
			online: false
		});

		await module.loadSongs();

		expect(get(module.songs)).toEqual([cachedSong]);
		expect(get(module.lastSynced)).toBe('2026-04-18T08:00:00.000Z');
		expect(get(module.isSyncing)).toBe(false);
	});

	it('syncs changed songs from supabase and persists them in indexeddb', async () => {
		const cachedSong = createSong(1, {
			title: 'Old title',
			version: 1,
			lastUpdatedAt: '2026-04-18T08:00:00.000Z',
			items: [createItem(1, 1, { text: 'Old line' })]
		});
		const remoteHeader = {
			...cachedSong,
			title: 'New title',
			version: 2,
			lastUpdatedAt: '2026-04-19T08:00:00.000Z'
		};
		const supabase = createSupabaseMock({
			headers: [remoteHeader],
			items: [createItem(1, 2, { text: 'Second line' }), createItem(1, 1, { text: 'First line' })]
		});
		const { indexedDb, module } = await loadSongStore({
			browser: true,
			cachedSongs: [cachedSong],
			lastSynced: '2026-04-18T08:00:00.000Z',
			online: true,
			supabase
		});

		await module.loadSongs();

		expect(get(module.songs)).toEqual([
			{
				...remoteHeader,
				items: [createItem(1, 1, { text: 'First line' }), createItem(1, 2, { text: 'Second line' })]
			}
		]);
		expect(indexedDb.songsStore.get('1-PL')?.song.title).toBe('New title');
		expect(indexedDb.metaStore.get('lastSynced')?.value).toMatch(/2026-04-19T/);
		expect(supabase.from).toHaveBeenCalledWith('songsHeaders');
		expect(supabase.from).toHaveBeenCalledWith('songsItems');
	});

	it('falls back to cached songs when remote sync fails', async () => {
		const cachedSong = createSong(1, { items: [createItem(1, 1)] });
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		const { module } = await loadSongStore({
			browser: true,
			cachedSongs: [cachedSong],
			lastSynced: '2026-04-18T08:00:00.000Z',
			online: true,
			supabase: createSupabaseMock({
				headers: [],
				items: [],
				failHeaders: true
			})
		});

		await module.loadSongs();

		expect(get(module.songs)).toEqual([cachedSong]);
		expect(get(module.lastSynced)).toBe('2026-04-18T08:00:00.000Z');
		expect(errorSpy).toHaveBeenCalled();
		errorSpy.mockRestore();
	});

	it('returns songs from memory, cache, remote fetch or null depending on availability', async () => {
		const inMemorySong = createSong(1, { items: [createItem(1, 1)] });
		const cachedSong = createSong(2, { items: [createItem(2, 1)] });
		const remoteHeader = createSong(3, { items: [], title: 'Remote' });
		const remoteItems = [createItem(3, 1, { text: 'Remote line' })];

		const localStore = await loadSongStore({ browser: true });
		localStore.module.songs.set([inMemorySong]);
		await expect(localStore.module.getSongByKey('1-PL')).resolves.toEqual(inMemorySong);

		const cachedStore = await loadSongStore({
			browser: true,
			cachedSongs: [cachedSong]
		});
		await expect(cachedStore.module.getSongByKey('2-PL')).resolves.toEqual(cachedSong);

		const remoteStore = await loadSongStore({
			browser: true,
			supabase: createSupabaseMock({
				headers: [remoteHeader],
				items: remoteItems
			})
		});
		await expect(remoteStore.module.getSongByKey('3-PL')).resolves.toEqual({
			...remoteHeader,
			items: remoteItems
		});

		const missingStore = await loadSongStore({
			browser: false,
			supabase: createSupabaseMock({ headers: [], items: [] })
		});
		await expect(missingStore.module.getSongByKey('99-PL')).resolves.toBeNull();
	});

	it('starts and stops periodic sync, updating lastSynced on each run', async () => {
		vi.useFakeTimers();
		const supabase = createSupabaseMock({
			headers: [createSong(1, { items: [], title: 'Periodic' })],
			items: [createItem(1, 1, { text: 'Tick' })]
		});
		const { module } = await loadSongStore({
			browser: true,
			online: true,
			supabase
		});

		const stop = module.startPeriodicSync(25);
		await vi.advanceTimersByTimeAsync(25);
		expect(get(module.lastSynced)).toMatch(/2026-04-19T/);

		const callsAfterFirstTick = supabase.from.mock.calls.length;
		stop();
		await vi.advanceTimersByTimeAsync(25);
		expect(supabase.from).toHaveBeenCalledTimes(callsAfterFirstTick);
	});

	it('returns a noop stop handler when periodic sync cannot run in the browser', async () => {
		const { module } = await loadSongStore({ browser: false });
		expect(module.startPeriodicSync()).toBeTypeOf('function');
	});
});
