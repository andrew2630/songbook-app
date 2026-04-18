<script lang="ts">
	import { t } from 'svelte-i18n';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { favourites, language, toggleFavourite } from '$lib/stores/preferences';
	import {
		filterSongs,
		searchableSongs,
		songs,
		type SongSortMode,
		type SongSourceFilter
	} from '$lib/stores/songStore';
	import { inView } from '$lib/actions/inView';
	import { buildPageIndex, songsByPage } from '$lib/utils/pageIndex';
	import SongCard from '$lib/components/song/SongCard.svelte';
	import { onMount, tick } from 'svelte';
	import { ArrowUp, Heart, LayoutList, RotateCcw, Search } from 'lucide-svelte';
	import type { Song } from '$lib/types/song';
	import {
		getCurrentAppPath,
		rememberSongListPath,
		rememberSongReturnPath
	} from '$lib/utils/songNavigation';
	import TextZoomControl from '$lib/components/song/TextZoomControl.svelte';

	let query = '';
	let menuView: 'index' | 'favourites' = 'index';
	let pageFilter: number | null = null;
	let sortMode: SongSortMode = 'page';
	let sourceFilter: SongSourceFilter = 'all';
	let searchRef: HTMLInputElement | null = null;
	let pageSearch = '';
	let showScrollTop = false;
	let visibleCount = 24;
	let loadMoreSentinel: HTMLDivElement | null = null;
	let listStateKey = '';
	let viewportFillFrame: number | null = null;
	let hasInitialisedFiltersFromUrl = false;

	const sortOptions: { value: SongSortMode; label: string }[] = [
		{ value: 'page', label: 'app.sort.page' },
		{ value: 'alpha', label: 'app.sort.alpha' },
		{ value: 'recent', label: 'app.sort.recent' }
	];
	const sourceOptions: { value: SongSourceFilter; label: string }[] = [
		{ value: 'all', label: 'app.source.all' },
		{ value: 'zborowy', label: 'app.source.zborowy' },
		{ value: 'pielgrzym', label: 'app.source.pielgrzym' }
	];
	const INITIAL_RENDER_COUNT = 24;
	const RENDER_BATCH_COUNT = 24;

	function buildListUrl() {
		if (!browser) return `${base || '/'}`;

		const params = new URLSearchParams();
		const trimmedQuery = query.trim();
		if (trimmedQuery) params.set('q', trimmedQuery);
		if (menuView === 'favourites') params.set('view', menuView);
		if (pageFilter !== null) params.set('page', String(pageFilter));
		if (sortMode !== 'page') params.set('sort', sortMode);
		if (sourceFilter !== 'all') params.set('source', sourceFilter);

		const nextSearch = params.toString();
		return `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
	}

	function readFilterStateFromUrl() {
		if (!browser) return;

		const params = new URLSearchParams(window.location.search);
		const nextQuery = params.get('q');
		const nextMenuView = params.get('view');
		const nextPageFilter = params.get('page');
		const nextSortMode = params.get('sort');
		const nextSourceFilter = params.get('source');

		query = nextQuery ?? '';
		menuView = nextMenuView === 'favourites' ? 'favourites' : 'index';
		pageFilter = nextPageFilter && /^\d+$/.test(nextPageFilter) ? Number(nextPageFilter) : null;
		sortMode =
			nextSortMode === 'alpha' || nextSortMode === 'recent' || nextSortMode === 'page'
				? nextSortMode
				: 'page';
		sourceFilter =
			nextSourceFilter === 'zborowy' ||
			nextSourceFilter === 'pielgrzym' ||
			nextSourceFilter === 'all'
				? nextSourceFilter
				: 'all';
	}

	function syncFilterStateToUrl() {
		if (!browser || !hasInitialisedFiltersFromUrl) return;
		const nextUrl = buildListUrl();
		const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

		if (nextUrl !== currentUrl) {
			window.history.replaceState(window.history.state, '', nextUrl);
		}

		rememberSongListPath(nextUrl);
	}

	onMount(() => {
		if (!browser) return;
		readFilterStateFromUrl();
		hasInitialisedFiltersFromUrl = true;

		const updateScrollState = () => {
			showScrollTop = window.scrollY > 320;
		};

		updateScrollState();
		queueEnsureViewportFilled();
		window.addEventListener('scroll', updateScrollState, { passive: true });
		window.addEventListener('resize', queueEnsureViewportFilled, { passive: true });

		return () => {
			window.removeEventListener('scroll', updateScrollState);
			window.removeEventListener('resize', queueEnsureViewportFilled);
			if (viewportFillFrame !== null) {
				cancelAnimationFrame(viewportFillFrame);
			}
		};
	});

	$: syncFilterStateToUrl();

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
		sortMode,
		sourceFilter
	);
	$: visibleSongs = filteredSongs.slice(0, visibleCount);
	$: favouriteSongs = $favourites
		.map((key) => $songs.find((song) => `${song.id}-${song.language}` === key) ?? null)
		.filter((song): song is Song => song !== null);
	$: filterBadges = [
		query ? $t('app.filters.search', { values: { query } }) : null,
		menuView === 'favourites' ? $t('app.filters.favourites') : null,
		pageFilter ? $t('app.filters.page', { values: { page: pageFilter } }) : null,
		sourceFilter !== 'all'
			? $t('app.filters.source', { values: { source: $t(`app.source.${sourceFilter}`) } })
			: null,
		pageSearch.trim()
			? $t('app.filters.page_search', { values: { query: pageSearch.trim() } })
			: null
	].filter((badge): badge is string => Boolean(badge));
	$: {
		const nextListState = [
			$language,
			menuView,
			query.trim(),
			pageFilter ?? '',
			sortMode,
			sourceFilter,
			filteredSongs.length
		].join('::');

		if (nextListState !== listStateKey) {
			listStateKey = nextListState;
			visibleCount = Math.min(filteredSongs.length, INITIAL_RENDER_COUNT);
			queueEnsureViewportFilled();
		}
	}

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
		sourceFilter = 'all';
	}

	function openSong(song: Song) {
		const returnTo = browser ? buildListUrl() : getCurrentAppPath(`${base}/`);
		rememberSongReturnPath(returnTo);
		const params = new URLSearchParams({
			lang: song.language,
			returnTo
		});
		goto(`${base}/song/${song.id}?${params.toString()}`);
	}

	function handlePageSelect(pageNumber: number) {
		pageFilter = pageNumber;
		menuView = 'index';
	}

	function scrollToTop() {
		if (!browser) return;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function loadMoreSongs() {
		if (visibleCount >= filteredSongs.length) return;
		visibleCount = Math.min(filteredSongs.length, visibleCount + RENDER_BATCH_COUNT);
		queueEnsureViewportFilled();
	}

	function queueEnsureViewportFilled() {
		if (!browser) return;
		if (viewportFillFrame !== null) {
			cancelAnimationFrame(viewportFillFrame);
		}

		viewportFillFrame = window.requestAnimationFrame(() => {
			viewportFillFrame = null;
			void ensureViewportFilled();
		});
	}

	async function ensureViewportFilled() {
		if (!browser || !loadMoreSentinel) return;
		await tick();

		while (visibleCount < filteredSongs.length && loadMoreSentinel) {
			const rect = loadMoreSentinel.getBoundingClientRect();
			if (rect.top > window.innerHeight + 220) break;
			visibleCount = Math.min(filteredSongs.length, visibleCount + RENDER_BATCH_COUNT);
			await tick();
		}
	}
</script>

<section class="space-y-5 pb-14 sm:space-y-8">
	<div
		id="song-filters-panel"
		class="glass-panel space-y-4 rounded-[1.9rem] p-3.5 sm:space-y-5 sm:rounded-3xl sm:p-6"
	>
		<div class="space-y-2">
			<!-- <label
        class="text-[11px] font-semibold uppercase tracking-[0.2em] text-surface-500"
        for="song-search"
      >
        {$t('app.search_placeholder')}
      </label> -->
			<div class="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
				<div class="flex items-center justify-between gap-2">
					<div class="flex min-w-0 flex-wrap gap-1.5 sm:gap-2">
						<button
							class={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold sm:px-3.5 ${
								menuView === 'index' ? 'btn-gold' : 'btn-secondary'
							}`}
							on:click={() => (menuView = 'index')}
							type="button"
						>
							<LayoutList class="h-4 w-4" />
							{$t('app.toggle_index')}
						</button>
						<button
							class={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold sm:px-3.5 ${
								menuView === 'favourites' ? 'btn-gold' : 'btn-secondary'
							}`}
							on:click={() => (menuView = 'favourites')}
							type="button"
						>
							<Heart class="h-4 w-4" />
							{$t('app.toggle_favourites')}
						</button>
						<button
							class="btn-secondary hidden items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-muted hover:text-primary-500 sm:inline-flex sm:px-3.5 sm:text-[11px] sm:tracking-[0.22em]"
							on:click={handleClearFilters}
							type="button"
						>
							{$t('app.reset_filters')}
						</button>
					</div>
					<div class="inline-flex shrink-0 items-center gap-2">
						<button
							class="icon-button sm:hidden"
							on:click={handleClearFilters}
							type="button"
							aria-label={$t('app.reset_filters')}
							title={$t('app.reset_filters')}
						>
							<RotateCcw class="h-4 w-4" />
							<span class="sr-only">{$t('app.reset_filters')}</span>
						</button>
						<TextZoomControl />
					</div>
				</div>

				<label class="flex items-center gap-2.5 text-sm font-medium text-surface-600 lg:ml-auto">
					<span
						class="text-[10px] font-semibold uppercase tracking-[0.18em] text-surface-500 sm:text-[11px] sm:tracking-[0.2em]"
					>
						{$t('app.sort.label')}
					</span>
					<select
						class="rounded-[1.15rem] border border-surface-200/60 bg-surface-100/70 px-3 py-2 text-sm font-semibold text-surface-700 outline-none sm:rounded-full"
						bind:value={sortMode}
					>
						{#each sortOptions as option}
							<option value={option.value}>{$t(option.label)}</option>
						{/each}
					</select>
				</label>
			</div>
			<div
				class="glass-input flex items-center gap-3 rounded-[1.35rem] px-4 py-2.5 sm:rounded-2xl sm:py-3"
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
						class="btn-secondary rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-600 sm:text-[11px] sm:tracking-[0.22em]"
						on:click={() => (query = '')}
						type="button"
					>
						{$t('app.clear_query')}
					</button>
				{/if}
			</div>
			<div class="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex flex-wrap items-center gap-2">
					<span
						class="text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-muted sm:text-[11px] sm:tracking-[0.2em]"
					>
						{$t('app.source.label')}
					</span>
					<div
						class="segmented-toggle inline-flex flex-wrap items-center gap-1 rounded-[1.55rem] p-[3px] sm:rounded-full sm:p-1"
					>
						{#each sourceOptions as option}
							<button
								class="segmented-toggle__button inline-flex items-center rounded-[1.1rem] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] sm:rounded-full sm:px-3 sm:text-xs sm:tracking-[0.18em]"
								type="button"
								aria-pressed={sourceFilter === option.value}
								on:click={() => (sourceFilter = option.value)}
							>
								{$t(option.label)}
							</button>
						{/each}
					</div>
				</div>
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

	<!-- <div
		class="space-y-5 rounded-3xl border border-white/60 bg-[linear-gradient(160deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.86)_100%)] p-4 shadow-[0_25px_70px_rgba(15,23,42,0.1)] backdrop-blur-2xl sm:p-6"
		use:fadeSlide={{ axis: 'y', from: 30, delay: 0.05 }}
	>

		<div class="space-y-4">
			<input
        id="page-search"
        class="w-full rounded-xl border border-surface-200/60 bg-surface-100/80 px-3 py-2 text-sm text-surface-700 outline-none placeholder:text-surface-400"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        placeholder={$t('app.page_search.placeholder')}
        bind:value={pageSearch}
        aria-label={$t('app.page_search.placeholder')}
      />

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
					{#each pageGroups as group (group.label)}
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
          {/each}
				</div>
			{/if}
		</div>
	</div> -->

	{#if filteredSongs.length === 0}
		<div
			class="rounded-2xl border border-dashed border-surface-200/60 bg-surface-50/70 px-6 py-12 text-center text-sm text-surface-500"
		>
			{$t('app.empty_state')}
		</div>
	{:else}
		<div class="space-y-4">
			{#each visibleSongs as song (song.id + '-' + song.language)}
				<SongCard
					{song}
					isFavourite={$favourites.includes(`${song.id}-${song.language}`)}
					on:open={(event) => openSong(event.detail)}
					on:toggleFavourite={(event) => toggleFavourite(event.detail)}
				/>
			{/each}

			{#if visibleSongs.length < filteredSongs.length}
				<div class="flex justify-center pt-2">
					<div
						bind:this={loadMoreSentinel}
						use:inView={{ once: false, threshold: 0, rootMargin: '0px 0px 480px 0px' }}
						on:enterViewport={loadMoreSongs}
						class="glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-on-surface-soft"
					>
						<span>{visibleSongs.length}</span>
						<span>/</span>
						<span>{filteredSongs.length}</span>
					</div>
				</div>
			{/if}
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
