import type { Song, SongItem, SongLanguage, SongViewMode } from '$lib/types/song';

const VALID_SONG_LANGUAGES: SongLanguage[] = ['PL', 'EN'];
const CHORD_TOKEN_PATTERN =
	/^(?:[A-H](?:#|b)?(?:m|maj|min|sus|add|dim|aug)?\d*(?:\/[A-H](?:#|b)?)?|N\.C\.|NC|x|X|[|()[\]{}:/\\.-]+)$/;

export type SongContentItem = SongItem;

export function getSongItemText(item: SongContentItem) {
	return typeof item.text === 'string' ? item.text : '';
}

export function normaliseSongItemType(itemType: SongContentItem['type']) {
	return typeof itemType === 'string' ? itemType.trim().toUpperCase() : '';
}

export function looksLikeChordLine(text: string) {
	const normalizedText = text.trim();
	if (!normalizedText) return false;

	const tokens = normalizedText.split(/\s+/);
	return tokens.every((token) => CHORD_TOKEN_PATTERN.test(token));
}

export function isChordLikeSongItem(item: SongContentItem) {
	const normalizedType = normaliseSongItemType(item.type);
	if (normalizedType === 'CHORDS' || normalizedType === 'CORDS' || normalizedType === 'TABS') {
		return true;
	}

	return normalizedType === '' && looksLikeChordLine(getSongItemText(item));
}

export function isAdditionalSongItem(itemType: SongContentItem['type']) {
	return normaliseSongItemType(itemType) === 'ADDITIONAL';
}

export function isTechnicalSongItem(itemType: SongContentItem['type']) {
	return normaliseSongItemType(itemType) === 'TECHNICAL';
}

export function hasMeaningfulSongItemContent(item: SongContentItem) {
	const text = getSongItemText(item);
	return isChordLikeSongItem(item) ? text.length > 0 : text.trim().length > 0;
}

export function shouldDisplaySongItem(item: SongContentItem, viewMode: SongViewMode) {
	if (isTechnicalSongItem(item.type)) {
		return viewMode === 'chords';
	}

	return !isChordLikeSongItem(item) || viewMode === 'chords';
}

export function isPreviewRenderableSongItem(item: SongContentItem) {
	return !isChordLikeSongItem(item) && !isTechnicalSongItem(item.type);
}

export function splitPreviewSongItems(items: Song['items'], visibleLineLimit: number) {
	const printableItems = items.filter(isPreviewRenderableSongItem);
	let visibleLineCount = 0;
	let cutoffIndex = printableItems.length;

	for (let index = 0; index < printableItems.length; index += 1) {
		if (getSongItemText(printableItems[index]).trim().length) {
			visibleLineCount += 1;
		}
		if (visibleLineCount >= visibleLineLimit) {
			cutoffIndex = index + 1;
			break;
		}
	}

	while (
		cutoffIndex < printableItems.length &&
		getSongItemText(printableItems[cutoffIndex]).trim().length === 0
	) {
		cutoffIndex += 1;
	}

	return {
		previewItems: printableItems.slice(0, cutoffIndex),
		remainingItems: printableItems.slice(cutoffIndex)
	};
}

export function parseSongLanguage(value: string | null): SongLanguage | undefined {
	if (!value) return undefined;
	const normalizedValue = value.toUpperCase();
	return VALID_SONG_LANGUAGES.includes(normalizedValue as SongLanguage)
		? (normalizedValue as SongLanguage)
		: undefined;
}
