import { browser } from '$app/environment';
import { writable, derived } from 'svelte/store';
import { locale } from 'svelte-i18n';
import type { SongLanguage, SongViewMode } from '$lib/types/song';
import { defaultTheme } from '$lib/config/themes';

const LANGUAGE_KEY = 'songbook-language';
const VIEW_KEY = 'songbook-view-mode';
const FAV_KEY = 'songbook-favourites';
const THEME_KEY = 'songbook-theme';

const defaultLanguage: SongLanguage = 'PL';
const defaultViewMode: SongViewMode = 'basic';
const defaultThemeName = defaultTheme.id;

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
export const themeName = createPersistedStore<string>(THEME_KEY, defaultThemeName);

if (browser) {
  language.subscribe(($language) => {
    locale.set($language.toLowerCase());
    document.documentElement.lang = $language.toLowerCase();
  });

  themeName.subscribe(($theme) => {
    document.documentElement.dataset.theme = $theme;
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
