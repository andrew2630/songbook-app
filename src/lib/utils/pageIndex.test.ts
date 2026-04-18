import { describe, expect, it } from 'vitest';
import type { Song } from '$lib/types/song';
import { buildPageIndex, songsByPage } from '$lib/utils/pageIndex';

function createSong(id: number, page: number): Song {
	return {
		id,
		language: 'PL',
		version: 1,
		title: `Song ${id}`,
		source: 'Test',
		page,
		externalIndex: `${id}`,
		isPublic: true,
		items: []
	};
}

describe('pageIndex', () => {
	it('builds sorted page groups from unique pages', () => {
		const songs = [3, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((page, index) =>
			createSong(index + 1, page)
		);

		expect(buildPageIndex(songs)).toEqual([
			{ label: '1 - 10', pages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
			{ label: '11 - 12', pages: [11, 12] }
		]);
	});

	it('groups songs by page without dropping duplicates', () => {
		const first = createSong(1, 42);
		const second = createSong(2, 42);
		const third = createSong(3, 43);

		expect(songsByPage([first, second, third])).toEqual({
			42: [first, second],
			43: [third]
		});
	});
});
