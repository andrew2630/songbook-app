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
type SupabaseClient = NonNullable<typeof supabase>;

interface SongRecord {
  key: string;
  song: Song;
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

async function persistSongs(songs: Song[]) {
  if (!browser) return;
  const db = await getDb();
  const tx = db.transaction([STORE_NAME, META_STORE], 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  for (const song of songs) {
    await store.put({ key: `${song.id}-${song.language}`, song } satisfies SongRecord);
  }
  await tx.objectStore(META_STORE).put({ key: 'lastSynced', value: new Date().toISOString() });
  await tx.done;
}

async function readCachedSongs(): Promise<Song[]> {
  if (!browser) return [];
  const db = await getDb();
  const store = db.transaction(STORE_NAME).objectStore(STORE_NAME);
  const records = await store.getAll();
  return records.map((record: SongRecord) => record.song);
}

async function readLastSynced(): Promise<string | null> {
  if (!browser) return null;
  const db = await getDb();
  const meta = await db.transaction(META_STORE).objectStore(META_STORE).get('lastSynced');
  return meta?.value ?? null;
}

async function fetchSongsFromSupabase(): Promise<Song[]> {
  if (!supabase) return [];

  const client = supabase;
  const headers = await fetchAllHeaders(client);
  const items = await fetchAllItems(client);

  const groupedItems = new Map<string, SongItem[]>();
  for (const item of items ?? []) {
    const key = `${item.id}-${item.language}`;
    if (!groupedItems.has(key)) {
      groupedItems.set(key, []);
    }
    groupedItems.get(key)!.push(item as unknown as SongItem);
  }

  return (headers ?? []).map((header) => {
    const key = `${header.id}-${header.language}`;
    const songItems = groupedItems.get(key) ?? [];
    return {
      ...(header as unknown as Song),
      items: songItems.sort((a, b) => a.lineNumber - b.lineNumber)
    } satisfies Song;
  });
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

async function fetchAllItems(client: SupabaseClient) {
  const rows: Record<string, unknown>[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await client
      .from('songsItems')
      .select('*')
      .order('lineNumber')
      .range(from, from + SUPABASE_PAGE_SIZE - 1);

    if (error) throw error;
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < SUPABASE_PAGE_SIZE) break;
    from += SUPABASE_PAGE_SIZE;
  }
  return rows;
}

function normalise(text: string) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
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

export async function loadSongs(force = false) {
  if (!browser) return;
  isSyncing.set(true);
  try {
    const cached = await readCachedSongs();
    if (cached.length && !force) {
      songs.set(cached);
    }
    const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (online && supabase) {
      const remoteSongs = await fetchSongsFromSupabase();
      songs.set(remoteSongs);
      await persistSongs(remoteSongs);
      lastSynced.set(new Date().toISOString());
    } else if (!cached.length) {
      songs.set([]);
    } else {
      lastSynced.set(await readLastSynced());
    }
  } catch (error) {
    console.error('Failed to load songs', error);
    songs.set([]);
  } finally {
    isSyncing.set(false);
  }
}

export const searchableSongs = derived(songs, ($songs) =>
  $songs.map((song) => ({ key: `${song.id}-${song.language}`, song, search: mapSearchable(song) }))
);

export function filterSongs(
  collection: { key: string; song: Song; search: string }[],
  query: string,
  language: SongLanguage,
  favouritesOnly: boolean,
  favouritesList: string[],
  pageFilter?: number | null
) {
  const normalisedQuery = normalise(query.trim());
  return collection
    .filter(({ song, search }) => {
      if (song.language !== language) return false;
      if (favouritesOnly && !favouritesList.includes(`${song.id}-${song.language}`)) return false;
      if (pageFilter && song.page !== pageFilter) return false;
      if (!normalisedQuery) return true;
      return search.includes(normalisedQuery);
    })
    .map(({ song }) => song)
    .sort((a, b) => a.page - b.page || a.title.localeCompare(b.title));
}

export async function getSongByKey(key: string): Promise<Song | null> {
  const [id, language] = key.split('-');
  const $songs = getSnapshot(songs);
  const existing = $songs.find((song) => `${song.id}-${song.language}` === key);
  if (existing) return existing;
  if (!browser) return null;
  const cached = await readCachedSongs();
  const cachedSong = cached.find((song) => `${song.id}-${song.language}` === key);
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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return value!;
}
