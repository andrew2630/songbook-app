// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

async function loadSongNavigation(browser: boolean) {
	vi.resetModules();
	vi.doMock('$app/environment', () => ({ browser }));
	return import('$lib/utils/songNavigation');
}

describe('songNavigation', () => {
	beforeEach(() => {
		window.sessionStorage.clear();
		window.history.replaceState({}, '', '/');
	});

	it('falls back safely outside the browser runtime', async () => {
		const navigation = await loadSongNavigation(false);

		expect(navigation.getCurrentAppPath('/fallback')).toBe('/fallback');
		navigation.rememberSongReturnPath('/song/12');
		navigation.rememberSongListPath('/?page=2');
		expect(navigation.hasRememberedSongReturnPath('/song/12')).toBe(false);
		expect(navigation.getRememberedSongListPath()).toBeNull();
	});

	it('reads current location and persists remembered paths in session storage', async () => {
		window.history.pushState({}, '', '/songs?q=grace#chorus');
		const navigation = await loadSongNavigation(true);

		expect(navigation.getCurrentAppPath()).toBe('/songs?q=grace#chorus');

		navigation.rememberSongReturnPath('/song/15');
		navigation.rememberSongListPath('/?lang=EN');

		expect(navigation.hasRememberedSongReturnPath('/song/15')).toBe(true);
		expect(navigation.hasRememberedSongReturnPath('/song/16')).toBe(false);
		expect(navigation.hasRememberedSongReturnPath(null)).toBe(false);
		expect(navigation.getRememberedSongListPath()).toBe('/?lang=EN');
	});
});
