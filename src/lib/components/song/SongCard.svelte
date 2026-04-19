<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { t } from 'svelte-i18n';
	import { ExternalLink, Eye, EyeOff } from 'lucide-svelte';
	import type { Song } from '$lib/types/song';
	import { songTextScale } from '$lib/stores/preferences';
	import { getSourceTranslationKey } from '$lib/utils/sourceLabel';
	import { getSongTextSizeRem, getSongTextSpacerHeightRem } from '$lib/utils/songTextScale';
	import {
		getSongItemText,
		isAdditionalSongItem,
		isTechnicalSongItem,
		splitPreviewSongItems
	} from '$lib/utils/songContent';

	export let song: Song;
	export let showPreview = true;

	const dispatch = createEventDispatcher<{
		open: Song;
	}>();

	let expanded = false;

	const PREVIEW_LENGTH = 3;

	function itemClass(item: Song['items'][number]) {
		return [
			'whitespace-pre-line',
			alignmentClass(item.alignment),
			item.isBold ? 'font-semibold' : '',
			item.isItalics || isAdditionalSongItem(item.type) || isTechnicalSongItem(item.type)
				? 'italic'
				: '',
			isAdditionalSongItem(item.type) || isTechnicalSongItem(item.type)
				? 'text-xs text-on-surface-muted sm:text-sm'
				: ''
		]
			.filter(Boolean)
			.join(' ');
	}

	$: ({ previewItems, remainingItems } = splitPreviewSongItems(song.items, PREVIEW_LENGTH));
	$: remainingLineCount = remainingItems.filter(
		(item) => getSongItemText(item).trim().length
	).length;
	$: previewTextSizeRem = getSongTextSizeRem($songTextScale, 0.94);
	$: previewSpacerHeightRem = getSongTextSpacerHeightRem($songTextScale, 0.5);
	$: canExpandPreview = showPreview && remainingLineCount > 0;

	function alignmentClass(alignment: Song['items'][number]['alignment']) {
		if (alignment === 'CENTER') return 'text-center';
		if (alignment === 'RIGHT') return 'text-right';
		return 'text-left';
	}

	function displaySourceLabel(source: string) {
		const translationKey = getSourceTranslationKey(source);
		return translationKey ? $t(translationKey) : source;
	}
</script>

<div>
	<article
		class="song-preview-card glass-panel--soft rounded-[1.45rem] p-3.5 transition-[transform,box-shadow] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgb(var(--panel-shadow-rgb)/0.12)] sm:rounded-[1.7rem] sm:p-4"
	>
		<div class={`flex flex-col ${showPreview ? 'gap-3.5' : 'gap-3'}`}>
			<div class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
				<div class="min-w-0 space-y-2">
					<h3 class="text-base font-semibold leading-tight text-on-surface sm:text-lg">
						{song.title}
					</h3>
					<div class="flex flex-wrap items-center gap-1.5 text-xs text-on-surface-subtle">
						<span
							class="inline-flex items-center gap-1 rounded-full border border-primary-100/70 bg-primary-50/85 px-2.5 py-1 font-medium text-primary-600"
						>
							{$t('app.page_label')}
							{song.page}
						</span>
						<span
							class="glass-chip inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-on-surface-soft"
						>
							<span class="hidden sm:inline">{$t('app.source_label')}</span>
							{displaySourceLabel(song.source)}
						</span>
						<span
							class="glass-chip inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-on-surface-soft"
						>
							{$t('app.external_index')}
							{song.externalIndex}
						</span>
					</div>
				</div>
				<div
					class="col-start-2 row-start-1 flex flex-wrap items-center gap-2 self-start justify-end"
				>
					<button
						class="btn-gold inline-flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition"
						on:click={() => dispatch('open', song)}
						type="button"
						aria-label={$t('app.go_to_song')}
					>
						<ExternalLink class="h-4 w-4" />
						<span class="hidden sm:inline">{$t('app.go_to_song')}</span>
						<span class="sr-only sm:hidden">{$t('app.go_to_song')}</span>
					</button>
					{#if canExpandPreview}
						<button
							class="icon-button"
							on:click={() => (expanded = !expanded)}
							type="button"
							aria-expanded={expanded}
							aria-label={expanded ? $t('app.hide_preview') : $t('app.preview')}
							title={expanded ? $t('app.hide_preview') : $t('app.preview')}
						>
							{#if expanded}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
							<span class="sr-only">{expanded ? $t('app.hide_preview') : $t('app.preview')}</span>
						</button>
					{/if}
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

			{#if showPreview}
				<div
					class="space-y-2 leading-relaxed text-on-surface"
					style={`font-size: ${previewTextSizeRem}rem;`}
				>
					{#each previewItems as item}
						{#if getSongItemText(item).trim().length}
							<p class={itemClass(item)}>
								{getSongItemText(item)}
							</p>
						{:else}
							<div aria-hidden="true" style={`height: ${previewSpacerHeightRem}rem;`}></div>
						{/if}
					{/each}
					{#if canExpandPreview && !expanded}
						<p class="text-[11px] italic text-surface-500">
							{$t('app.preview_remaining', { values: { count: remainingLineCount } })}
						</p>
					{/if}
				</div>

				{#if canExpandPreview && expanded}
					<div
						class="space-y-2 leading-relaxed text-on-surface"
						style={`font-size: ${previewTextSizeRem}rem;`}
						transition:fade
					>
						{#each remainingItems as item}
							{#if getSongItemText(item).trim().length}
								<p class={itemClass(item)}>
									{getSongItemText(item)}
								</p>
							{:else}
								<div aria-hidden="true" style={`height: ${previewSpacerHeightRem}rem;`}></div>
							{/if}
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	</article>
</div>
