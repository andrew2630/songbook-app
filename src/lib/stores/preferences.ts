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
type Theme = 'light' | 'dark';

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

function getInitialTheme(): Theme {
  if (!browser) return 'light';
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as Theme;
      if (parsed === 'light' || parsed === 'dark') {
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to parse stored theme', error);
    }
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  if (!browser) return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

const initialTheme = getInitialTheme();
export const theme = writable<Theme>(initialTheme);

if (browser) {
  applyTheme(initialTheme);
  theme.subscribe((value) => {
    window.localStorage.setItem(THEME_KEY, JSON.stringify(value));
    applyTheme(value);
  });
}

export function toggleTheme() {
  theme.update((current) => (current === 'light' ? 'dark' : 'light'));
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
