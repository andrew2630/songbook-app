import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';
import { locale } from 'svelte-i18n';
import type { SongLanguage, SongViewMode } from '$lib/types/song';
import { DEFAULT_SONG_TEXT_SCALE, isSongTextScale } from '$lib/utils/songTextScale';

const LANGUAGE_KEY = 'songbook-language';
const VIEW_KEY = 'songbook-view-mode';
const FAV_KEY = 'songbook-favourites';
const THEME_KEY = 'songbook-theme';
const TEXT_SIZE_KEY = 'songbook-text-size';
const LIST_PREVIEW_KEY = 'songbook-list-preview-visible';
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';
const LIGHT_THEME_NAME = 'songbook-dawn';
const DARK_THEME_NAME = 'songbook-dusk';
const LIGHT_THEME_COLOR = '#93725f';
const DARK_THEME_COLOR = '#141216';

const defaultLanguage: SongLanguage = 'PL';
const defaultViewMode: SongViewMode = 'basic';
const defaultTheme: ThemePreference = 'system';

export type ThemePreference = 'light' | 'dark' | 'system';
type Validator<T> = (value: unknown) => value is T;

const isSongLanguage = (value: unknown): value is SongLanguage => value === 'PL' || value === 'EN';
const isSongViewMode = (value: unknown): value is SongViewMode =>
	value === 'basic' || value === 'chords';
const isThemePreference = (value: unknown): value is ThemePreference =>
	value === 'light' || value === 'dark' || value === 'system';
const isFavouriteList = (value: unknown): value is string[] =>
	Array.isArray(value) && value.every((item) => typeof item === 'string');
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

function readStoredValue<T>(key: string, fallback: T, validator?: Validator<T>): T {
	if (!browser) return fallback;

	try {
		const stored = window.localStorage.getItem(key);
		if (stored) {
			const parsed = JSON.parse(stored) as unknown;
			if (!validator || validator(parsed)) {
				return parsed as T;
			}
		}
	} catch (error) {
		console.error('Failed to parse stored value', error);
	}

	return fallback;
}

function createPersistedStore<T>(key: string, initial: T, validator?: Validator<T>) {
	const store = writable<T>(readStoredValue(key, initial, validator));

	if (browser) {
		store.subscribe((value) => {
			window.localStorage.setItem(key, JSON.stringify(value));
		});
	}

	return store;
}

export const language = createPersistedStore<SongLanguage>(
	LANGUAGE_KEY,
	defaultLanguage,
	isSongLanguage
);
export const viewMode = createPersistedStore<SongViewMode>(
	VIEW_KEY,
	defaultViewMode,
	isSongViewMode
);
export const favourites = createPersistedStore<string[]>(FAV_KEY, [], isFavouriteList);
export const theme = createPersistedStore<ThemePreference>(
	THEME_KEY,
	defaultTheme,
	isThemePreference
);
export const songTextScale = createPersistedStore<number>(
	TEXT_SIZE_KEY,
	DEFAULT_SONG_TEXT_SCALE,
	isSongTextScale
);
export const listPreviewVisible = createPersistedStore<boolean>(LIST_PREVIEW_KEY, true, isBoolean);

function resolveTheme(preference: ThemePreference) {
	if (!browser) return 'light';
	if (preference === 'system') {
		return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light';
	}
	return preference;
}

function applyTheme(preference: ThemePreference) {
	if (!browser) return;

	const resolvedTheme = resolveTheme(preference);
	const isDark = resolvedTheme === 'dark';
	const root = document.documentElement;
	root.dataset.theme = isDark ? DARK_THEME_NAME : LIGHT_THEME_NAME;
	root.dataset.colorMode = resolvedTheme;
	root.style.colorScheme = resolvedTheme;
	root.classList.toggle('theme-dark', isDark);
	root.classList.toggle('theme-light', !isDark);

	const metaThemeColor = document.querySelector("meta[name='theme-color']");
	if (metaThemeColor instanceof HTMLMetaElement) {
		metaThemeColor.content = isDark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
	}
}

if (browser) {
	language.subscribe(($language) => {
		locale.set($language.toLowerCase());
		document.documentElement.lang = $language.toLowerCase();
	});

	theme.subscribe(($theme) => {
		applyTheme($theme);
	});

	const darkThemeMediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
	darkThemeMediaQuery.addEventListener('change', () => {
		applyTheme(readStoredValue(THEME_KEY, defaultTheme, isThemePreference));
	});
}

export function toggleFavourite(key: string) {
	favourites.update((list) =>
		list.includes(key) ? list.filter((item) => item !== key) : [...list, key]
	);
}

export const isFavourite = derived(favourites, ($favourites) => {
	return (key: string) => $favourites.includes(key);
});
