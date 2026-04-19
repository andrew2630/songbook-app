// @vitest-environment jsdom

import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const localeSet = vi.fn();

vi.mock('svelte-i18n', () => ({
	locale: {
		set: localeSet
	}
}));

type ThemeMediaController = {
	get matches(): boolean;
	set matches(value: boolean);
	trigger(): void;
};

function installThemeMediaQuery(initialMatches = false) {
	let matches = initialMatches;
	const listeners = new Set<() => void>();

	Object.defineProperty(window, 'matchMedia', {
		configurable: true,
		value: vi.fn((query: string) => ({
			media: query,
			get matches() {
				return matches;
			},
			addEventListener: (_event: string, listener: () => void) => {
				listeners.add(listener);
			},
			removeEventListener: (_event: string, listener: () => void) => {
				listeners.delete(listener);
			}
		}))
	});

	return {
		get matches() {
			return matches;
		},
		set matches(value: boolean) {
			matches = value;
		},
		trigger() {
			for (const listener of listeners) {
				listener();
			}
		}
	} satisfies ThemeMediaController;
}

async function loadPreferences(browser: boolean) {
	vi.resetModules();
	vi.doMock('$app/environment', () => ({ browser }));
	return import('$lib/stores/preferences');
}

describe('preferences store', () => {
	beforeEach(() => {
		localStorage.clear();
		document.head.innerHTML = "<meta name='theme-color' content='#ffffff'>";
		document.documentElement.removeAttribute('lang');
		document.documentElement.dataset.theme = '';
		document.documentElement.dataset.colorMode = '';
		document.documentElement.className = '';
		document.documentElement.style.colorScheme = '';
		localeSet.mockReset();
	});

	it('hydrates persisted values and applies the dark theme on startup', async () => {
		installThemeMediaQuery(false);
		localStorage.setItem('songbook-language', JSON.stringify('EN'));
		localStorage.setItem('songbook-view-mode', JSON.stringify('chords'));
		localStorage.setItem('songbook-favourites', JSON.stringify(['7-EN']));
		localStorage.setItem('songbook-theme', JSON.stringify('dark'));
		localStorage.setItem('songbook-text-size', JSON.stringify(2));

		const preferences = await loadPreferences(true);

		expect(get(preferences.language)).toBe('EN');
		expect(get(preferences.viewMode)).toBe('chords');
		expect(get(preferences.favourites)).toEqual(['7-EN']);
		expect(get(preferences.theme)).toBe('dark');
		expect(get(preferences.songTextScale)).toBe(2);
		expect(localeSet).toHaveBeenCalledWith('en');
		expect(document.documentElement.lang).toBe('en');
		expect(document.documentElement.dataset.theme).toBe('songbook-dusk');
		expect(document.documentElement.dataset.colorMode).toBe('dark');
		expect(document.documentElement.style.colorScheme).toBe('dark');
		expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
		expect((document.querySelector("meta[name='theme-color']") as HTMLMetaElement).content).toBe(
			'#141216'
		);
	});

	it('falls back on invalid persisted values and logs parse failures', async () => {
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		installThemeMediaQuery(false);
		localStorage.setItem('songbook-language', '{');
		localStorage.setItem('songbook-view-mode', JSON.stringify('karaoke'));
		localStorage.setItem('songbook-favourites', JSON.stringify([1, 2]));
		localStorage.setItem('songbook-theme', JSON.stringify('sepia'));
		localStorage.setItem('songbook-text-size', JSON.stringify(99));

		const preferences = await loadPreferences(true);

		expect(get(preferences.language)).toBe('PL');
		expect(get(preferences.viewMode)).toBe('basic');
		expect(get(preferences.favourites)).toEqual([]);
		expect(get(preferences.theme)).toBe('system');
		expect(get(preferences.songTextScale)).toBe(0);
		expect(localeSet).toHaveBeenCalledWith('pl');
		expect(errorSpy).toHaveBeenCalled();

		errorSpy.mockRestore();
	});

	it('toggles favourites and updates the derived selector', async () => {
		installThemeMediaQuery(false);
		const preferences = await loadPreferences(true);

		preferences.toggleFavourite('2-PL');
		expect(get(preferences.favourites)).toEqual(['2-PL']);
		expect(get(preferences.isFavourite)('2-PL')).toBe(true);
		expect(localStorage.getItem('songbook-favourites')).toBe(JSON.stringify(['2-PL']));

		preferences.toggleFavourite('2-PL');
		expect(get(preferences.favourites)).toEqual([]);
		expect(get(preferences.isFavourite)('2-PL')).toBe(false);
	});

	it('updates system theme when the media query changes', async () => {
		const themeMedia = installThemeMediaQuery(false);
		localStorage.setItem('songbook-theme', JSON.stringify('system'));
		const preferences = await loadPreferences(true);

		expect(get(preferences.theme)).toBe('system');
		expect(document.documentElement.dataset.colorMode).toBe('light');

		themeMedia.matches = true;
		themeMedia.trigger();
		expect(document.documentElement.dataset.colorMode).toBe('dark');
		expect(document.documentElement.dataset.theme).toBe('songbook-dusk');
	});
});
