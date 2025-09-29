<script lang="ts">
  import '../app.css';
  import { browser } from '$app/environment';
  import { onDestroy, onMount } from 'svelte';
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

  let lenisController: { destroy: () => void } | null = null;

  onMount(() => {
    loadSongs();

    const handleOnline = () => loadSongs(true);

    async function initLenis() {
      if (!browser) return;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      const { initLenis } = await import('$lib/utils/lenis');
      lenisController = await initLenis();
    }

    initLenis();

    if (browser) {
      window.addEventListener('online', handleOnline, { passive: true });

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

  onDestroy(() => {
    lenisController?.destroy();
  });
</script>

<div class="min-h-screen bg-gradient-to-b from-surface-50 via-surface-100 to-surface-50 text-surface-900 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950">
  <div class="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-16 sm:px-6 lg:px-8">
    <AppHeader />
    <main class="flex-1 py-8 sm:py-10 lg:py-12">
      <slot />
    </main>
    <footer class="mt-12 border-t border-surface-200/60 py-6 text-sm text-surface-500 dark:border-surface-800 dark:text-surface-400">
      <p class="font-semibold uppercase tracking-[0.2em] text-xs text-primary-500/80">Songbook</p>
      <p class="mt-2 max-w-xl leading-relaxed">Designed for musicians who need a simple, dependable song companion offline.</p>
    </footer>
  </div>
</div>
