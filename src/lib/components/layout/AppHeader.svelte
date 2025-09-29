<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { derived } from 'svelte/store';
  import { t } from 'svelte-i18n';
  import { fadeSlide } from '$lib/actions/fadeSlide';
  import { language, theme } from '$lib/stores/preferences';
  import { isSyncing, lastSynced } from '$lib/stores/songStore';
  import { animate } from 'motion';
  import { Languages, Music3, Orbit, Sparkles, Sun, MoonStar } from 'lucide-svelte';

  const syncingLabel = derived([isSyncing, lastSynced], ([$isSyncing, $lastSynced]) => {
    if ($isSyncing) return $t('app.syncing');
    if ($lastSynced) return `${$t('app.last_synced')}: ${new Date($lastSynced).toLocaleString()}`;
    return '';
  });

  let prefersReducedMotion = true;
  let orbRef: HTMLDivElement | null = null;

  let stopOrbAnimation: (() => void) | null = null;

  onMount(() => {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !orbRef) return;
    orbRef.style.willChange = 'transform, opacity';
    const animation = animate(
      orbRef,
      { opacity: [0.28, 0.5, 0.28], transform: ['translate3d(0, -10px, 0)', 'translate3d(0, 6px, 0)', 'translate3d(0, -10px, 0)'] },
      { duration: 9, easing: [0.33, 1, 0.68, 1], repeat: Infinity }
    );
    stopOrbAnimation = () => {
      animation.cancel();
      orbRef?.style.removeProperty('will-change');
    };
  });

  onDestroy(() => {
    stopOrbAnimation?.();
  });

  // const highlightCards = [
  //   {
  //     icon: Music3,
  //     label: 'app.brand_available_offline',
  //     description: 'app.toggle_index'
  //   },
  //   {
  //     icon: Sun,
  //     label: 'app.theme_label',
  //     description: 'app.system'
  //   },
  //   {
  //     icon: Orbit,
  //     label: 'app.view_song',
  //     description: 'app.tagline'
  //   }
  // ];
</script>

