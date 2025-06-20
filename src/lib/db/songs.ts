import { openDB } from 'idb';

export type Song = Record<string, unknown> & { id: number; updated_at: string };

const DB_NAME = 'songbook';
const DB_VERSION = 1;
const SONG_STORE = 'songs';
const META_STORE = 'meta';

async function getDB() {
	return openDB(DB_NAME, DB_VERSION, {
		upgrade(db) {
			if (!db.objectStoreNames.contains(SONG_STORE)) {
				db.createObjectStore(SONG_STORE, { keyPath: 'id' });
			}
			if (!db.objectStoreNames.contains(META_STORE)) {
				db.createObjectStore(META_STORE);
			}
		}
	});
}

export async function getAllSongs() {
	const db = await getDB();
	return db.getAll(SONG_STORE);
}

export async function saveSongs(songs: Song[]) {
	const db = await getDB();
	const tx = db.transaction(SONG_STORE, 'readwrite');
	for (const song of songs) {
		tx.store.put(song);
	}
	await tx.done;
}

export async function getLastSync() {
	const db = await getDB();
	return (await db.get(META_STORE, 'lastSync')) as string | null;
}

export async function setLastSync(date: string) {
	const db = await getDB();
	await db.put(META_STORE, date, 'lastSync');
}
