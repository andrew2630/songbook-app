export const SONG_TEXT_SCALE_MIN = -4;
export const SONG_TEXT_SCALE_MAX = 8;
export const SONG_TEXT_SCALE_STEP_PERCENT = 4;
export const DEFAULT_SONG_TEXT_SCALE = 0;

export function isSongTextScale(value: unknown): value is number {
	return (
		typeof value === 'number' &&
		Number.isInteger(value) &&
		value >= SONG_TEXT_SCALE_MIN &&
		value <= SONG_TEXT_SCALE_MAX
	);
}

export function getSongTextZoomPercent(scale: number) {
	return 100 + scale * SONG_TEXT_SCALE_STEP_PERCENT;
}

export function getSongTextSizeRem(scale: number, baseSizeRem = 1) {
	return Number((baseSizeRem + scale * 0.04).toFixed(2));
}

export function getSongTextSpacerHeightRem(scale: number, baseHeightRem = 0.56) {
	return Number(Math.max(0.5, baseHeightRem + scale * 0.03).toFixed(2));
}
