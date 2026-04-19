<script lang="ts">
	import { t } from 'svelte-i18n';
	import { browser } from '$app/environment';
	import { afterNavigate, goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { favourites, language, listPreviewVisible } from '$lib/stores/preferences';
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
	import {
		ArrowUp,
		ArrowUpDown,
		BookOpen,
		Eye,
		EyeOff,
		Heart,
		LayoutList,
		RotateCcw,
		Rows3,
		Search
	} from 'lucide-svelte';
	import type { Song } from '$lib/types/song';
	import {
		buildListUrlFromState,
		clearListFilterState,
		DEFAULT_LIST_FILTER_STATE,
		readListFilterStateFromSearch
	} from '$lib/utils/listFilters';
	import {
		getCurrentAppPath,
		rememberSongListPath,
		rememberSongReturnPath
	} from '$lib/utils/songNavigation';
	import TextZoomControl from '$lib/components/song/TextZoomControl.svelte';

	let query = DEFAULT_LIST_FILTER_STATE.query;
	let menuView: 'index' | 'favourites' = DEFAULT_LIST_FILTER_STATE.menuView;
	let pageFilter: number | null = DEFAULT_LIST_FILTER_STATE.pageFilter;
	let sortMode: SongSortMode = DEFAULT_LIST_FILTER_STATE.sortMode;
	let sourceFilter: SongSourceFilter = DEFAULT_LIST_FILTER_STATE.sourceFilter;
	let searchRef: HTMLInputElement | null = null;
	let pageSearch = DEFAULT_LIST_FILTER_STATE.pageSearch;
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

		return buildListUrlFromState(
			{
				query,
				menuView,
				pageFilter,
				sortMode,
				sourceFilter
			},
			window.location.pathname,
			window.location.hash
		);
	}

	function readFilterStateFromUrl() {
		if (!browser) return;

		const nextState = readListFilterStateFromSearch(window.location.search);
		query = nextState.query;
		menuView = nextState.menuView;
		pageFilter = nextState.pageFilter;
		sortMode = nextState.sortMode;
		sourceFilter = nextState.sourceFilter;
		pageSearch = nextState.pageSearch;
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

	afterNavigate(() => {
		if (!browser) return;
		readFilterStateFromUrl();
		hasInitialisedFiltersFromUrl = true;
	});

	$: if (browser && hasInitialisedFiltersFromUrl) {
		const nextUrl = buildListUrlFromState(
			{
				query,
				menuView,
				pageFilter,
				sortMode,
				sourceFilter
			},
			window.location.pathname,
			window.location.hash
		);
		const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

		if (nextUrl !== currentUrl) {
			window.history.replaceState(window.history.state, '', nextUrl);
		}

		rememberSongListPath(nextUrl);
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
		const clearedState = clearListFilterState();
		query = clearedState.query;
		pageFilter = clearedState.pageFilter;
		menuView = clearedState.menuView;
		pageSearch = clearedState.pageSearch;
		sortMode = clearedState.sortMode;
		sourceFilter = clearedState.sourceFilter;
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

<section class="space-y-4 pb-12 sm:space-y-5">
	<div
		id="song-filters-panel"
		class="glass-panel--soft space-y-3.5 rounded-[1.55rem] p-3 sm:space-y-4 sm:rounded-[1.8rem] sm:p-4"
	>
		<div class="space-y-2.5">
			<div
				class="glass-input flex items-center gap-3 rounded-[1.1rem] px-3.5 py-2.5 sm:rounded-[1.25rem]"
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

			<div class="flex flex-col gap-2.5">
				<div class="flex items-start justify-between gap-3">
					<div class="flex min-w-0 flex-wrap gap-1.5">
						<button
							class={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
								menuView === 'index' ? 'btn-gold' : 'btn-secondary'
							}`}
							on:click={() => (menuView = 'index')}
							type="button"
							aria-label={$t('app.toggle_index')}
						>
							<LayoutList class="h-4 w-4" />
							<span class="hidden sm:inline">{$t('app.toggle_index')}</span>
							<span class="sr-only sm:hidden">{$t('app.toggle_index')}</span>
						</button>
						<button
							class={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
								menuView === 'favourites' ? 'btn-gold' : 'btn-secondary'
							}`}
							on:click={() => (menuView = 'favourites')}
							type="button"
							aria-label={$t('app.toggle_favourites')}
						>
							<Heart class="h-4 w-4" />
							<span class="hidden sm:inline">{$t('app.toggle_favourites')}</span>
							<span class="sr-only sm:hidden">{$t('app.toggle_favourites')}</span>
						</button>
						<button
							class="btn-secondary hidden items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-muted hover:text-primary-500 sm:inline-flex sm:text-[11px] sm:tracking-[0.22em]"
							on:click={handleClearFilters}
							type="button"
						>
							{$t('app.reset_filters')}
						</button>
					</div>
					<div class="inline-flex shrink-0 items-center gap-2">
						<button
							class={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] sm:inline-flex sm:text-[11px] sm:tracking-[0.22em] ${
								$listPreviewVisible ? 'btn-secondary text-on-surface-muted' : 'btn-gold'
							}`}
							on:click={() => listPreviewVisible.update((value) => !value)}
							type="button"
							aria-pressed={$listPreviewVisible}
						>
							{#if $listPreviewVisible}
								<EyeOff class="h-4 w-4" />
								{$t('app.hide_preview_lines')}
							{:else}
								<Eye class="h-4 w-4" />
								{$t('app.show_preview_lines')}
							{/if}
						</button>
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
						<button
							class={`icon-button sm:hidden ${$listPreviewVisible ? '' : 'btn-gold'}`}
							on:click={() => listPreviewVisible.update((value) => !value)}
							type="button"
							aria-pressed={$listPreviewVisible}
							aria-label={$listPreviewVisible
								? $t('app.hide_preview_lines')
								: $t('app.show_preview_lines')}
							title={$listPreviewVisible
								? $t('app.hide_preview_lines')
								: $t('app.show_preview_lines')}
						>
							<Rows3 class="h-4 w-4" />
						</button>
						<TextZoomControl />
					</div>
				</div>

				<div class="grid gap-2 sm:grid-cols-2">
					<label
						class="glass-pill flex items-center gap-2 rounded-[1.1rem] px-3 py-2 text-sm font-medium text-on-surface"
					>
						<ArrowUpDown class="h-4 w-4 shrink-0 text-primary-500" />
						<span
							class="sr-only sm:not-sr-only sm:text-[11px] sm:font-semibold sm:uppercase sm:tracking-[0.18em] sm:text-on-surface-muted"
						>
							{$t('app.sort.label')}
						</span>
						<select
							class="min-w-0 flex-1 cursor-pointer appearance-none bg-transparent text-sm font-semibold text-on-surface outline-none"
							bind:value={sortMode}
							aria-label={$t('app.sort.label')}
						>
							{#each sortOptions as option}
								<option value={option.value}>{$t(option.label)}</option>
							{/each}
						</select>
					</label>

					<label
						class="glass-pill flex items-center gap-2 rounded-[1.1rem] px-3 py-2 text-sm font-medium text-on-surface"
					>
						<BookOpen class="h-4 w-4 shrink-0 text-primary-500" />
						<span
							class="sr-only sm:not-sr-only sm:text-[11px] sm:font-semibold sm:uppercase sm:tracking-[0.18em] sm:text-on-surface-muted"
						>
							{$t('app.source.label')}
						</span>
						<select
							class="min-w-0 flex-1 cursor-pointer appearance-none bg-transparent text-sm font-semibold text-on-surface outline-none"
							bind:value={sourceFilter}
							aria-label={$t('app.source.label')}
						>
							{#each sourceOptions as option}
								<option value={option.value}>{$t(option.label)}</option>
							{/each}
						</select>
					</label>
				</div>
			</div>
		</div>

		<div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-on-surface-muted">
			<p class="text-on-surface-soft">
				<span class="font-semibold text-on-surface">{filteredSongs.length}</span>
				<span class="mx-1 text-on-surface-muted">/</span>
				<span>{availableSongs.length}</span>
			</p>
			{#if pageFilter}
				<span
					class="rounded-full border border-[rgb(var(--accent-gold)/0.24)] bg-[rgb(var(--accent-gold)/0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgb(var(--accent-gold)/0.9)]"
				>
					{$t('app.page_label')}
					{pageFilter}
				</span>
			{/if}
		</div>

		{#if filterBadges.length}
			<div class="flex flex-wrap gap-1.5">
				{#each filterBadges as badge}
					<span
						class="inline-flex items-center gap-2 rounded-full border border-surface-200/45 bg-surface-100/40 px-2.5 py-1 text-[11px] font-medium text-on-surface-soft"
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
		<div class="space-y-3">
			{#each visibleSongs as song (song.id + '-' + song.language)}
				<SongCard
					{song}
					showPreview={$listPreviewVisible}
					on:open={(event) => openSong(event.detail)}
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
