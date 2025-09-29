<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { t } from 'svelte-i18n';
  import { get } from 'svelte/store';
  import { getSongByKey } from '$lib/stores/songStore';
  import { favourites, toggleFavourite, language, viewMode } from '$lib/stores/preferences';
  import type { Song, SongLanguage } from '$lib/types/song';

  let song: Song | null = null;
  let loading = true;
  let activeViewMode: 'basic' | 'chords' = 'basic';
  let lastUpdatedLabel: string | null = null;
  let showScrollTop = false;

  onMount(async () => {
    const $page = get(page);
    const langParam = $page.url.searchParams.get('lang')?.toUpperCase() as SongLanguage | undefined;
    const activeLang = langParam ?? get(language);
    if (langParam) {
      language.set(langParam);
    }
    song = await getSongByKey(`${$page.params.id}-${activeLang}`);
    loading = false;
  });

  onMount(() => {
    const updateScrollIndicator = () => {
      showScrollTop = typeof window !== 'undefined' && window.scrollY > 240;
    };

    updateScrollIndicator();
    window.addEventListener('scroll', updateScrollIndicator, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrollIndicator);
    };
  });

  $: favouriteKey = song ? `${song.id}-${song.language}` : '';
  $: activeViewMode = $viewMode;
  $: lastUpdatedLabel = song?.lastUpdatedAt
    ? new Date(song.lastUpdatedAt).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : null;

  function handleTabKeydown(event: KeyboardEvent, mode: 'basic' | 'chords') {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }

    event.preventDefault();
    const next = mode === 'basic' ? 'chords' : 'basic';
    viewMode.set(next);
  }

  function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      goto('/');
    }
  }

  function scrollToTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
</script>

<svelte:head>
  <title>{song ? `${song.title} · ${$t('app.title')}` : $t('app.title')}</title>
</svelte:head>

