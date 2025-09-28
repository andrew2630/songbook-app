<script lang="ts">
  import { t } from 'svelte-i18n';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { language, favourites, viewMode, toggleFavourite } from '$lib/stores/preferences';
  import { searchableSongs, songs, filterSongs } from '$lib/stores/songStore';
  import { buildPageIndex, songsByPage } from '$lib/utils/pageIndex';
  import { listTransition } from '$lib/actions/listTransition';
  import { fadeSlide } from '$lib/actions/fadeSlide';
  import type { Song } from '$lib/types/song';
  import { createTabs, melt } from '@melt-ui/svelte';
  import { onMount } from 'svelte';
  import { Search, ChevronDown, ChevronUp, Dot, Heart, Music3, BookText } from 'lucide-svelte';
  import { get } from 'svelte/store';

  let query = '';
  let menuView: 'index' | 'favourites' = 'index';
  let pageFilter: number | null = null;
  let filtersOpen = browser ? false : true;
  let isDesktop = false;

  onMount(() => {
    if (!browser) return;
    const update = () => {
      const desktop = window.innerWidth >= 1280;
      isDesktop = desktop;
      filtersOpen = desktop;
    };
    update();
    window.addEventListener('resize', update);
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

  $: availableSongs = $songs.filter((song) => song.language === $language);
  $: groupedByPage = songsByPage(availableSongs);
  $: pageGroups = buildPageIndex(availableSongs);
  $: filteredSongs = filterSongs(
    $searchableSongs,
    query,
    $language,
    menuView === 'favourites',
    $favourites,
    pageFilter
  );
  $: favouriteSongs = $favourites
    .map((key) => $songs.find((song) => `${song.id}-${song.language}` === key) ?? null)
    .filter((song): song is Song => song !== null);

  function handleClearFilters() {
    query = '';
    pageFilter = null;
    menuView = 'index';
    filtersOpen = false;
  }

  function openSong(song: Song) {
    goto(`/song/${song.id}?lang=${song.language}`);
  }

  function handlePageSelect(pageNumber: number) {
    pageFilter = pageNumber;
    menuView = 'index';
  }
</script>

<section class="space-y-12">
  <div class="card px-6 py-6 sm:px-8 sm:py-10" use:fadeSlide={{ delay: 0.05 }}>
    <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-4">
        <div class="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--surface-muted))]/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
          <Music3 class="h-4 w-4" />
          <span>{$t('app.search_placeholder')}</span>
        </div>
        <h2 class="text-2xl font-semibold text-[rgb(var(--foreground))] sm:text-3xl">
          {$t('app.toggle_index')}
        </h2>
        <p class="max-w-2xl text-sm text-[rgb(var(--muted))] sm:text-base">
          {$t('app.tagline')}
        </p>
      </div>
      <div class="w-full max-w-xl space-y-3">
        <label class="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]" for="song-search">
          {$t('app.search_placeholder')}
        </label>
        <div class="flex items-center gap-3 rounded-2xl border border-[rgb(var(--surface-border))/0.6] bg-white/65 px-4 py-3 shadow-inner dark:bg-white/10">
          <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgb(var(--surface-muted))]/70 text-[rgb(var(--accent))]">
            <Search class="h-5 w-5" />
          </span>
          <input
            id="song-search"
            class="w-full bg-transparent text-base text-[rgb(var(--foreground))] outline-none"
            type="search"
            placeholder={$t('app.search_placeholder')}
            bind:value={query}
          />
          {#if query}
            <button
              class="text-sm font-semibold text-[rgb(var(--accent))] transition hover:text-[rgb(var(--accent))]/80"
              on:click={() => (query = '')}
            >
              {$t('app.clear_query')}
            </button>
          {/if}
        </div>
      </div>
    </div>
    <div class="mt-8 grid gap-4 sm:grid-cols-3" use:fadeSlide={{ delay: 0.1 }}>
      <div class="stat">
        <Dot class="h-5 w-5 text-[rgb(var(--accent))]" />
        <div>
          <p class="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">{$t('app.page_index')}</p>
          <p class="text-lg font-semibold text-[rgb(var(--foreground))]">{filteredSongs.length} / {availableSongs.length}</p>
        </div>
      </div>
      <div class="stat">
        <Heart class="h-5 w-5 text-[rgb(var(--accent))]" />
        <div>
          <p class="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">{$t('app.toggle_favourites')}</p>
          <p class="text-lg font-semibold text-[rgb(var(--foreground))]">{favouriteSongs.length}</p>
        </div>
      </div>
      <div class="stat">
        <BookText class="h-5 w-5 text-[rgb(var(--accent))]" />
        <div>
          <p class="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">{$t('app.view_song')}</p>
          <p class="text-lg font-semibold text-[rgb(var(--foreground))]">
            {$viewMode === 'basic' ? $t('app.view.basic') : $t('app.view.chords')}
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="grid gap-10 xl:grid-cols-[320px,1fr]">
    <div class="space-y-4 xl:space-y-6">
      <button
        class="toolbar flex w-full items-center justify-between rounded-full px-4 py-3 text-sm font-semibold text-[rgb(var(--foreground))] transition hover:shadow-lg xl:hidden"
        on:click={() => (filtersOpen = !filtersOpen)}
        aria-expanded={filtersOpen}
        aria-controls="songbook-filters"
      >
        <span>{$t('app.page_index')}</span>
        <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(var(--surface-muted))]/80 text-[rgb(var(--muted))]">
          {#if filtersOpen}
            <ChevronUp class="h-4 w-4" />
          {:else}
            <ChevronDown class="h-4 w-4" />
          {/if}
        </span>
      </button>

      <aside
        id="songbook-filters"
        class="card card-muted space-y-6 px-6 py-6"
        class:hidden={!filtersOpen && !isDesktop}
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-[rgb(var(--foreground))]">{$t('app.page_index')}</h3>
          <button
            class="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--accent))] hover:underline"
            on:click={handleClearFilters}
          >
            {$t('app.reset_filters')}
          </button>
        </div>
        <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <button
            class={`btn ${menuView === 'index' ? 'btn-primary' : 'btn-ghost'}`}
            on:click={() => (menuView = 'index')}
          >
            {$t('app.toggle_index')}
          </button>
          <button
            class={`btn ${menuView === 'favourites' ? 'btn-primary' : 'btn-ghost'}`}
            on:click={() => (menuView = 'favourites')}
          >
            {$t('app.toggle_favourites')}
          </button>
        </div>
        {#if menuView === 'favourites'}
          {#if favouriteSongs.length === 0}
            <p class="rounded-2xl bg-white/60 px-4 py-3 text-sm text-[rgb(var(--muted))] dark:bg-white/10">
              {$t('app.no_favourites')}
            </p>
          {:else}
            <ul class="space-y-3 text-sm">
              {#each favouriteSongs as favSong (favSong.id + '-' + favSong.language)}
                <li class="card-outline rounded-2xl bg-white/70 p-4 shadow-sm transition hover:shadow-lg dark:bg-white/5">
                  <button class="w-full text-left" on:click={() => openSong(favSong)}>
                    <p class="text-base font-semibold text-[rgb(var(--foreground))]">{favSong.title}</p>
                    <p class="text-xs text-[rgb(var(--muted))]">
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
              <details class="card-outline overflow-hidden rounded-2xl bg-white/60 dark:bg-white/5" open>
                <summary class="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-[rgb(var(--foreground))]">
                  <span>{group.label}</span>
                  <span class="chip">{group.pages.length}</span>
                </summary>
                <div class="divide-y divide-[rgb(var(--surface-border))/0.6]">
                  {#each group.pages as pageNumber}
                    <button
                      class={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition ${
                        pageFilter === pageNumber
                          ? 'text-[rgb(var(--accent))]' : 'hover:text-[rgb(var(--accent))]'
                      }`}
                      on:click={() => handlePageSelect(pageNumber)}
                    >
                      <span>{$t('app.page_label')} {pageNumber}</span>
                      <span class="text-xs text-[rgb(var(--muted))]">
                        {(groupedByPage[pageNumber] ?? []).length}
                      </span>
                    </button>
                  {/each}
                </div>
              </details>
            {/each}
          </div>
        {/if}
      </aside>
    </div>

    <section class="space-y-6">
      <div class="toolbar flex flex-wrap items-center justify-between gap-4 rounded-3xl px-4 py-3" use:melt={$viewTabsRoot}>
        <div class="flex items-center gap-3 text-sm text-[rgb(var(--muted))]">
          <span class="font-semibold text-[rgb(var(--foreground))]">{filteredSongs.length}</span>
          <span>/</span>
          <span>{availableSongs.length}</span>
          {#if pageFilter}
            <span class="chip">{$t('app.page_label')} {pageFilter}</span>
          {/if}
        </div>
        <div class="flex gap-2" use:melt={$viewTabsList}>
          <button
            class={`btn ${$viewTabValue === 'basic' ? 'btn-primary' : 'btn-ghost'}`}
            use:melt={$viewTabsTrigger({ value: 'basic' })}
          >
            {$t('app.view.basic')}
          </button>
          <button
            class={`btn ${$viewTabValue === 'chords' ? 'btn-primary' : 'btn-ghost'}`}
            use:melt={$viewTabsTrigger({ value: 'chords' })}
          >
            {$t('app.view.chords')}
          </button>
        </div>
      </div>

      {#if filteredSongs.length === 0}
        <div class="card-muted rounded-3xl px-8 py-12 text-center text-sm text-[rgb(var(--muted))]">
          {$t('app.empty_state')}
        </div>
      {:else}
        <div class="grid gap-6">
          {#each filteredSongs as song, index (song.id + '-' + song.language)}
            <article
              class="card relative overflow-hidden px-6 py-6 transition hover:-translate-y-1 hover:shadow-2xl sm:px-8"
              use:listTransition={index}
            >
              <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[rgb(var(--accent))] via-[rgb(var(--secondary))] to-[rgb(var(--accent))] opacity-75"></div>
              <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div class="space-y-3">
                  <h3 class="text-2xl font-semibold text-[rgb(var(--foreground))]">{song.title}</h3>
                  <div class="flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--muted))]">
                    <span class="chip">{$t('app.page_label')} {song.page}</span>
                    <span class="chip">{$t('app.source_label')} {song.source}</span>
                    <span class="chip">{$t('app.external_index')} {song.externalIndex}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    class={`btn ${$favourites.includes(`${song.id}-${song.language}`) ? 'btn-primary' : 'btn-ghost'}`}
                    on:click={() => toggleFavourite(`${song.id}-${song.language}`)}
                  >
                    {$favourites.includes(`${song.id}-${song.language}`)
                      ? $t('app.remove_favourite')
                      : $t('app.add_favourite')}
                  </button>
                  <button
                    class="btn btn-primary"
                    on:click={() => openSong(song)}
                  >
                    {$t('app.view_song')}
                  </button>
                </div>
              </div>

              <div class={`mt-6 space-y-2 text-[rgb(var(--foreground))] ${
                $viewTabValue === 'chords' ? 'lg:grid lg:grid-cols-[200px,1fr] lg:gap-4' : ''
              }`}>
                {#each song.items as item}
                  {#if item.text.trim().length}
                    <p
                      class={`text-sm leading-relaxed ${
                        item.alignment === 'CENTER'
                          ? 'text-center'
                          : item.alignment === 'RIGHT'
                          ? 'text-right'
                          : 'text-left'
                      } ${item.isBold ? 'font-semibold' : ''} ${item.isItalics ? 'italic' : ''}`}
                    >
                      {#if $viewTabValue === 'chords'}
                        <span class="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">TAB</span>
                        <span class="ml-3 block text-base font-medium">{item.text}</span>
                      {:else}
                        {item.text}
                      {/if}
                    </p>
                  {/if}
                {/each}
              </div>
            </article>
          {/each}
        </div>
      {/if}
    </section>
  </div>
</section>
