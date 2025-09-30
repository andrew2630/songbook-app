<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { t } from 'svelte-i18n';
	import { listTransition } from '$lib/actions/listTransition';
	import { inView } from '$lib/actions/inView';
	import { Heart, ExternalLink, Eye, EyeOff, Link2 } from 'lucide-svelte';
	import type { Song } from '$lib/types/song';

	export let song: Song;
	export let index = 0;
	export let viewMode: 'basic' | 'chords' = 'basic';
	export let isFavourite = false;

	const dispatch = createEventDispatcher<{
		open: Song;
		toggleFavourite: string;
	}>();

	let visible = false;
	let expanded = false;
	let copyState: 'idle' | 'copied' | 'error' = 'idle';
	let copyTimeout: ReturnType<typeof setTimeout> | null = null;
	let prefersReducedMotion = true;
	let shareUrl = '';

	const PREVIEW_LENGTH = 3;

	function itemText(item: Song['items'][number]) {
		return typeof item.text === 'string' ? item.text : '';
	}

	$: printableItems = song.items.filter((item) => itemText(item).trim().length);
	$: previewItems = printableItems.slice(0, PREVIEW_LENGTH);
	$: remainingItems = printableItems.slice(PREVIEW_LENGTH);
	$: totalLines = printableItems.length;
	$: chordLines = printableItems.filter((item) => item.type === 'CHORD').length;
	$: density = totalLines ? chordLines / totalLines : 0;
	$: densityPercentage = Math.round(density * 100);
	$: lastUpdatedLabel = song.lastUpdatedAt
		? new Date(song.lastUpdatedAt).toLocaleDateString(undefined, {
				day: 'numeric',
				month: 'short',
				year: 'numeric'
			})
		: null;
	$: shareUrl = browser
		? new URL(`/song/${song.id}?lang=${song.language}`, window.location.origin).toString()
		: '';

	function handleEnter() {
		visible = true;
	}

	onMount(() => {
		if (!browser) return;
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = query.matches;
		const handleChange = (event: MediaQueryListEvent) => {
			prefersReducedMotion = event.matches;
		};
		query.addEventListener('change', handleChange);
		return () => query.removeEventListener('change', handleChange);
	});

	onDestroy(() => {
		if (copyTimeout) clearTimeout(copyTimeout);
	});

	async function copyShareLink() {
		if (!browser || !shareUrl) return;
		try {
			await navigator.clipboard.writeText(shareUrl);
			copyState = 'copied';
		} catch (error) {
			console.error('Failed to copy song link', error);
			copyState = 'error';
		}
		if (copyTimeout) clearTimeout(copyTimeout);
		copyTimeout = setTimeout(() => {
			copyState = 'idle';
		}, 2000);
	}

	function alignmentClass(alignment: Song['items'][number]['alignment']) {
		if (alignment === 'CENTER') return 'text-center';
		if (alignment === 'RIGHT') return 'text-right';
		return 'text-left';
	}
</script>

