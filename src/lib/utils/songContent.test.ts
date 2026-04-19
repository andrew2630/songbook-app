import { describe, expect, it } from 'vitest';
import type { SongItem } from '$lib/types/song';
import {
	getSongItemText,
	hasMeaningfulSongItemContent,
	isAdditionalSongItem,
	isChordLikeSongItem,
	isTechnicalSongItem,
	looksLikeChordLine,
	parseSongLanguage,
	shouldDisplaySongItem,
	splitPreviewSongItems
} from '$lib/utils/songContent';

function createItem(overrides: Partial<SongItem> = {}): SongItem {
	return {
		id: 1,
		language: 'PL',
		lineNumber: 1,
		type: 'TEXT',
		text: 'Sample line',
		alignment: 'LEFT',
		isBold: false,
		isItalics: false,
		...overrides
	};
}

describe('songContent', () => {
	it('recognises chord-only lines and rejects lyrics', () => {
		expect(looksLikeChordLine('Am F C G')).toBe(true);
		expect(looksLikeChordLine('N.C. | x / /')).toBe(true);
		expect(looksLikeChordLine('Amazing grace')).toBe(false);
		expect(looksLikeChordLine('   ')).toBe(false);
	});

	it('detects chord-like items from explicit types and inferred text', () => {
		expect(isChordLikeSongItem(createItem({ type: 'CHORDS', text: 'not even checked' }))).toBe(
			true
		);
		expect(isChordLikeSongItem(createItem({ type: null, text: 'Dm G C' }))).toBe(true);
		expect(isChordLikeSongItem(createItem({ type: 'TEXT', text: 'Blessed assurance' }))).toBe(
			false
		);
	});

	it('splits preview items after visible lyric lines and keeps trailing blank spacer', () => {
		const items: SongItem[] = [
			createItem({ text: 'First verse' }),
			createItem({ type: 'CHORDS', text: 'C G Am F' }),
			createItem({ text: '' }),
			createItem({ text: 'Second verse' }),
			createItem({ text: '' }),
			createItem({ type: 'TECHNICAL', text: 'Capo 2' }),
			createItem({ text: 'Third verse' }),
			createItem({ text: 'Fourth verse' })
		];

		const { previewItems, remainingItems } = splitPreviewSongItems(items, 2);

		expect(previewItems.map(getSongItemText)).toEqual(['First verse', '', 'Second verse', '']);
		expect(remainingItems.map(getSongItemText)).toEqual(['Third verse', 'Fourth verse']);
	});

	it('keeps explicit chord rows meaningful even when they only contain spacing', () => {
		expect(hasMeaningfulSongItemContent(createItem({ type: 'TEXT', text: '   ' }))).toBe(false);
		expect(hasMeaningfulSongItemContent(createItem({ type: 'CHORDS', text: '   ' }))).toBe(true);
	});

	it('classifies additional and technical rows by normalized type', () => {
		expect(isAdditionalSongItem(' additional ' as unknown as SongItem['type'])).toBe(true);
		expect(isTechnicalSongItem('technical' as unknown as SongItem['type'])).toBe(true);
		expect(isAdditionalSongItem('TEXT')).toBe(false);
		expect(isTechnicalSongItem(null)).toBe(false);
	});

	it('switches visibility rules between basic and chords view', () => {
		const lyricItem = createItem({ type: 'TEXT', text: 'Lyric line' });
		const chordItem = createItem({ type: 'CHORDS', text: 'C G' });
		const technicalItem = createItem({ type: 'TECHNICAL', text: 'Intro x2' });

		expect(shouldDisplaySongItem(lyricItem, 'basic')).toBe(true);
		expect(shouldDisplaySongItem(chordItem, 'basic')).toBe(false);
		expect(shouldDisplaySongItem(chordItem, 'chords')).toBe(true);
		expect(shouldDisplaySongItem(technicalItem, 'basic')).toBe(false);
		expect(shouldDisplaySongItem(technicalItem, 'chords')).toBe(true);
	});

	it('parses supported song languages case-insensitively', () => {
		expect(parseSongLanguage('pl')).toBe('PL');
		expect(parseSongLanguage('EN')).toBe('EN');
		expect(parseSongLanguage('de')).toBeUndefined();
		expect(parseSongLanguage(null)).toBeUndefined();
	});
});
