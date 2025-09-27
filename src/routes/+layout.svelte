<script lang="ts">
  import '../app.css';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { register, init } from 'svelte-i18n';
  import { get } from 'svelte/store';
  import AppHeader from '$lib/components/layout/AppHeader.svelte';
  import { loadSongs } from '$lib/stores/songStore';
  import { language } from '$lib/stores/preferences';

  register('pl', () => import('$lib/locales/pl.json'));
  register('en', () => import('$lib/locales/en.json'));

  init({ fallbackLocale: 'pl', initialLocale: get(language).toLowerCase() });

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

<AppHeader />
<main class="mx-auto min-h-[calc(100vh-6rem)] w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
  <slot />
</main>
