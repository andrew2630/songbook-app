import { browser } from '$app/environment';
import { writable, derived } from 'svelte/store';
import { locale } from 'svelte-i18n';
import type { SongLanguage, SongViewMode } from '$lib/types/song';

const LANGUAGE_KEY = 'songbook-language';
const VIEW_KEY = 'songbook-view-mode';
const FAV_KEY = 'songbook-favourites';
const THEME_KEY = 'songbook-theme';

const defaultLanguage: SongLanguage = 'PL';
const defaultViewMode: SongViewMode = 'basic';

export type ThemeName = 'light' | 'dark' | 'sunset' | 'forest' | 'ocean';

type ThemeDefinition = {
  mode: 'light' | 'dark';
  labelKey: `app.theme.${string}`;
  swatch: [string, string];
};

const themeDefinitions: Record<ThemeName, ThemeDefinition> = {
  light: {
    mode: 'light',
    labelKey: 'app.theme.light',
    swatch: ['#6366f1', '#0ea5e9']
  },
  dark: {
    mode: 'dark',
    labelKey: 'app.theme.dark',
    swatch: ['#4338ca', '#0ea5e9']
  },
  sunset: {
    mode: 'light',
    labelKey: 'app.theme.sunset',
    swatch: ['#f97316', '#ec4899']
  },
  forest: {
    mode: 'dark',
    labelKey: 'app.theme.forest',
    swatch: ['#22c55e', '#0f766e']
  },
  ocean: {
    mode: 'light',
    labelKey: 'app.theme.ocean',
    swatch: ['#0ea5e9', '#6366f1']
  }
};

const orderedThemes: ThemeName[] = ['light', 'dark', 'sunset', 'forest', 'ocean'];

export const themeOptions = orderedThemes.map((id) => ({ id, ...themeDefinitions[id] }));

function createPersistedStore<T>(key: string, initial: T) {
  const store = writable<T>(initial, (set) => {
    if (!browser) return;
    const stored = window.localStorage.getItem(key);
    if (stored) {
      try {
        set(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse stored value', error);
      }
    }
    return () => undefined;
  });

  if (browser) {
    store.subscribe((value) => {
      window.localStorage.setItem(key, JSON.stringify(value));
    });
  }

  return store;
}

export const language = createPersistedStore<SongLanguage>(LANGUAGE_KEY, defaultLanguage);
export const viewMode = createPersistedStore<SongViewMode>(VIEW_KEY, defaultViewMode);
export const favourites = createPersistedStore<string[]>(FAV_KEY, []);

function isValidTheme(value: string): value is ThemeName {
  return Object.prototype.hasOwnProperty.call(themeDefinitions, value);
}

function getInitialTheme(): ThemeName {
  if (!browser) return 'light';
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (typeof parsed === 'string' && isValidTheme(parsed)) return parsed;
    } catch (error) {
      console.warn('Failed to parse stored theme', error);
    }
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(themeName: ThemeName) {
  if (!browser) return;
  const definition = themeDefinitions[themeName];
  document.documentElement.dataset.theme = themeName;
  document.documentElement.classList.toggle('dark', definition.mode === 'dark');
}

const initialTheme = getInitialTheme();
export const theme = writable<ThemeName>(initialTheme);

if (browser) {
  applyTheme(initialTheme);
  theme.subscribe((value) => {
    window.localStorage.setItem(THEME_KEY, JSON.stringify(value));
    applyTheme(value);
  });
}

export function toggleTheme() {
  theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
}

if (browser) {
  language.subscribe(($language) => {
    locale.set($language.toLowerCase());
    document.documentElement.lang = $language.toLowerCase();
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
