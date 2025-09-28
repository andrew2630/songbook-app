<script lang="ts">
  import { t } from 'svelte-i18n';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { language, favourites, viewMode, toggleFavourite } from '$lib/stores/preferences';
  import { searchableSongs, songs, filterSongs, type SongSortMode } from '$lib/stores/songStore';
  import { buildPageIndex, songsByPage } from '$lib/utils/pageIndex';
  import SongCard from '$lib/components/song/SongCard.svelte';
  import { fadeSlide } from '$lib/actions/fadeSlide';
  import { inView } from '$lib/actions/inView';
  import { createTabs, melt } from '@melt-ui/svelte';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import {
    Search,
    Filter,
    Heart,
    LayoutList,
    Sparkles,
    ChevronDown,
    ChevronUp,
    MapPinned,
    ArrowDownAZ,
    Clock3,
    BarChart3
  } from 'lucide-svelte';
  import type { Song } from '$lib/types/song';

  let query = '';
  let menuView: 'index' | 'favourites' = 'index';
  let pageFilter: number | null = null;
  let filtersOpen = browser ? false : true;
  let isDesktop = false;
  let statsVisible = false;
  let activeViewMode: 'basic' | 'chords' = 'basic';
  let sortMode: SongSortMode = 'page';
  let searchRef: HTMLInputElement | null = null;

  const sortOptions: { value: SongSortMode; label: string; icon: typeof MapPinned }[] = [
    { value: 'page', label: 'app.sort.page', icon: MapPinned },
    { value: 'alpha', label: 'app.sort.alpha', icon: ArrowDownAZ },
    { value: 'recent', label: 'app.sort.recent', icon: Clock3 },
    { value: 'dense', label: 'app.sort.dense', icon: BarChart3 }
  ];

  onMount(() => {
    if (!browser) return;
    const update = () => {
      const desktop = window.innerWidth >= 1200;
      isDesktop = desktop;
      filtersOpen = desktop;
    };
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  });

  const viewTabs = createTabs({ defaultValue: get(viewMode) });
  const { elements: viewTabElements, states: viewTabStates } = viewTabs;
  const viewTabsRoot = viewTabElements.root;
  const viewTabsList = viewTabElements.list;
  const viewTabsTrigger = viewTabElements.trigger;
  const viewTabValue = viewTabStates.value;

  $: viewTabStates.value.set($viewMode);
  $: if ($viewTabValue && $viewTabValue !== $viewMode) {
    viewMode.set($viewTabValue as 'basic' | 'chords');
  }
  $: activeViewMode = (($viewTabValue as 'basic' | 'chords') ?? 'basic');

  $: availableSongs = $songs.filter((song) => song.language === $language);
  $: groupedByPage = songsByPage(availableSongs);
  $: pageGroups = buildPageIndex(availableSongs);
  $: filteredSongs = filterSongs(
    $searchableSongs,
    query,
    $language,
    menuView === 'favourites',
    $favourites,
    pageFilter,
    sortMode
  );
  $: favouriteSongs = $favourites
    .map((key) => $songs.find((song) => `${song.id}-${song.language}` === key) ?? null)
    .filter((song): song is Song => song !== null);
  $: filterBadges = [
    query ? $t('app.filters.search', { values: { query } }) : null,
    menuView === 'favourites' ? $t('app.filters.favourites') : null,
    pageFilter ? $t('app.filters.page', { values: { page: pageFilter } }) : null
  ].filter((badge): badge is string => Boolean(badge));

  function handleClearFilters() {
    query = '';
    pageFilter = null;
    menuView = 'index';
    filtersOpen = isDesktop;
  }

  function openSong(song: Song) {
    goto(`/song/${song.id}?lang=${song.language}`);
  }

  function handlePageSelect(pageNumber: number) {
    pageFilter = pageNumber;
    menuView = 'index';
  }

  function focusSearchInput() {
    if (!browser) return;
    filtersOpen = true;
    menuView = 'index';
    searchRef?.focus();
    searchRef?.select();
  }

  function openFavouritesQuickly() {
    filtersOpen = true;
    menuView = 'favourites';
    if (!browser) return;
    document.getElementById('songbook-filters')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

<section class="space-y-16 pb-12">
  <div class="relative overflow-hidden rounded-[2.5rem] border border-primary-500/20 bg-white/80 px-6 py-8 shadow-2xl backdrop-blur-xl dark:border-surface-700/40 dark:bg-surface-900/80 sm:px-10" use:fadeSlide>
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute -left-10 top-0 h-64 w-64 rounded-full bg-primary-500/15 blur-[120px]"></div>
      <div class="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-secondary-400/20 blur-[110px]"></div>
    </div>
    <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
      <div class="space-y-6">
        <div class="inline-flex items-center gap-2 rounded-full bg-primary-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary-500">
          <Sparkles class="h-4 w-4" />
          <span>{$t('app.search_placeholder')}</span>
        </div>
        <div class="space-y-3">
          <h2 class="text-balance text-3xl font-semibold sm:text-4xl">
            {$t('app.toggle_index')}
          </h2>
          <p class="max-w-2xl text-base text-surface-600 dark:text-surface-300">
            {$t('app.tagline')}
          </p>
        </div>
      </div>
      <div class="w-full max-w-xl space-y-3">
        <label class="text-xs font-semibold uppercase tracking-[0.28em] text-surface-500 dark:text-surface-400" for="song-search">
          {$t('app.search_placeholder')}
        </label>
        <div class="flex items-center gap-3 rounded-[1.75rem] border border-primary-500/20 bg-white/90 px-4 py-3 shadow-inner dark:border-surface-700/40 dark:bg-surface-800/80">
          <span class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-500/10 text-primary-500">
            <Search class="h-5 w-5" />
          </span>
          <input
            id="song-search"
            class="w-full bg-transparent text-base text-surface-700 outline-none placeholder:text-surface-400 dark:text-surface-100"
            type="search"
            placeholder={$t('app.search_placeholder')}
            bind:value={query}
            bind:this={searchRef}
          />
          {#if query}
            <button
              class="text-xs font-semibold uppercase tracking-[0.28em] text-primary-500 transition hover:text-primary-400"
              on:click={() => (query = '')}
              type="button"
            >
              {$t('app.clear_query')}
            </button>
          {/if}
        </div>
        <p class="text-xs text-surface-500 dark:text-surface-300">{$t('app.search_hint')}</p>
      </div>
    </div>
    <div class="mt-10 grid gap-4 md:grid-cols-3" use:inView on:enterViewport={() => (statsVisible = true)}>
      <div class="rounded-3xl border border-primary-500/15 bg-white/75 p-5 shadow-lg transition-all duration-500 dark:border-surface-700/40 dark:bg-surface-900/80" class:opacity-0={!statsVisible} class:translate-y-4={!statsVisible} class:opacity-100={statsVisible} class:translate-y-0={statsVisible}>
        <p class="text-xs font-semibold uppercase tracking-[0.32em] text-primary-400/80">
          {$t('app.page_index')}
        </p>
        <p class="mt-2 text-2xl font-semibold text-surface-800 dark:text-surface-100">{filteredSongs.length} / {availableSongs.length}</p>
      </div>
      <div class="rounded-3xl border border-primary-500/15 bg-white/75 p-5 shadow-lg transition-all duration-500 dark:border-surface-700/40 dark:bg-surface-900/80" class:opacity-0={!statsVisible} class:translate-y-4={!statsVisible} class:opacity-100={statsVisible} class:translate-y-0={statsVisible}>
        <p class="text-xs font-semibold uppercase tracking-[0.32em] text-primary-400/80">
          {$t('app.toggle_favourites')}
        </p>
        <p class="mt-2 text-2xl font-semibold text-surface-800 dark:text-surface-100">{favouriteSongs.length}</p>
      </div>
      <div class="rounded-3xl border border-primary-500/15 bg-white/75 p-5 shadow-lg transition-all duration-500 dark:border-surface-700/40 dark:bg-surface-900/80" class:opacity-0={!statsVisible} class:translate-y-4={!statsVisible} class:opacity-100={statsVisible} class:translate-y-0={statsVisible}>
        <p class="text-xs font-semibold uppercase tracking-[0.32em] text-primary-400/80">
          {$t('app.view_song')}
        </p>
        <p class="mt-2 text-2xl font-semibold text-surface-800 dark:text-surface-100">
          {$viewMode === 'basic' ? $t('app.view.basic') : $t('app.view.chords')}
        </p>
      </div>
    </div>
  </div>

  <div class="grid gap-12 lg:grid-cols-[320px,1fr]">
    <aside class="space-y-4 lg:space-y-6" use:fadeSlide={{ axis: 'y', from: 30 }}>
      <button
        class="flex w-full items-center justify-between rounded-full border border-primary-500/20 bg-white/80 px-5 py-3 text-sm font-semibold text-surface-700 transition hover:shadow-lg dark:border-surface-700/40 dark:bg-surface-900/80 dark:text-surface-100 lg:hidden"
        on:click={() => (filtersOpen = !filtersOpen)}
        aria-expanded={filtersOpen}
        aria-controls="songbook-filters"
        type="button"
      >
        <span class="inline-flex items-center gap-2">
          <Filter class="h-4 w-4" />
          {$t('app.page_index')}
        </span>
        <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-500/10 text-primary-500">
          {#if filtersOpen}
            <ChevronUp class="h-4 w-4" />
          {:else}
            <ChevronDown class="h-4 w-4" />
          {/if}
        </span>
      </button>

      <div
        id="songbook-filters"
        class="space-y-6 rounded-[2rem] border border-primary-500/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-surface-700/40 dark:bg-surface-900/80"
        class:hidden={!filtersOpen && !isDesktop}
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-surface-800 dark:text-surface-50">{$t('app.page_index')}</h3>
          <button
            class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500 transition hover:text-primary-400"
            on:click={handleClearFilters}
            type="button"
          >
            {$t('app.reset_filters')}
          </button>
        </div>

        <div class="rounded-2xl border border-primary-500/15 bg-white/65 p-4 shadow-inner dark:border-surface-700/40 dark:bg-surface-800/70">
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-primary-400/80">
            {$t('app.filters.active')}
          </p>
          {#if filterBadges.length}
            <div class="mt-3 flex flex-wrap gap-2">
              {#each filterBadges as badge}
                <span class="inline-flex items-center gap-2 rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-500">
                  {badge}
                </span>
              {/each}
            </div>
          {:else}
            <p class="mt-3 text-xs text-surface-500 dark:text-surface-300">{$t('app.filters.none')}</p>
          {/if}
        </div>

        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <button
            class={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
              menuView === 'index'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-400 text-white shadow-lg'
                : 'border border-primary-500/25 bg-white/70 text-surface-600 dark:border-surface-700/40 dark:bg-surface-800/60 dark:text-surface-200'
            }`}
            on:click={() => (menuView = 'index')}
            type="button"
          >
            <LayoutList class="h-4 w-4" />
            {$t('app.toggle_index')}
          </button>
          <button
            class={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
              menuView === 'favourites'
                ? 'bg-gradient-to-r from-primary-500 to-secondary-400 text-white shadow-lg'
                : 'border border-primary-500/25 bg-white/70 text-surface-600 dark:border-surface-700/40 dark:bg-surface-800/60 dark:text-surface-200'
            }`}
            on:click={() => (menuView = 'favourites')}
            type="button"
          >
            <Heart class="h-4 w-4" />
            {$t('app.toggle_favourites')}
          </button>
        </div>

        {#if menuView === 'favourites'}
          {#if favouriteSongs.length === 0}
            <p class="rounded-2xl border border-primary-500/15 bg-white/60 p-4 text-sm text-surface-500 dark:border-surface-700/30 dark:bg-surface-800/70 dark:text-surface-300">
              {$t('app.no_favourites')}
            </p>
          {:else}
            <ul class="space-y-3 text-sm">
              {#each favouriteSongs as favSong (favSong.id + '-' + favSong.language)}
                <li class="overflow-hidden rounded-2xl border border-primary-500/15 bg-white/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-surface-700/40 dark:bg-surface-800/70">
                  <button class="flex w-full flex-col items-start gap-1 px-4 py-3 text-left" on:click={() => openSong(favSong)} type="button">
                    <p class="text-base font-semibold text-surface-800 dark:text-surface-100">{favSong.title}</p>
                    <p class="text-xs uppercase tracking-[0.3em] text-primary-400/80">
                      {$t('app.page_label')} {favSong.page}
                    </p>
                  </button>
                </li>
              {/each}
            </ul>
          {/if}
        {:else}
          <div class="space-y-4">
            {#each pageGroups as group}
              <details class="overflow-hidden rounded-2xl border border-primary-500/15 bg-white/70 p-0 dark:border-surface-700/40 dark:bg-surface-800/70" open>
                <summary class="flex cursor-pointer items-center justify-between px-5 py-3 text-sm font-semibold text-surface-700 dark:text-surface-200">
                  <span class="inline-flex items-center gap-2">
                    <MapPinned class="h-4 w-4 text-primary-500" />
                    {group.label}
                  </span>
                  <span class="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-500">
                    {group.pages.length}
                  </span>
                </summary>
                <div class="divide-y divide-primary-500/10">
                  {#each group.pages as pageNumber}
                    <button
                      class={`flex w-full items-center justify-between px-5 py-2 text-left text-sm transition ${
                        pageFilter === pageNumber ? 'text-primary-500' : 'hover:text-primary-500'
                      }`}
                      on:click={() => handlePageSelect(pageNumber)}
                      type="button"
                    >
                      <span>{$t('app.page_label')} {pageNumber}</span>
                      <span class="text-xs text-surface-500 dark:text-surface-300">
                        {(groupedByPage[pageNumber] ?? []).length}
                      </span>
                    </button>
                  {/each}
                </div>
              </details>
            {/each}
          </div>
        {/if}
      </div>
    </aside>

    <section class="space-y-6" use:fadeSlide={{ axis: 'y', from: 30, delay: 0.05 }}>
      <div class="space-y-4 rounded-3xl border border-primary-500/20 bg-white/80 px-5 py-5 text-sm shadow-lg backdrop-blur-xl dark:border-surface-700/40 dark:bg-surface-900/80" use:melt={$viewTabsRoot}>
        <div class="flex flex-wrap items-center justify-between gap-4 text-surface-500 dark:text-surface-300">
          <div class="flex items-center gap-3">
            <span class="text-lg font-semibold text-surface-800 dark:text-surface-100">{filteredSongs.length}</span>
            <span>/</span>
            <span>{availableSongs.length}</span>
            {#if pageFilter}
              <span class="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">
                {$t('app.page_label')} {pageFilter}
              </span>
            {/if}
          </div>
          {#if filterBadges.length}
            <div class="flex flex-wrap items-center gap-2">
              {#each filterBadges.slice(0, 2) as badge, badgeIndex}
                <span class="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-500">{badge}</span>
                {#if badgeIndex === 1 && filterBadges.length > 2}
                  <span class="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-surface-500 dark:bg-surface-800/70 dark:text-surface-200">
                    +{filterBadges.length - 2}
                  </span>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-wrap gap-2" use:melt={$viewTabsList}>
            <button
              class={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
                $viewTabValue === 'basic'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-400 text-white shadow-lg'
                  : 'border border-primary-500/20 bg-white/70 text-surface-600 dark:border-surface-700/40 dark:bg-surface-800/70 dark:text-surface-200'
              }`}
              use:melt={$viewTabsTrigger({ value: 'basic' })}
              type="button"
            >
              {$t('app.view.basic')}
            </button>
            <button
              class={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${
                $viewTabValue === 'chords'
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-400 text-white shadow-lg'
                  : 'border border-primary-500/20 bg-white/70 text-surface-600 dark:border-surface-700/40 dark:bg-surface-800/70 dark:text-surface-200'
              }`}
              use:melt={$viewTabsTrigger({ value: 'chords' })}
              type="button"
            >
              {$t('app.view.chords')}
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-surface-500 dark:text-surface-300">
            <span>{$t('app.sort.label')}</span>
            {#each sortOptions as option}
              <button
                class={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold normal-case tracking-normal transition ${
                  sortMode === option.value
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-400 text-white shadow-lg'
                    : 'border border-primary-500/20 bg-white/70 text-surface-600 dark:border-surface-700/40 dark:bg-surface-800/70 dark:text-surface-200'
                }`}
                aria-pressed={sortMode === option.value}
                on:click={() => (sortMode = option.value)}
                type="button"
              >
                <span class="inline-flex items-center gap-2 text-sm">
                  <svelte:component this={option.icon} class="h-4 w-4" />
                  <span>{$t(option.label)}</span>
                </span>
              </button>
            {/each}
          </div>
        </div>
      </div>

      {#if filteredSongs.length === 0}
        <div class="rounded-[2rem] border border-primary-500/15 bg-white/70 px-8 py-12 text-center text-sm text-surface-500 shadow-inner dark:border-surface-700/40 dark:bg-surface-900/80 dark:text-surface-300">
          {$t('app.empty_state')}
        </div>
      {:else}
        <div class="space-y-6">
          {#each filteredSongs as song, index (song.id + '-' + song.language)}
            <SongCard
              {song}
              {index}
              viewMode={activeViewMode}
              isFavourite={$favourites.includes(`${song.id}-${song.language}`)}
              on:open={(event) => openSong(event.detail)}
              on:toggleFavourite={(event) => toggleFavourite(event.detail)}
            />
          {/each}
        </div>
      {/if}
    </section>
  </div>
</section>

<section class="relative mt-16 overflow-hidden rounded-[2.75rem] border border-primary-500/20 bg-gradient-to-br from-primary-500/10 via-white/80 to-secondary-400/10 px-6 py-12 shadow-2xl backdrop-blur-xl dark:border-surface-700/40 dark:from-primary-500/15 dark:via-surface-900/90 dark:to-secondary-500/10 sm:px-12" use:fadeSlide={{ axis: 'y', from: 40, delay: 0.08 }}>
  <div class="pointer-events-none absolute inset-0 -z-10">
    <div class="absolute -left-24 top-0 h-64 w-64 rounded-full bg-primary-500/20 blur-[140px]"></div>
    <div class="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-secondary-400/25 blur-[160px]"></div>
  </div>
  <div class="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
    <span class="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-primary-500 dark:bg-surface-800/80">
      <Sparkles class="h-4 w-4" />
      {$t('app.brand_global')}
    </span>
    <h3 class="text-balance text-3xl font-semibold text-surface-900 dark:text-surface-50 sm:text-4xl">
      {$t('app.cta.title')}
    </h3>
    <p class="max-w-2xl text-base text-surface-600 dark:text-surface-300">
      {$t('app.cta.subtitle')}
    </p>
    <div class="flex flex-wrap justify-center gap-3">
      <button
        class="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-400 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
        on:click={focusSearchInput}
        type="button"
      >
        <LayoutList class="h-4 w-4" />
        {$t('app.cta.primary')}
      </button>
      <button
        class="inline-flex items-center justify-center gap-2 rounded-full border border-primary-500/25 bg-white/80 px-6 py-3 text-sm font-semibold text-surface-600 transition hover:-translate-y-0.5 hover:border-primary-500 hover:text-primary-500 dark:border-surface-700/40 dark:bg-surface-900/80 dark:text-surface-200"
        on:click={openFavouritesQuickly}
        type="button"
      >
        <Heart class="h-4 w-4" />
        {$t('app.cta.secondary')}
      </button>
    </div>
  </div>
</section>
