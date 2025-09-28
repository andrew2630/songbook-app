<script lang="ts">
  import '../app.css';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { addMessages, init, locale as i18nLocale } from 'svelte-i18n';
  import { get } from 'svelte/store';
  import AppHeader from '$lib/components/layout/AppHeader.svelte';
  import { loadSongs } from '$lib/stores/songStore';
  import { language } from '$lib/stores/preferences';
  import pl from '$lib/locales/pl.json';
  import en from '$lib/locales/en.json';

  addMessages('pl', pl);
  addMessages('en', en);

  const initialLocale = (browser ? get(language) : 'PL').toLowerCase();

  init({ fallbackLocale: 'pl', initialLocale });

  if (!browser) {
    i18nLocale.set(initialLocale);
  }

  onMount(() => {
    loadSongs();

    const handleOnline = () => loadSongs(true);

    if (browser) {
      window.addEventListener('online', handleOnline);

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js');
      }
    }

    return () => {
      if (browser) {
        window.removeEventListener('online', handleOnline);
      }
    };
  });
</script>

<div class="app-shell">
  <div class="app-shell__inner">
    <AppHeader />
    <main class="app-shell__content">
      <slot />
    </main>
  </div>
  <div class="app-shell__glow" aria-hidden="true"></div>
</div>