{#if loading}
  <div class="py-20 text-center text-sm text-[rgb(var(--text-secondary))]">{$t('app.syncing')}</div>
{:else if song}
  <article
    class="relative mx-auto max-w-4xl space-y-8 overflow-hidden rounded-[2.5rem] border border-primary-500/20 bg-white/85 p-8 shadow-2xl backdrop-blur-xl dark:border-surface-700/40 dark:bg-surface-900/80 sm:p-10 lg:p-14"
  >
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute -top-24 left-10 h-48 w-48 rounded-full bg-primary-500/15 blur-[120px]"></div>
      <div class="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-secondary-400/20 blur-[140px]"></div>
    </div>

    <header class="relative space-y-6 text-center lg:text-left">
      <div class="flex flex-1 flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary-500 transition hover:-translate-y-0.5 hover:border-primary-500 hover:text-primary-500 dark:border-surface-700/40 dark:bg-surface-900/70"
            type="button"
            on:click={goBack}
          >
            {$t('app.back_action')}
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary-500 transition hover:-translate-y-0.5 hover:border-primary-500 hover:text-primary-500 dark:border-surface-700/40 dark:bg-surface-900/70"
            type="button"
            on:click={() => goto('/')}
          >
            {$t('app.back_to_index')}
          </button>
        </div>
        <button
          class={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
            $favourites.includes(favouriteKey)
              ? 'bg-gradient-to-r from-primary-500 to-secondary-400 text-white shadow-lg'
              : 'border border-primary-500/25 bg-white/70 text-surface-600 hover:border-primary-500 hover:text-primary-500 dark:border-surface-700/40 dark:bg-surface-900/70 dark:text-surface-200'
          }`}
          type="button"
          aria-pressed={$favourites.includes(favouriteKey)}
          on:click={() => toggleFavourite(favouriteKey)}
        >
          {$favourites.includes(favouriteKey) ? $t('app.remove_favourite') : $t('app.add_favourite')}
        </button>
      </div>

      <div class="space-y-4">
        <div class="space-y-2">
          <h1 class="text-balance text-3xl font-semibold text-surface-900 dark:text-surface-50 sm:text-4xl">{song.title}</h1>
          {#if lastUpdatedLabel}
            <p class="text-xs uppercase tracking-[0.3em] text-primary-400/80">
              {$t('app.updated_label')}: {lastUpdatedLabel}
            </p>
          {/if}
        </div>
        <div class="flex flex-wrap justify-center gap-2 text-xs text-surface-500 dark:text-surface-300 lg:justify-start">
          <span class="rounded-full bg-primary-500/10 px-3 py-1 font-semibold uppercase tracking-[0.2em] text-primary-500">
            {$t('app.page_label')} {song.page}
          </span>
          <span class="rounded-full bg-white/70 px-3 py-1 text-surface-600 dark:bg-surface-900/70 dark:text-surface-200">
            {$t('app.source_label')} {song.source}
          </span>
          <span class="rounded-full bg-white/70 px-3 py-1 text-surface-600 dark:bg-surface-900/70 dark:text-surface-200">
            {$t('app.external_index')} {song.externalIndex}
          </span>
        </div>
      </div>

      <div
        class="flex flex-wrap items-center justify-center gap-2 lg:justify-start"
        role="tablist"
        aria-label={$t('app.view_song')}
      >
        <button
          class={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
            activeViewMode === 'basic'
              ? 'bg-gradient-to-r from-primary-500 to-secondary-400 text-white shadow-lg'
              : 'border border-primary-500/20 bg-white/70 text-surface-600 dark:border-surface-700/40 dark:bg-surface-800/70 dark:text-surface-200'
          }`}
          type="button"
          role="tab"
          aria-selected={activeViewMode === 'basic'}
          tabindex={activeViewMode === 'basic' ? 0 : -1}
          on:click={() => viewMode.set('basic')}
          on:keydown={(event) => handleTabKeydown(event, 'basic')}
        >
          {$t('app.view.basic')}
        </button>
        <button
          class={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
            activeViewMode === 'chords'
              ? 'bg-gradient-to-r from-primary-500 to-secondary-400 text-white shadow-lg'
              : 'border border-primary-500/20 bg-white/70 text-surface-600 dark:border-surface-700/40 dark:bg-surface-800/70 dark:text-surface-200'
          }`}
          type="button"
          role="tab"
          aria-selected={activeViewMode === 'chords'}
          tabindex={activeViewMode === 'chords' ? 0 : -1}
          on:click={() => viewMode.set('chords')}
          on:keydown={(event) => handleTabKeydown(event, 'chords')}
        >
          {$t('app.view.chords')}
        </button>
      </div>
    </header>

    <section
      class={`relative space-y-3 rounded-2xl border border-primary-500/10 bg-white/75 p-6 text-left text-base leading-relaxed shadow-inner dark:border-surface-700/40 dark:bg-surface-900/60 ${
        activeViewMode === 'chords' ? 'lg:grid lg:grid-cols-[180px,1fr] lg:gap-6 lg:space-y-0' : ''
      }`}
    >
      {#each song.items as item}
        {#if item.text.trim().length}
          <p
            class={`whitespace-pre-line ${
              item.alignment === 'CENTER'
                ? 'text-center'
                : item.alignment === 'RIGHT'
                ? 'text-right'
                : 'text-left'
            } ${item.isBold ? 'font-semibold' : ''} ${item.isItalics ? 'italic' : ''}`}
          >
            {#if activeViewMode === 'chords' && item.type === 'CHORD'}
              <span class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-400/80">CHORDS</span>
              <span class="mt-1 block text-base font-medium">{item.text}</span>
            {:else}
              {item.text}
            {/if}
          </p>
        {/if}
      {/each}
    </section>
  </article>
  {#if showScrollTop}
    <button
      class="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-white/80 px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-500 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:border-primary-500 hover:text-primary-500 dark:border-surface-700/40 dark:bg-surface-900/80"
      type="button"
      on:click={scrollToTop}
      aria-label={$t('app.scroll_to_top')}
    >
      {$t('app.scroll_to_top')}
    </button>
  {/if}
{:else}
  <div class="py-20 text-center text-sm text-[rgb(var(--text-secondary))]">Song not found.</div>
{/if}
