<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { t } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { ArrowUp, Heart } from 'lucide-svelte';
	import { getSongByKey } from '$lib/stores/songStore';
	import {
		favourites,
		toggleFavourite,
		language,
		viewMode,
		songTextScale
	} from '$lib/stores/preferences';
	import type { Song, SongLanguage } from '$lib/types/song';
	import { getSourceTranslationKey } from '$lib/utils/sourceLabel';
	import { getSongTextSizeRem, getSongTextSpacerHeightRem } from '$lib/utils/songTextScale';
	import { getRememberedSongListPath } from '$lib/utils/songNavigation';
	import {
		getSongItemText,
		hasMeaningfulSongItemContent,
		isAdditionalSongItem,
		isChordLikeSongItem,
		isTechnicalSongItem,
		parseSongLanguage,
		shouldDisplaySongItem
	} from '$lib/utils/songContent';
	import TextZoomControl from '$lib/components/song/TextZoomControl.svelte';

	const indexPath = base || '/';

	let song: Song | null = null;
	let loading = true;
	let activeViewMode: 'basic' | 'chords' = 'basic';
	let lastUpdatedLabel: string | null = null;
	let loadSequence = 0;
	let initialised = false;
	let lastRouteId: string | null = null;
	let lastRequestedKey: string | null = null;
	let showScrollTop = false;

	async function fetchSong(id: string, targetLanguage: SongLanguage) {
		const sequence = ++loadSequence;
		loading = true;
		try {
			const nextSong = await getSongByKey(`${id}-${targetLanguage}`);
			if (sequence !== loadSequence) return;
			song = nextSong;
		} finally {
			if (sequence === loadSequence) {
				loading = false;
			}
		}
	}

	onMount(() => {
		if (!browser) return;
		const updateScrollState = () => {
			showScrollTop = window.scrollY > 320;
		};
		updateScrollState();
		window.addEventListener('scroll', updateScrollState, { passive: true });
		return () => window.removeEventListener('scroll', updateScrollState);
	});

	$: favouriteKey = song ? `${song.id}-${song.language}` : '';
	$: if ($viewMode !== activeViewMode) {
		activeViewMode = $viewMode;
	}
	$: songTextSizeRem = getSongTextSizeRem($songTextScale);
	$: songTextSpacerHeightRem = getSongTextSpacerHeightRem($songTextScale);
	$: returnPath = resolveReturnPath($page.url.searchParams.get('returnTo'));
	$: rememberedListPath = resolveReturnPath(getRememberedSongListPath());
	$: returnListPath =
		returnPath && !isSongRoute(returnPath)
			? returnPath
			: returnPath &&
				  isSongRoute(returnPath) &&
				  rememberedListPath &&
				  !isSongRoute(rememberedListPath)
				? rememberedListPath
				: indexPath;
	$: lastUpdatedLabel = song?.lastUpdatedAt
		? new Date(song.lastUpdatedAt).toLocaleDateString(undefined, {
				day: 'numeric',
				month: 'short',
				year: 'numeric'
			})
		: null;

	$: {
		const id = $page.params.id;
		if (!id) {
			song = null;
			loading = false;
		} else {
			if (lastRouteId !== id) {
				initialised = false;
				lastRouteId = id;
				lastRequestedKey = null;
			}

			const langParam = parseSongLanguage($page.url.searchParams.get('lang'));
			const shouldRespectParam = Boolean(langParam) && !initialised;
			if (shouldRespectParam && langParam && $language !== langParam) {
				language.set(langParam);
			}

			const targetLanguage = shouldRespectParam && langParam ? langParam : $language;
			const requestKey = `${id}-${targetLanguage}`;
			if (requestKey !== lastRequestedKey) {
				lastRequestedKey = requestKey;
				void fetchSong(id, targetLanguage);
			}
			initialised = true;
		}
	}

	function itemClass(item: Song['items'][number]) {
		return [
			isChordLikeSongItem(item) ? 'whitespace-pre-wrap font-mono' : 'whitespace-pre-line',
			item.alignment === 'CENTER'
				? 'text-center'
				: item.alignment === 'RIGHT'
					? 'text-right'
					: 'text-left',
			item.isBold ? 'font-semibold' : '',
			item.isItalics || isAdditionalSongItem(item.type) || isTechnicalSongItem(item.type)
				? 'italic'
				: '',
			isAdditionalSongItem(item.type) || isTechnicalSongItem(item.type)
				? 'text-xs text-on-surface-muted sm:text-sm'
				: 'text-on-surface'
		]
			.filter(Boolean)
			.join(' ');
	}

	function handleTabKeydown(event: KeyboardEvent, mode: 'basic' | 'chords') {
		if (
			event.key !== 'ArrowLeft' &&
			event.key !== 'ArrowRight' &&
			event.key !== 'ArrowUp' &&
			event.key !== 'ArrowDown'
		) {
			return;
		}

		event.preventDefault();
		const next = mode === 'basic' ? 'chords' : 'basic';
		setActiveViewMode(next);
	}

	function setActiveViewMode(mode: 'basic' | 'chords') {
		activeViewMode = mode;
		viewMode.set(mode);
	}

	function goBack() {
		goto(returnListPath);
	}

	function scrollToTop() {
		if (!browser) return;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function displaySourceLabel(source: string) {
		const translationKey = getSourceTranslationKey(source);
		return translationKey ? $t(translationKey) : source;
	}

	function resolveReturnPath(value: string | null) {
		if (!value) return null;
		if (value.startsWith('/')) return value;
		return null;
	}

	function isSongRoute(path: string) {
		return path.startsWith(`${base}/song/`) || (base === '' && path.startsWith('/song/'));
	}
</script>

<svelte:head>
	<title>{song ? `${song.title} · ${$t('app.title')}` : $t('app.title')}</title>
</svelte:head>

{#if loading}
	<div class="py-20 text-center text-sm text-on-surface-muted">{$t('app.syncing')}</div>
{:else if song}
	<article
		class="glass-panel--soft relative mx-auto max-w-4xl space-y-4 overflow-hidden rounded-[1.65rem] p-4 sm:space-y-5 sm:rounded-[1.9rem] sm:p-5 lg:p-6"
	>
		<div class="pointer-events-none absolute inset-0 -z-10">
			<div
				class="absolute -top-20 left-8 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--hero-glow-primary)/0.18),rgba(255,255,255,0))] blur-[110px]"
			></div>
			<div
				class="absolute bottom-[-12%] right-[-8%] h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--hero-glow-secondary)/0.22),rgba(255,255,255,0))] blur-[130px]"
			></div>
		</div>

		<header class="relative space-y-3 text-left">
			<div class="flex items-start justify-between gap-3 sm:items-center">
				<div class="flex min-w-0 flex-wrap items-center gap-2">
					<button
						class="btn-secondary inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-soft sm:text-[11px] sm:tracking-[0.22em]"
						type="button"
						on:click={goBack}
					>
						{$t('app.back_to_index')}
					</button>
				</div>
				<div class="ml-auto inline-flex shrink-0 items-center gap-2">
					<button
						class={`icon-button ${$favourites.includes(favouriteKey) ? 'btn-gold' : ''}`}
						type="button"
						aria-pressed={$favourites.includes(favouriteKey)}
						aria-label={$favourites.includes(favouriteKey)
							? $t('app.remove_favourite')
							: $t('app.add_favourite')}
						title={$favourites.includes(favouriteKey)
							? $t('app.remove_favourite')
							: $t('app.add_favourite')}
						on:click={() => toggleFavourite(favouriteKey)}
					>
						<Heart
							class={`h-5 w-5 transition ${$favourites.includes(favouriteKey) ? 'fill-current' : ''}`}
						/>
						<span class="sr-only">
							{$favourites.includes(favouriteKey)
								? $t('app.remove_favourite')
								: $t('app.add_favourite')}
						</span>
					</button>
					<TextZoomControl align="right" />
				</div>
			</div>

			<div class="space-y-2">
				<div class="space-y-1">
					<h1
						class="text-balance text-[2rem] font-semibold leading-tight text-on-surface sm:text-[2.45rem] lg:text-[2.75rem]"
					>
						{song.title}
					</h1>
					{#if lastUpdatedLabel}
						<p
							class="text-[10px] uppercase tracking-[0.18em] text-on-surface-subtle sm:text-[11px]"
						>
							{$t('app.updated_label')}: {lastUpdatedLabel}
						</p>
					{/if}
				</div>
				<div class="flex flex-wrap gap-1.5 text-xs text-on-surface-subtle">
					<span
						class="rounded-full bg-primary-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-500"
					>
						{$t('app.page_label')}
						{song.page}
					</span>
					<span class="glass-chip rounded-full px-2.5 py-1 text-[11px] text-on-surface-soft">
						{$t('app.source_label')}
						{displaySourceLabel(song.source)}
					</span>
					<span class="glass-chip rounded-full px-2.5 py-1 text-[11px] text-on-surface-soft">
						{$t('app.external_index')}
						{song.externalIndex}
					</span>
				</div>
			</div>

			<div
				class="segmented-toggle inline-flex flex-wrap items-center gap-1 rounded-full p-[3px] sm:p-1"
				role="tablist"
				aria-label={$t('app.view_song')}
			>
				<button
					class="segmented-toggle__button inline-flex items-center justify-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold"
					type="button"
					role="tab"
					aria-selected={activeViewMode === 'basic'}
					tabindex={activeViewMode === 'basic' ? 0 : -1}
					on:click={() => setActiveViewMode('basic')}
					on:keydown={(event) => handleTabKeydown(event, 'basic')}
				>
					{$t('app.view.basic')}
				</button>
				<button
					class="segmented-toggle__button inline-flex items-center justify-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold"
					type="button"
					role="tab"
					aria-selected={activeViewMode === 'chords'}
					tabindex={activeViewMode === 'chords' ? 0 : -1}
					on:click={() => setActiveViewMode('chords')}
					on:keydown={(event) => handleTabKeydown(event, 'chords')}
				>
					{$t('app.view.chords')}
				</button>
			</div>
		</header>

		<section
			class={`relative space-y-3 rounded-[1.3rem] border border-surface-200/40 bg-surface-50/35 p-3.5 text-left leading-relaxed shadow-inner shadow-primary-500/4 sm:rounded-[1.55rem] sm:p-5 ${
				activeViewMode === 'chords' ? 'lg:grid lg:grid-cols-[160px,1fr] lg:gap-6 lg:space-y-0' : ''
			}`}
			style={`font-size: ${songTextSizeRem}rem;`}
		>
			{#each song.items as item}
				{#if hasMeaningfulSongItemContent(item) && shouldDisplaySongItem(item, activeViewMode)}
					<p class={itemClass(item)}>
						{getSongItemText(item)}
					</p>
				{:else if !hasMeaningfulSongItemContent(item) && shouldDisplaySongItem(item, activeViewMode)}
					<div aria-hidden="true" style={`height: ${songTextSpacerHeightRem}rem;`}></div>
				{/if}
			{/each}
		</section>
	</article>
	{#if showScrollTop}
		<button
			class="btn-gold icon-button fixed bottom-6 right-5 z-40"
			type="button"
			aria-label={$t('app.scroll_to_top')}
			title={$t('app.scroll_to_top')}
			on:click={scrollToTop}
		>
			<ArrowUp class="h-5 w-5" />
			<span class="sr-only">{$t('app.scroll_to_top')}</span>
		</button>
	{/if}
{:else}
	<div class="py-20 text-center text-sm text-on-surface-muted">Song not found.</div>
{/if}