<section class="relative pt-12 sm:pt-16 lg:pt-20">
  <div class="absolute inset-0 -z-10">
    <div class="pointer-events-none absolute inset-x-10 top-0 h-64 rounded-[50%] bg-primary-500/20 blur-[120px]" aria-hidden="true"></div>
    <div
      bind:this={orbRef}
      class="pointer-events-none absolute right-10 top-10 h-44 w-44 rounded-full bg-secondary-500/30 opacity-40"
      aria-hidden="true"
    />
  </div>

  <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
    <div class="space-y-7" use:fadeSlide={{ axis: 'y', from: 40 }}>
      <div class="inline-flex items-center gap-3 rounded-full bg-primary-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-primary-500">
        {$t('app.brand_global')}
      </div>
      <h1 class="text-balance text-3xl font-semibold sm:text-4xl lg:text-5xl">
        {$t('app.title')}
      </h1>
      <p class="max-w-2xl text-lg text-surface-600 dark:text-surface-300">
        {$t('app.tagline')}
      </p>
      <div class="relative flex flex-col gap-4 rounded-3xl border border-primary-500/20 bg-white/70 p-6 backdrop-blur-xl shadow-glow dark:bg-surface-900/80 dark:text-surface-50" use:fadeSlide={{ delay: 0.08 }}>
        <div class="absolute inset-y-0 right-0 hidden w-1/3 rounded-3xl bg-gradient-to-l from-primary-500/10 via-transparent to-transparent lg:block" aria-hidden="true"></div>
        <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary-400/80">
              {$t('app.brand_available_offline')}
            </p>
            <!-- <p class="mt-2 max-w-xl text-sm text-surface-500 dark:text-surface-200">
              {$t('app.search_placeholder')}
            </p> -->
          </div>
          <div class="flex items-center gap-3 text-sm text-surface-500 dark:text-surface-200">
            <span class="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary-500/15">
              <span class="absolute inset-0 animate-ping rounded-full bg-primary-500/20"></span>
              <Sparkles class="relative h-4 w-4 text-primary-500" />
            </span>
            <span class="font-semibold">
              {$t('app.toggle_index')}
            </span>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2" use:fadeSlide={{ delay: 0.15 }}>
          <label class="group flex items-center justify-between gap-4 rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm font-semibold text-surface-700 shadow-sm transition dark:border-surface-700/50 dark:bg-surface-800/80 dark:text-surface-200">
            <span class="flex items-center gap-3">
              <Languages class="h-5 w-5 text-primary-500" />
              <span class="uppercase tracking-[0.2em] text-xs text-surface-500 dark:text-surface-400">
                {$t('app.language_label')}
              </span>
            </span>
            <select
              class="w-28 rounded-xl border border-transparent bg-transparent text-right text-sm font-semibold text-surface-700 outline-none transition focus-visible:border-primary-500 dark:text-surface-200"
              bind:value={$language}
            >
              <option value="PL">Polski</option>
              <option value="EN">English</option>
            </select>
          </label>
          <label class="group flex items-center justify-between gap-4 rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm font-semibold text-surface-700 shadow-sm transition dark:border-surface-700/50 dark:bg-surface-800/80 dark:text-surface-200">
            <span class="flex items-center gap-3">
              <Sun class="h-5 w-5 text-primary-500" />
              <span class="uppercase tracking-[0.2em] text-xs text-surface-500 dark:text-surface-400">
                {$t('app.theme_label')}
              </span>
            </span>
            <select
              class="w-32 rounded-xl border border-transparent bg-transparent text-right text-sm font-semibold text-surface-700 outline-none transition focus-visible:border-primary-500 dark:text-surface-200"
              bind:value={$theme}
            >
              <option value="light">{$t('app.light')}</option>
              <option value="dark">{$t('app.dark')}</option>
              <option value="system">{$t('app.system')}</option>
            </select>
          </label>
        </div>
      </div>
    </div>

    <div class="relative" use:fadeSlide={{ axis: 'x', from: 50, delay: 0.1 }}>
      <div class="gradient-border rounded-[2rem] bg-gradient-to-b from-white/70 via-white/50 to-white/70 p-1 dark:from-surface-800/80 dark:via-surface-900/80 dark:to-surface-800/80">
        <div class="backdrop-glass relative flex h-full flex-col gap-6 rounded-[1.8rem] p-8">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/15">
              <MoonStar class="h-6 w-6 text-primary-500" />
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.35em] text-primary-400/80">{$t('app.brand_global')}</p>
              <p class="text-lg font-semibold">{$t('app.toggle_index')}</p>
            </div>
          </div>
          <p class="text-sm leading-relaxed text-surface-600 dark:text-surface-300">
            {$t('app.tagline')}
          </p>
          <div class="mt-auto space-y-4 text-sm text-surface-500 dark:text-surface-300">
            <p class="font-semibold uppercase tracking-[0.25em] text-xs text-primary-400/90">{$t('app.syncing')}</p>
            <div class="flex items-center gap-3">
              <span class="inline-flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.25)]"></span>
              <span>{$syncingLabel || $t('app.brand_available_offline')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- <div class="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each highlightCards as card, index}
      <div
        class="group relative overflow-hidden rounded-3xl border border-primary-500/10 bg-white/75 p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:border-surface-700/40 dark:bg-surface-800/80"
        use:fadeSlide={{ delay: index * 0.12 }}
      >
        <div class="flex items-center gap-3">
          <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500">
            <svelte:component this={card.icon} class="h-5 w-5" />
          </span>
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-primary-400/80">{$t(card.label)}</p>
            <p class="mt-1 text-base font-semibold text-surface-700 dark:text-surface-100">{$t(card.description)}</p>
          </div>
        </div>
      </div>
    {/each}
  </div> -->
</section>
