import { beforeEach, describe, expect, it, vi } from 'vitest';

const openDB = vi.fn();

vi.mock('idb', () => ({
	openDB
}));

type DbSong = { id: number; updated_at: string; title: string };

function createDbFixture(existingStores: string[] = ['songs', 'meta']) {
	const storedSongs = new Map<number, DbSong>();
	const storedMeta = new Map<string, string>();
	const createObjectStore = vi.fn();
	const objectStoreNames = {
		contains: vi.fn((name: string) => existingStores.includes(name))
	};
	const db = {
		getAll: vi.fn(async () => [...storedSongs.values()]),
		get: vi.fn(async (_store: string, key: string) => storedMeta.get(key) ?? null),
		put: vi.fn(async (_store: string, value: string, key: string) => {
			storedMeta.set(key, value);
		}),
		transaction: vi.fn(() => ({
			store: {
				put: vi.fn((song: DbSong) => {
					storedSongs.set(song.id, song);
				})
			},
			done: Promise.resolve()
		}))
	};

	openDB.mockImplementation(
		async (_name, _version, options?: { upgrade?: (db: unknown) => void }) => {
			options?.upgrade?.({
				objectStoreNames,
				createObjectStore
			});
			return db;
		}
	);

	return { createObjectStore, db, storedMeta, storedSongs };
}

describe('db/songs', () => {
	beforeEach(() => {
		vi.resetModules();
		openDB.mockReset();
	});

	it('creates missing stores during upgrade and reads all songs', async () => {
		const fixture = createDbFixture([]);
		fixture.storedSongs.set(1, { id: 1, updated_at: '2026-04-19T00:00:00.000Z', title: 'Alpha' });
		const songsDb = await import('$lib/db/songs');

		await expect(songsDb.getAllSongs()).resolves.toEqual([
			{ id: 1, updated_at: '2026-04-19T00:00:00.000Z', title: 'Alpha' }
		]);
		expect(fixture.createObjectStore).toHaveBeenCalledWith('songs', { keyPath: 'id' });
		expect(fixture.createObjectStore).toHaveBeenCalledWith('meta');
	});

	it('does not recreate stores that already exist', async () => {
		const fixture = createDbFixture(['songs', 'meta']);
		const songsDb = await import('$lib/db/songs');

		await songsDb.getAllSongs();
		expect(fixture.createObjectStore).not.toHaveBeenCalled();
	});

	it('writes song records through a readwrite transaction', async () => {
		const fixture = createDbFixture();
		const songsDb = await import('$lib/db/songs');
		const batch = [
			{ id: 1, updated_at: '2026-04-19T00:00:00.000Z', title: 'Alpha' },
			{ id: 2, updated_at: '2026-04-19T00:00:00.000Z', title: 'Beta' }
		];

		await songsDb.saveSongs(batch);

		expect([...fixture.storedSongs.values()]).toEqual(batch);
		expect(fixture.db.transaction).toHaveBeenCalledWith('songs', 'readwrite');
	});

	it('reads and writes the last sync marker', async () => {
		const fixture = createDbFixture();
		fixture.storedMeta.set('lastSync', '2026-04-18T10:00:00.000Z');
		const songsDb = await import('$lib/db/songs');

		await expect(songsDb.getLastSync()).resolves.toBe('2026-04-18T10:00:00.000Z');

		await songsDb.setLastSync('2026-04-19T10:00:00.000Z');
		expect(fixture.storedMeta.get('lastSync')).toBe('2026-04-19T10:00:00.000Z');
	});
});
