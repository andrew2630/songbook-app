<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { t } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { ArrowUp, Heart } from 'lucide-svelte';
	import { getSongByKey } from '$lib/stores/songStore';
	import { favourites, toggleFavourite, language, viewMode } from '$lib/stores/preferences';
	import type { Song, SongLanguage } from '$lib/types/song';

	const indexPath = base || '/';
	const validLanguages: SongLanguage[] = ['PL', 'EN'];

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
	$: activeViewMode = $viewMode;
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

	function itemText(item: Song['items'][number]) {
		return typeof item.text === 'string' ? item.text : '';
	}

	function isChordLike(itemType: Song['items'][number]['type']) {
		return itemType === 'CHORDS' || itemType === 'TABS';
	}

	function isAdditional(itemType: Song['items'][number]['type']) {
		return itemType === 'ADDITIONAL';
	}

	function itemClass(item: Song['items'][number]) {
		return [
			isChordLike(item.type) ? 'whitespace-pre-wrap font-mono' : 'whitespace-pre-line',
			item.alignment === 'CENTER'
				? 'text-center'
				: item.alignment === 'RIGHT'
					? 'text-right'
					: 'text-left',
			item.isBold ? 'font-semibold' : '',
			item.isItalics || isAdditional(item.type) ? 'italic' : '',
			isAdditional(item.type) ? 'text-xs text-on-surface-muted sm:text-sm' : 'text-on-surface'
		]
			.filter(Boolean)
			.join(' ');
	}

	function parseSongLanguage(value: string | null): SongLanguage | undefined {
		if (!value) return undefined;
		const normalizedValue = value.toUpperCase();
		return validLanguages.includes(normalizedValue as SongLanguage)
			? (normalizedValue as SongLanguage)
			: undefined;
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
		viewMode.set(next);
	}

	function goBack() {
		if (typeof window !== 'undefined' && window.history.length > 1) {
			window.history.back();
		} else {
			goto(indexPath);
		}
	}

	function scrollToTop() {
		if (!browser) return;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>{song ? `${song.title} · ${$t('app.title')}` : $t('app.title')}</title>
</svelte:head>

{#if loading}
	<div class="py-20 text-center text-sm text-on-surface-muted">{$t('app.syncing')}</div>
{:else if song}
	<article
		class="glass-panel relative mx-auto max-w-4xl space-y-7 overflow-hidden rounded-[3rem] p-6 sm:space-y-8 sm:p-10 lg:p-12"
	>
		<div class="pointer-events-none absolute inset-0 -z-10">
			<div
				class="absolute -top-32 left-8 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--hero-glow-primary)/0.4),rgba(255,255,255,0))] blur-[140px]"
			></div>
			<div
				class="absolute bottom-[-12%] right-[-8%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--hero-glow-secondary)/0.45),rgba(255,255,255,0))] blur-[160px]"
			></div>
		</div>

		<header class="relative space-y-5 text-center lg:text-left">
			<div class="flex flex-1 flex-wrap items-center justify-between gap-3">
				<div class="flex flex-wrap items-center gap-2.5">
					<button
						class="btn-secondary inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]"
						type="button"
						on:click={goBack}
					>
						{$t('app.back_action')}
					</button>
					<button
						class="btn-secondary inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em]"
						type="button"
						on:click={() => goto(indexPath)}
					>
						{$t('app.back_to_index')}
					</button>
				</div>
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
			</div>

			<div class="space-y-3">
				<div class="space-y-2">
					<h1 class="text-balance text-3xl font-semibold text-on-surface sm:text-4xl lg:text-5xl">
						{song.title}
					</h1>
					{#if lastUpdatedLabel}
						<p class="text-[11px] uppercase tracking-[0.22em] text-primary-400/90">
							{$t('app.updated_label')}: {lastUpdatedLabel}
						</p>
					{/if}
				</div>
				<div
					class="flex flex-wrap justify-center gap-2 text-xs text-on-surface-subtle lg:justify-start"
				>
					<span
						class="rounded-full bg-primary-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-500"
					>
						{$t('app.page_label')}
						{song.page}
					</span>
					<span class="glass-chip rounded-full px-3 py-1 text-[11px] text-on-surface-soft">
						{$t('app.source_label')}
						{song.source}
					</span>
					<span class="glass-chip rounded-full px-3 py-1 text-[11px] text-on-surface-soft">
						{$t('app.external_index')}
						{song.externalIndex}
					</span>
				</div>
			</div>

			<div
				class="segmented-toggle inline-flex flex-wrap items-center justify-center gap-2 rounded-full p-1.5 lg:justify-start"
				role="tablist"
				aria-label={$t('app.view_song')}
			>
				<button
					class="segmented-toggle__button inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
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
					class="segmented-toggle__button inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
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
			class={`glass-panel--soft relative space-y-3 rounded-[26px] p-5 text-left text-sm leading-relaxed shadow-inner shadow-primary-500/10 sm:p-7 sm:text-base ${
				activeViewMode === 'chords' ? 'lg:grid lg:grid-cols-[160px,1fr] lg:gap-6 lg:space-y-0' : ''
			}`}
		>
			{#each song.items as item}
				{#if itemText(item).trim().length && (!isChordLike(item.type) || activeViewMode === 'chords')}
					<p class={itemClass(item)}>
						{itemText(item)}
					</p>
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
