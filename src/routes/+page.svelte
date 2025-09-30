<script lang="ts">
	import { t } from 'svelte-i18n';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { favourites, language, toggleFavourite, viewMode } from '$lib/stores/preferences';
	import { filterSongs, searchableSongs, songs, type SongSortMode } from '$lib/stores/songStore';
	import { buildPageIndex, songsByPage } from '$lib/utils/pageIndex';
	import SongCard from '$lib/components/song/SongCard.svelte';
	import { fadeSlide } from '$lib/actions/fadeSlide';
	import { onMount } from 'svelte';
	import { ArrowUp, Heart, LayoutList, Search } from 'lucide-svelte';
	import type { Song } from '$lib/types/song';

	let query = '';
	let menuView: 'index' | 'favourites' = 'index';
	let pageFilter: number | null = null;
	let activeViewMode: 'basic' | 'chords' = 'basic';
	let sortMode: SongSortMode = 'page';
	let searchRef: HTMLInputElement | null = null;
	let pageSearch = '';
	let showScrollTop = false;

	const sortOptions: { value: SongSortMode; label: string }[] = [
		{ value: 'page', label: 'app.sort.page' },
		{ value: 'alpha', label: 'app.sort.alpha' },
		{ value: 'recent', label: 'app.sort.recent' }
	];

	onMount(() => {
		if (!browser) return;
		const updateScrollState = () => {
			showScrollTop = window.scrollY > 320;
		};
		updateScrollState();
		window.addEventListener('scroll', updateScrollState, { passive: true });
		return () => window.removeEventListener('scroll', updateScrollState);
	});

	$: activeViewMode = $viewMode;

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
		pageFilter ? $t('app.filters.page', { values: { page: pageFilter } }) : null,
		pageSearch.trim()
			? $t('app.filters.page_search', { values: { query: pageSearch.trim() } })
			: null
	].filter((badge): badge is string => Boolean(badge));

	function matchesPageSearch(pageNumber: number) {
		const trimmed = pageSearch.trim();
		if (!trimmed) return true;
		return String(pageNumber).includes(trimmed);
	}

	function pagesForGroup(group: { label: string; pages: number[] }) {
		return group.pages.filter((pageNumber) => matchesPageSearch(pageNumber));
	}

	function handleClearFilters() {
		query = '';
		pageFilter = null;
		menuView = 'index';
		pageSearch = '';
	}

	function openSong(song: Song) {
		goto(`/song/${song.id}?lang=${song.language}`);
	}

	function handlePageSelect(pageNumber: number) {
		pageFilter = pageNumber;
		menuView = 'index';
	}

	function scrollToTop() {
		if (!browser) return;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<section class="space-y-6 pb-14 sm:space-y-8">
        <div
                class="space-y-5 rounded-3xl border border-white/60 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.86)_100%)] p-4 shadow-[0_25px_70px_rgba(15,23,42,0.1)] backdrop-blur-2xl sm:p-6"
                use:fadeSlide
        >
		<div class="space-y-2">
			<!-- <label
        class="text-[11px] font-semibold uppercase tracking-[0.2em] text-surface-500"
        for="song-search"
      >
        {$t('app.search_placeholder')}
      </label> -->
                        <div
                                class="flex items-center gap-3 rounded-2xl border border-white/60 bg-[rgba(255,255,255,0.9)] px-4 py-3 shadow-inner shadow-[rgba(245,158,11,0.12)]"
                        >
                                <Search class="h-4 w-4 text-primary-500" />
                                <input
                                        id="song-search"
                                        class="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-muted sm:text-base"
                                        type="search"
                                        placeholder={$t('app.search_placeholder')}
                                        bind:value={query}
					bind:this={searchRef}
				/>
                                {#if query}
                                        <button
                                                class="rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-600 shadow-sm transition hover:bg-[rgb(var(--accent-gold)/0.16)] hover:text-[rgb(var(--accent-gold)/0.9)]"
                                                on:click={() => (query = '')}
                                                type="button"
                                        >
                                                {$t('app.clear_query')}
                                        </button>
                                {/if}
                        </div>
			<!-- <p class="text-xs text-surface-500">{$t('app.search_hint')}</p> -->
		</div>

                <div class="flex flex-wrap items-center gap-3 text-xs text-on-surface-soft sm:text-sm">
                        <span class="font-semibold text-on-surface">{filteredSongs.length}</span>
			<span>/</span>
			<span>{availableSongs.length}</span>
			{#if pageFilter}
                                <span
                                        class="rounded-full border border-[rgb(var(--accent-gold)/0.4)] bg-[rgb(var(--accent-gold)/0.16)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--accent-gold)/0.95)]"
                                >
                                        {$t('app.page_label')}
                                        {pageFilter}
				</span>
			{/if}
		</div>

		{#if filterBadges.length}
                        <div class="flex flex-wrap gap-2">
                                {#each filterBadges as badge}
                                        <span
                                                class="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--accent-gold)/0.35)] bg-[rgb(var(--accent-gold)/0.12)] px-3 py-1 text-xs font-semibold text-[rgb(var(--accent-gold)/0.95)] shadow-sm"
                                        >
                                                {badge}
                                        </span>
                                {/each}
                        </div>
                {/if}
        </div>

        <div
                class="space-y-5 rounded-3xl border border-white/60 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.86)_100%)] p-4 shadow-[0_25px_70px_rgba(15,23,42,0.1)] backdrop-blur-2xl sm:p-6"
                use:fadeSlide={{ axis: 'y', from: 30, delay: 0.05 }}
        >
                <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div class="flex flex-wrap gap-2">
                                <button
                                        class={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                                                menuView === 'index'
                                                        ? 'btn-gold'
                                                        : 'border border-white/60 bg-white/75 text-on-surface hover:border-[rgb(var(--accent-gold)/0.45)] hover:text-primary-600'
                                        }`}
                                        on:click={() => (menuView = 'index')}
                                        type="button"
                                >
                                        <LayoutList class="h-4 w-4" />
                                        {$t('app.toggle_index')}
                                </button>
                                <button
                                        class={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                                                menuView === 'favourites'
                                                        ? 'btn-gold'
                                                        : 'border border-white/60 bg-white/75 text-on-surface hover:border-[rgb(var(--accent-gold)/0.45)] hover:text-primary-600'
                                        }`}
                                        on:click={() => (menuView = 'favourites')}
                                        type="button"
                                >
					<Heart class="h-4 w-4" />
					{$t('app.toggle_favourites')}
				</button>
                                <button
                                        class="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/75 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-muted transition hover:border-[rgb(var(--accent-gold)/0.45)] hover:text-[rgb(var(--accent-gold)/0.95)]"
                                        on:click={handleClearFilters}
                                        type="button"
                                >
					{$t('app.reset_filters')}
				</button>
			</div>

			<label class="flex items-center gap-3 text-sm font-medium text-surface-600 lg:ml-auto">
				<span class="text-[11px] font-semibold uppercase tracking-[0.2em] text-surface-500">
					{$t('app.sort.label')}
				</span>
				<select
					class="rounded-full border border-surface-200/60 bg-surface-100/70 px-3 py-2 text-sm font-semibold text-surface-700 outline-none"
					bind:value={sortMode}
				>
					{#each sortOptions as option}
						<option value={option.value}>{$t(option.label)}</option>
					{/each}
				</select>
			</label>
		</div>

		<div class="space-y-4">
			<!-- <input
        id="page-search"
        class="w-full rounded-xl border border-surface-200/60 bg-surface-100/80 px-3 py-2 text-sm text-surface-700 outline-none placeholder:text-surface-400"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        placeholder={$t('app.page_search.placeholder')}
        bind:value={pageSearch}
        aria-label={$t('app.page_search.placeholder')}
      /> -->

			{#if menuView === 'favourites'}
				{#if favouriteSongs.length === 0}
                                        <p
                                                class="rounded-xl border border-surface-200/60 bg-surface-50/80 px-4 py-4 text-sm text-on-surface-subtle"
                                        >
                                                {$t('app.no_favourites')}
                                        </p>
                                {:else}
                                        <ul class="grid gap-3 sm:grid-cols-2">
                                                {#each favouriteSongs as favSong (favSong.id + '-' + favSong.language)}
                                                        <li>
                                                                <button
                                                                        class="w-full rounded-xl border border-surface-200/60 bg-surface-100/70 px-4 py-3 text-left text-sm font-semibold text-on-surface transition hover:border-primary-400 hover:text-primary-500"
                                                                        on:click={() => openSong(favSong)}
                                                                        type="button"
                                                                >
                                                                        <span class="block text-base font-semibold text-on-surface">{favSong.title}</span>
                                                                        <span class="text-xs uppercase tracking-[0.28em] text-on-surface-subtle">
                                                                                {$t('app.page_label')}
                                                                                {favSong.page}
                                                                        </span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			{:else}
				<div class="space-y-4">
					<!-- {#each pageGroups as group (group.label)}
            {@const pages = pagesForGroup(group)}
            {#if pages.length}
              <div class="space-y-2">
                <p class="text-xs font-semibold uppercase tracking-[0.28em] text-surface-500">{group.label}</p>
                <div class="flex flex-wrap gap-2">
                  {#each pages as pageNumber}
                    <button
                      class={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        pageFilter === pageNumber
                          ? 'border-transparent bg-primary-500 text-on-surface shadow-sm'
                          : 'border-surface-200/60 bg-surface-100/70 text-surface-600 hover:border-primary-400 hover:text-primary-500'
                      }`}
                      type="button"
                      on:click={() => handlePageSelect(pageNumber)}
                    >
                      <span>{$t('app.page_label')} {pageNumber}</span>
                      <span
                        class={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          pageFilter === pageNumber
                            ? 'bg-primary-500/20 text-on-surface shadow-inner shadow-primary-500/20'
                            : 'bg-primary-500/10 text-primary-500'
                        }`}
                      >
                        {(groupedByPage[pageNumber] ?? []).length}
                      </span>
                    </button>
                  {/each}
                </div>
              </div>
            {/if}
          {/each} -->
				</div>
			{/if}
		</div>
	</div>

	{#if filteredSongs.length === 0}
		<div
			class="rounded-2xl border border-dashed border-surface-200/60 bg-surface-50/70 px-6 py-12 text-center text-sm text-surface-500"
		>
			{$t('app.empty_state')}
		</div>
	{:else}
		<div class="space-y-4" use:fadeSlide={{ axis: 'y', from: 20, delay: 0.08 }}>
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

{#if showScrollTop}
        <button
                class="btn-gold icon-button fixed bottom-6 right-5 z-40"
                on:click={scrollToTop}
                type="button"
                aria-label={$t('app.scroll_to_top')}
                title={$t('app.scroll_to_top')}
        >
                <ArrowUp class="h-5 w-5" />
                <span class="sr-only">{$t('app.scroll_to_top')}</span>
        </button>
{/if}
