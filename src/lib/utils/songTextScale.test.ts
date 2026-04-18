import { describe, expect, it } from 'vitest';
import {
	DEFAULT_SONG_TEXT_SCALE,
	SONG_TEXT_SCALE_MAX,
	SONG_TEXT_SCALE_MIN,
	getSongTextSizeRem,
	getSongTextSpacerHeightRem,
	getSongTextZoomPercent,
	isSongTextScale
} from '$lib/utils/songTextScale';

describe('songTextScale', () => {
	it('accepts only integer scales inside supported bounds', () => {
		expect(isSongTextScale(DEFAULT_SONG_TEXT_SCALE)).toBe(true);
		expect(isSongTextScale(SONG_TEXT_SCALE_MIN)).toBe(true);
		expect(isSongTextScale(SONG_TEXT_SCALE_MAX)).toBe(true);
		expect(isSongTextScale(SONG_TEXT_SCALE_MIN - 1)).toBe(false);
		expect(isSongTextScale(SONG_TEXT_SCALE_MAX + 1)).toBe(false);
		expect(isSongTextScale(1.5)).toBe(false);
		expect(isSongTextScale('2')).toBe(false);
	});

	it('derives zoom percentage and rem sizes predictably', () => {
		expect(getSongTextZoomPercent(3)).toBe(112);
		expect(getSongTextSizeRem(3)).toBe(1.12);
		expect(getSongTextSizeRem(-2, 1.2)).toBe(1.12);
	});

	it('never shrinks spacer height below the visual floor', () => {
		expect(getSongTextSpacerHeightRem(2)).toBe(0.62);
		expect(getSongTextSpacerHeightRem(-10)).toBe(0.5);
	});
});
