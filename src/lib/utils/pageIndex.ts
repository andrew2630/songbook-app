import type { Song } from '$lib/types/song';

export interface PageIndexGroup {
	label: string;
	pages: number[];
}

export function buildPageIndex(songs: Song[]): PageIndexGroup[] {
	const uniquePages = Array.from(new Set(songs.map((song) => song.page))).sort((a, b) => a - b);
	const groups: PageIndexGroup[] = [];

	for (let i = 0; i < uniquePages.length; i += 10) {
		const chunk = uniquePages.slice(i, i + 10);
		const first = chunk[0];
		const last = chunk[chunk.length - 1];
		groups.push({ label: `${first} – ${last}`, pages: chunk });
	}

	return groups;
}

export function songsByPage(songs: Song[]): Record<number, Song[]> {
	return songs.reduce<Record<number, Song[]>>((acc, song) => {
		if (!acc[song.page]) acc[song.page] = [];
		acc[song.page].push(song);
		return acc;
	}, {});
}
