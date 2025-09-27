<script lang="ts">
  import { t } from 'svelte-i18n';
  import { goto } from '$app/navigation';
  import { language, favourites, viewMode, toggleFavourite } from '$lib/stores/preferences';
  import { searchableSongs, songs, filterSongs } from '$lib/stores/songStore';
  import { buildPageIndex, songsByPage } from '$lib/utils/pageIndex';
  import { listTransition } from '$lib/actions/listTransition';
  import type { Song } from '$lib/types/song';
  import { createTabs, melt } from '@melt-ui/svelte';
  import { get } from 'svelte/store';

  let query = '';
  let menuView: 'index' | 'favourites' = 'index';
  let pageFilter: number | null = null;

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
  }

  function openSong(song: Song) {
    goto(`/song/${song.id}?lang=${song.language}`);
  }

  function handlePageSelect(pageNumber: number) {
    pageFilter = pageNumber;
    menuView = 'index';
  }
</script>

<section class="grid gap-8 lg:grid-cols-[320px,1fr]">
  <aside class="glass-panel p-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-[rgb(var(--text-primary))]">{$t('app.page_index')}</h2>
      <button
        class="text-xs font-medium text-[rgb(var(--accent))]"
        on:click={handleClearFilters}
      >
        Reset
      </button>
    </div>
    <div class="mt-4 space-y-4">
      <div class="flex gap-2">
        <button
          class={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
            menuView === 'index'
              ? 'bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] shadow-lg'
              : 'surface-pill text-[rgb(var(--text-secondary))]'
          }`}
          on:click={() => (menuView = 'index')}
        >
          {$t('app.toggle_index')}
        </button>
        <button
          class={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
            menuView === 'favourites'
              ? 'bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] shadow-lg'
              : 'surface-pill text-[rgb(var(--text-secondary))]'
          }`}
          on:click={() => (menuView = 'favourites')}
        >
          {$t('app.toggle_favourites')}
        </button>
      </div>

      {#if menuView === 'favourites'}
        {#if favouriteSongs.length === 0}
          <p class="text-sm text-[rgb(var(--text-secondary))]">No favourites yet.</p>
        {:else}
          <ul class="space-y-3 text-sm">
            {#each favouriteSongs as favSong (favSong.id + '-' + favSong.language)}
              <li class="glass-panel p-3 shadow-sm">
                <button class="text-left" on:click={() => openSong(favSong)}>
                  <p class="font-semibold">{favSong.title}</p>
                  <p class="text-xs text-[rgb(var(--text-secondary))]">
                    {$t('app.page_label')} {favSong.page}
                  </p>
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      {:else}
        <div class="space-y-2">
          {#each pageGroups as group}
            <details class="glass-panel overflow-hidden" open>
              <summary class="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold">
                <span>{group.label}</span>
                <span class="chip">{group.pages.length}</span>
              </summary>
              <div class="divide-y divide-[rgb(var(--border-muted))] px-4">
                {#each group.pages as pageNumber}
                  <button
                    class={`flex w-full items-center justify-between py-2 text-left text-sm transition ${
                      pageFilter === pageNumber
                        ? 'text-[rgb(var(--accent))]' : 'hover:text-[rgb(var(--accent))]'
                    }`}
                    on:click={() => handlePageSelect(pageNumber)}
                  >
                    <span>
                      {$t('app.page_label')} {pageNumber}
                    </span>
                    <span class="text-xs text-[rgb(var(--text-secondary))]">
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

  <section class="space-y-6">
    <div class="glass-panel flex flex-col gap-4 p-6">
      <div>
        <label class="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-secondary))]" for="song-search">
          {$t('app.search_placeholder')}
        </label>
        <div class="mt-2 flex items-center gap-3 rounded-2xl border-soft surface-pill px-4 py-3 shadow-inner">
          <span>🔍</span>
          <input
            id="song-search"
            class="w-full bg-transparent text-base outline-none"
            type="search"
            placeholder={$t('app.search_placeholder')}
            bind:value={query}
          />
          {#if query}
            <button class="text-sm text-[rgb(var(--text-secondary))]" on:click={() => (query = '')}>Clear</button>
          {/if}
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-sm text-[rgb(var(--text-secondary))]">
          <span>{filteredSongs.length} / {availableSongs.length}</span>
          <span>•</span>
          {#if pageFilter}
            <span>{$t('app.page_label')} {pageFilter}</span>
          {/if}
        </div>
        <div class="flex items-center gap-2" use:melt={$viewTabsRoot}>
          <div class="surface-pill flex gap-2 rounded-full p-1" use:melt={$viewTabsList}>
            <button
              class={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                $viewTabValue === 'basic'
                  ? 'bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] shadow'
                  : 'text-[rgb(var(--text-secondary))]'
              }`}
              use:melt={$viewTabsTrigger({ value: 'basic' })}
            >
              {$t('app.view.basic')}
            </button>
            <button
              class={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                $viewTabValue === 'chords'
                  ? 'bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))] shadow'
                  : 'text-[rgb(var(--text-secondary))]'
              }`}
              use:melt={$viewTabsTrigger({ value: 'chords' })}
            >
              {$t('app.view.chords')}
            </button>
          </div>
        </div>
      </div>
    </div>

    {#if filteredSongs.length === 0}
      <div class="glass-panel p-10 text-center text-sm text-[rgb(var(--text-secondary))]">
        {$t('app.empty_state')}
      </div>
    {:else}
      <div class="grid gap-6">
        {#each filteredSongs as song, index (song.id + '-' + song.language)}
          <article
            class="glass-panel flex flex-col gap-4 p-6 transition hover:-translate-y-1 hover:shadow-2xl"
            use:listTransition={index}
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="text-xl font-semibold text-[rgb(var(--text-primary))]">{song.title}</h3>
                <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--text-secondary))]">
                  <span class="chip">{$t('app.page_label')} {song.page}</span>
                  <span class="chip">{$t('app.source_label')} {song.source}</span>
                  <span class="chip">{$t('app.external_index')} {song.externalIndex}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  class={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    $favourites.includes(`${song.id}-${song.language}`)
                      ? 'bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))]'
                      : 'surface-pill text-[rgb(var(--text-secondary))]'
                  }`}
                  on:click={() => toggleFavourite(`${song.id}-${song.language}`)}
                >
                  {$favourites.includes(`${song.id}-${song.language}`)
                    ? $t('app.remove_favourite')
                    : $t('app.add_favourite')}
                </button>
                <button
                  class="rounded-full border border-[rgb(var(--border-muted))] px-4 py-2 text-sm font-semibold text-[rgb(var(--accent))]"
                  on:click={() => openSong(song)}
                >
                  {$t('app.view_song')}
                </button>
              </div>
            </div>

            <div class={`space-y-1 text-[rgb(var(--text-primary))] ${$viewTabValue === 'chords' ? 'lg:grid lg:grid-cols-[180px,1fr] lg:gap-4' : ''}`}>
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
                      <span class="text-xs uppercase tracking-wide text-[rgb(var(--text-secondary))]">TAB</span>
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
</section>
