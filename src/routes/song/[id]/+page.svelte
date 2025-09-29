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

	$: favouriteKey = song ? `${song.id}-${song.language}` : '';
	$: activeViewMode = $viewMode;
	$: lastUpdatedLabel = song?.lastUpdatedAt
		? new Date(song.lastUpdatedAt).toLocaleDateString(undefined, {
				day: 'numeric',
				month: 'short',
				year: 'numeric'
			})
		: null;

	function itemText(item: Song['items'][number]) {
		return typeof item.text === 'string' ? item.text : '';
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
			goto('/');
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
		class="relative mx-auto max-w-4xl space-y-7 overflow-hidden rounded-2xl border border-primary-500/20 bg-surface-50/90 p-5 shadow-2xl backdrop-blur-xl sm:space-y-8 sm:rounded-[2.5rem] sm:p-8 lg:p-10"
	>
		<div class="pointer-events-none absolute inset-0 -z-10">
			<div
				class="absolute -top-24 left-10 h-48 w-48 rounded-full bg-primary-500/15 blur-[120px]"
			></div>
			<div
				class="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-secondary-400/20 blur-[140px]"
			></div>
		</div>

		<header class="relative space-y-5 text-center lg:text-left">
			<div class="flex flex-1 flex-wrap items-center justify-between gap-3">
				<div class="flex flex-wrap items-center gap-2.5">
					<button
						class="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-surface-100/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-500 transition hover:-translate-y-0.5 hover:border-primary-500 hover:text-primary-500"
						type="button"
						on:click={goBack}
					>
						{$t('app.back_action')}
					</button>
					<button
						class="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-surface-100/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-500 transition hover:-translate-y-0.5 hover:border-primary-500 hover:text-primary-500"
						type="button"
						on:click={() => goto('/')}
					>
						{$t('app.back_to_index')}
					</button>
				</div>
				<button
					class={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
						$favourites.includes(favouriteKey)
							? 'bg-gradient-to-r from-primary-500 to-secondary-400 text-white shadow-lg'
							: 'border border-primary-500/25 bg-surface-100/70 text-surface-600 hover:border-primary-500 hover:text-primary-500'
					}`}
					type="button"
					aria-pressed={$favourites.includes(favouriteKey)}
					on:click={() => toggleFavourite(favouriteKey)}
				>
					{$favourites.includes(favouriteKey)
						? $t('app.remove_favourite')
						: $t('app.add_favourite')}
				</button>
			</div>

			<div class="space-y-3">
				<div class="space-y-2">
                                        <h1 class="text-balance text-2xl font-semibold text-on-surface sm:text-3xl lg:text-4xl">
                                                {song.title}
                                        </h1>
					{#if lastUpdatedLabel}
						<p class="text-[11px] uppercase tracking-[0.2em] text-primary-400/80">
							{$t('app.updated_label')}: {lastUpdatedLabel}
						</p>
					{/if}
				</div>
                                <div class="flex flex-wrap justify-center gap-2 text-xs text-on-surface-subtle lg:justify-start">
					<span
						class="rounded-full bg-primary-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-500"
					>
						{$t('app.page_label')}
						{song.page}
					</span>
                                        <span class="rounded-full bg-surface-100/70 px-3 py-1 text-[11px] text-on-surface-soft">
                                                {$t('app.source_label')}
                                                {song.source}
                                        </span>
                                        <span class="rounded-full bg-surface-100/70 px-3 py-1 text-[11px] text-on-surface-soft">
                                                {$t('app.external_index')}
                                                {song.externalIndex}
                                        </span>
				</div>
			</div>

			<div
				class="flex flex-wrap items-center justify-center gap-2 lg:justify-start"
				role="tablist"
				aria-label={$t('app.view_song')}
			>
				<button
					class={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
						activeViewMode === 'basic'
							? 'bg-gradient-to-r from-primary-500 to-secondary-400 text-white shadow-lg'
							: 'border border-primary-500/20 bg-surface-100/70 text-surface-600'
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
					class={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
						activeViewMode === 'chords'
							? 'bg-gradient-to-r from-primary-500 to-secondary-400 text-white shadow-lg'
							: 'border border-primary-500/20 bg-surface-100/70 text-surface-600'
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
			class={`relative space-y-3 rounded-xl border border-primary-500/10 bg-surface-50/80 p-4 text-left text-sm leading-relaxed shadow-inner sm:rounded-2xl sm:p-6 sm:text-base ${
				activeViewMode === 'chords' ? 'lg:grid lg:grid-cols-[160px,1fr] lg:gap-6 lg:space-y-0' : ''
			}`}
		>
			{#each song.items as item}
				{#if itemText(item).trim().length}
					<p
						class={`whitespace-pre-line ${
							item.alignment === 'CENTER'
								? 'text-center'
								: item.alignment === 'RIGHT'
									? 'text-right'
									: 'text-left'
                                                } ${item.isBold ? 'font-semibold' : ''} ${item.isItalics ? 'italic' : ''} text-on-surface`}
					>
						{#if activeViewMode === 'chords' && item.type === 'CHORD'}
							<span class="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-400/80"
								>CHORDS</span
							>
							<span class="mt-1 block text-sm font-medium sm:text-base">{itemText(item)}</span>
						{:else}
							{itemText(item)}
						{/if}
					</p>
				{/if}
			{/each}
		</section>
	</article>
{:else}
	<div class="py-20 text-center text-sm text-[rgb(var(--text-secondary))]">Song not found.</div>
{/if}