<div use:inView on:enterViewport={handleEnter}>
	{#if visible}
                <article
                        class="rounded-3xl border border-white/40 bg-white/80 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition hover:-translate-y-1 hover:shadow-[0_28px_72px_rgba(15,23,42,0.12)] sm:p-6"
                        use:listTransition={index}
                >
			<div class="flex flex-col gap-5">
				<div class="flex flex-col gap-3.5 lg:flex-row lg:items-start lg:justify-between">
					<div class="space-y-3">
						<div class="space-y-2">
                                                        <h3 class="text-lg font-semibold text-on-surface sm:text-xl">{song.title}</h3>
                                                        {#if lastUpdatedLabel}
                                                                <p class="text-xs text-on-surface-subtle">
                                                                        {$t('app.updated_label')}: {lastUpdatedLabel}
                                                                </p>
                                                        {/if}
                                                </div>
                                        <div class="flex flex-wrap items-center gap-2 text-xs text-on-surface-subtle">
                                                <span
                                                        class="inline-flex items-center gap-2 rounded-full border border-primary-100/70 bg-primary-50/90 px-3 py-1 font-medium text-primary-600"
                                                >
                                                        {$t('app.page_label')}
                                                        {song.page}
                                                </span>
                                                <span
                                                        class="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-on-surface-soft"
                                                >
                                                        {$t('app.source_label')}
                                                        {song.source}
                                                </span>
                                                <span
                                                        class="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-1 text-on-surface-soft"
                                                >
                                                        {$t('app.external_index')}
                                                        {song.externalIndex}
                                                </span>
                                        </div>
					</div>
					<div class="flex flex-wrap justify-end gap-2 text-sm">
                                                <button
                                                        class={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                                                                isFavourite
                                                                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-[0_18px_32px_rgba(14,165,233,0.28)]'
                                                                        : 'border border-white/50 bg-white/80 text-on-surface hover:border-primary-200/70 hover:text-primary-600'
                                                        }`}
                                                        on:click={() => dispatch('toggleFavourite', `${song.id}-${song.language}`)}
                                                        type="button"
                                                >
							<Heart class={`h-4 w-4 ${isFavourite ? 'fill-current' : ''}`} />
							{isFavourite ? $t('app.remove_favourite') : $t('app.add_favourite')}
						</button>
                                                <button
                                                        class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-[0_20px_36px_rgba(14,165,233,0.28)] transition hover:scale-[1.01] hover:from-primary-500/90 hover:to-secondary-500/90"
                                                        on:click={() => dispatch('open', song)}
                                                        type="button"
                                                >
                                                        <ExternalLink class="h-4 w-4" />
                                                        {$t('app.go_to_song')}
						</button>
						{#if remainingItems.length}
                                                        <button
                                                                class="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-3.5 py-1.5 text-sm font-medium text-on-surface transition hover:border-primary-200/70 hover:text-primary-600"
                                                                on:click={() => (expanded = !expanded)}
                                                                type="button"
                                                                aria-expanded={expanded}
                                                        >
								{#if expanded}
									<EyeOff class="h-4 w-4" />
									{$t('app.hide_preview')}
								{:else}
									<Eye class="h-4 w-4" />
									{$t('app.preview')}
								{/if}
							</button>
						{/if}
                                                <button
                                                        class="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-3.5 py-1.5 text-sm font-medium text-on-surface transition hover:border-primary-200/70 hover:text-primary-600"
                                                        on:click={copyShareLink}
                                                        type="button"
                                                >
							<Link2 class="h-4 w-4" />
							{copyState === 'copied' ? $t('app.copied_link') : $t('app.copy_link')}
						</button>
					</div>
				</div>

				<!-- <div class="rounded-xl border border-surface-200/70 bg-white px-4 py-4 text-xs">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500/90">{$t('app.density_label')}</p>
              <div class="mt-2 flex items-center gap-3">
                <span class="relative inline-flex h-2 w-36 overflow-hidden rounded-full bg-surface-200/70">
                  <span
                    class="absolute inset-y-0 left-0 origin-left rounded-full bg-primary-500"
                    style:transform={`scaleX(${Math.max(density, 0.05)})`}
                    style:transition={prefersReducedMotion ? 'none' : 'transform 420ms cubic-bezier(0.22, 1, 0.36, 1)'}
                  />
                </span>
                <span class="text-sm font-semibold text-on-surface">{densityPercentage}%</span>
              </div>
            </div>
            <p class="text-xs text-surface-500">
              {$t('app.density_caption', { values: { chords: chordLines, total: totalLines } })}
            </p>
          </div>
        </div> -->

                            <div class="space-y-3 text-sm leading-relaxed text-on-surface">
					{#each previewItems as item}
						<p
							class={`whitespace-pre-line ${alignmentClass(item.alignment)} ${item.isBold ? 'font-semibold' : ''} ${item.isItalics ? 'italic' : ''}`}
						>
							{#if viewMode === 'chords' && item.type === 'CHORD'}
								<span class="block text-[11px] font-semibold text-primary-500">CHORDS</span>
								<span class="mt-1 block text-base font-medium">{itemText(item)}</span>
							{:else}
								{itemText(item)}
							{/if}
						</p>
					{/each}
					{#if remainingItems.length && !expanded}
						<p class="text-xs italic text-surface-500">
							{$t('app.preview_remaining', { values: { count: remainingItems.length } })}
						</p>
					{/if}
				</div>

				{#if remainingItems.length && expanded}
                                    <div class="space-y-3 text-sm leading-relaxed text-on-surface" transition:fade>
						{#each remainingItems as item}
							<p
								class={`whitespace-pre-line ${alignmentClass(item.alignment)} ${item.isBold ? 'font-semibold' : ''} ${item.isItalics ? 'italic' : ''}`}
							>
								{#if viewMode === 'chords' && item.type === 'CHORD'}
									<span class="block text-[11px] font-semibold text-primary-500">CHORDS</span>
									<span class="mt-1 block text-base font-medium">{itemText(item)}</span>
								{:else}
									{itemText(item)}
								{/if}
							</p>
						{/each}
					</div>
				{/if}

				<p class="sr-only" aria-live="polite">
					{#if copyState === 'copied'}
						{$t('app.copied_link')}
					{:else if copyState === 'error'}
						{$t('app.copy_failed')}
					{/if}
				</p>
			</div>
		</article>
	{/if}
</div>
