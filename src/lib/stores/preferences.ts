import { browser } from '$app/environment';
import { writable, derived } from 'svelte/store';
import { locale } from 'svelte-i18n';
import type { SongLanguage, SongViewMode } from '$lib/types/song';

type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'songbook-theme';
const LANGUAGE_KEY = 'songbook-language';
const VIEW_KEY = 'songbook-view-mode';
const FAV_KEY = 'songbook-favourites';

const defaultTheme: Theme = 'light';
const defaultLanguage: SongLanguage = 'PL';
const defaultViewMode: SongViewMode = 'basic';

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

export const theme = createPersistedStore<Theme>(THEME_KEY, defaultTheme);
export const language = createPersistedStore<SongLanguage>(LANGUAGE_KEY, defaultLanguage);
export const viewMode = createPersistedStore<SongViewMode>(VIEW_KEY, defaultViewMode);
export const favourites = createPersistedStore<string[]>(FAV_KEY, []);

export const isDark = derived(theme, ($theme) => {
  if (!browser) return false;
  if ($theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return $theme === 'dark';
});

if (browser) {
  theme.subscribe(($theme) => {
    const root = document.documentElement;
    const resolved = $theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : $theme;
    root.dataset.theme = resolved;
    root.classList.toggle('dark', resolved === 'dark');
  });

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

export const isFavourite = derived([favourites], ([$favourites]) => {
  return (key: string) => $favourites.includes(key);
});
