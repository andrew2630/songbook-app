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

<div class="relative isolate overflow-hidden">
  <div
    class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(circle_at_80%_5%,rgba(34,211,238,0.24),transparent_55%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.22),transparent_60%)]"
    aria-hidden="true"
  ></div>
  <div class="relative mx-auto flex min-h-screen w-full max-w-[120rem] flex-col px-4 pb-24 sm:px-6 lg:px-12">
    <AppHeader />
    <main class="flex-1 py-10 sm:py-12 lg:py-16">
      <slot />
    </main>
    <footer class="mt-10 flex flex-col gap-3 py-8 text-sm text-surface-500 dark:text-surface-400">
      <span class="uppercase tracking-[0.25em] text-xs font-semibold text-primary-400/80">Songbook</span>
      <p class="max-w-xl leading-relaxed text-surface-600 dark:text-surface-300">
        Designed for worship leaders and musicians who need an offline-first, international-ready song
        companion.
      </p>
    </footer>
  </div>
  <div
    class="pointer-events-none absolute inset-x-1/2 top-[20%] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-primary-500/10 blur-[220px]"
    aria-hidden="true"
  ></div>
</div>
