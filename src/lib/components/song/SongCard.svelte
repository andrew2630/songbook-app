<script lang="ts">
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { onDestroy, createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { t } from 'svelte-i18n';
	import { AlertCircle, Check, ExternalLink, Eye, EyeOff, Heart, Link2 } from 'lucide-svelte';
	import type { Song } from '$lib/types/song';

	export let song: Song;
	export let isFavourite = false;

	const dispatch = createEventDispatcher<{
		open: Song;
		toggleFavourite: string;
	}>();

	let expanded = false;
	let copyState: 'idle' | 'copied' | 'error' = 'idle';
	let copyTimeout: ReturnType<typeof setTimeout> | null = null;
	let shareUrl = '';

	const PREVIEW_LENGTH = 3;

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
			'whitespace-pre-line',
			alignmentClass(item.alignment),
			item.isBold ? 'font-semibold' : '',
			item.isItalics || isAdditional(item.type) ? 'italic' : '',
			isAdditional(item.type) ? 'text-xs text-on-surface-muted sm:text-sm' : ''
		]
			.filter(Boolean)
			.join(' ');
	}

	$: printableItems = song.items.filter(
		(item) => itemText(item).trim().length && !isChordLike(item.type)
	);
	$: previewItems = printableItems.slice(0, PREVIEW_LENGTH);
	$: remainingItems = printableItems.slice(PREVIEW_LENGTH);
	$: lastUpdatedLabel = song.lastUpdatedAt
		? new Date(song.lastUpdatedAt).toLocaleDateString(undefined, {
				day: 'numeric',
				month: 'short',
				year: 'numeric'
			})
		: null;
	$: shareUrl = browser
		? new URL(`${base}/song/${song.id}?lang=${song.language}`, window.location.origin).toString()
		: '';

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

<div>
	<article
		class="song-preview-card glass-panel--soft rounded-3xl p-4 transition-[transform,box-shadow] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgb(var(--panel-shadow-rgb)/0.14)] sm:p-6"
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
							class="glass-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-on-surface-soft"
						>
							{$t('app.source_label')}
							{song.source}
						</span>
						<span
							class="glass-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-on-surface-soft"
						>
							{$t('app.external_index')}
							{song.externalIndex}
						</span>
					</div>
				</div>
				<div class="flex flex-wrap justify-end gap-2 text-sm">
					<button
						class="btn-gold inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition"
						on:click={() => dispatch('open', song)}
						type="button"
					>
						<ExternalLink class="h-4 w-4" />
						{$t('app.go_to_song')}
					</button>
					{#if remainingItems.length}
						<button
							class="icon-button"
							on:click={() => (expanded = !expanded)}
							type="button"
							aria-expanded={expanded}
							aria-label={expanded ? $t('app.hide_preview') : $t('app.preview')}
							title={expanded ? $t('app.hide_preview') : $t('app.preview')}
						>
							{#if expanded}
								<EyeOff class="h-5 w-5" />
							{:else}
								<Eye class="h-5 w-5" />
							{/if}
							<span class="sr-only">
								{expanded ? $t('app.hide_preview') : $t('app.preview')}
							</span>
						</button>
					{/if}
					<button
						class={`icon-button ${isFavourite ? 'btn-gold' : ''}`}
						on:click={() => dispatch('toggleFavourite', `${song.id}-${song.language}`)}
						type="button"
						aria-pressed={isFavourite}
						aria-label={isFavourite ? $t('app.remove_favourite') : $t('app.add_favourite')}
						title={isFavourite ? $t('app.remove_favourite') : $t('app.add_favourite')}
					>
						<Heart class={`h-5 w-5 transition ${isFavourite ? 'fill-current' : ''}`} />
						<span class="sr-only">
							{isFavourite ? $t('app.remove_favourite') : $t('app.add_favourite')}
						</span>
					</button>
					<button
						class={`icon-button ${
							copyState === 'copied'
								? 'icon-button--success'
								: copyState === 'error'
									? 'icon-button--danger'
									: ''
						}`}
						on:click={copyShareLink}
						type="button"
						aria-label={copyState === 'copied'
							? $t('app.copied_link')
							: copyState === 'error'
								? $t('app.copy_failed')
								: $t('app.copy_link')}
						title={copyState === 'copied'
							? $t('app.copied_link')
							: copyState === 'error'
								? $t('app.copy_failed')
								: $t('app.copy_link')}
					>
						{#if copyState === 'copied'}
							<Check class="h-5 w-5" />
						{:else if copyState === 'error'}
							<AlertCircle class="h-5 w-5" />
						{:else}
							<Link2 class="h-5 w-5" />
						{/if}
						<span class="sr-only" aria-live="polite">
							{#if copyState === 'copied'}
								{$t('app.copied_link')}
							{:else if copyState === 'error'}
								{$t('app.copy_failed')}
							{:else}
								{$t('app.copy_link')}
							{/if}
						</span>
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
					<p class={itemClass(item)}>
						{itemText(item)}
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
						<p class={itemClass(item)}>
							{itemText(item)}
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
</div>
