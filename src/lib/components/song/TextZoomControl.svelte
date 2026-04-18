<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy } from 'svelte';
	import { t } from 'svelte-i18n';
	import { Minus, Plus, RotateCcw, SlidersHorizontal } from 'lucide-svelte';
	import { songTextScale } from '$lib/stores/preferences';
	import {
		DEFAULT_SONG_TEXT_SCALE,
		SONG_TEXT_SCALE_MAX,
		SONG_TEXT_SCALE_MIN,
		getSongTextZoomPercent
	} from '$lib/utils/songTextScale';

	export let align: 'left' | 'right' = 'right';

	let isOpen = false;
	let panelRef: HTMLDivElement | null = null;
	let triggerRef: HTMLButtonElement | null = null;

	$: zoomPercent = getSongTextZoomPercent($songTextScale);

	function toggleOpen() {
		isOpen = !isOpen;
	}

	function close() {
		isOpen = false;
	}

	function decreaseTextSize() {
		songTextScale.update((value) => Math.max(SONG_TEXT_SCALE_MIN, value - 1));
	}

	function increaseTextSize() {
		songTextScale.update((value) => Math.min(SONG_TEXT_SCALE_MAX, value + 1));
	}

	function resetTextSize() {
		songTextScale.set(DEFAULT_SONG_TEXT_SCALE);
	}

	function handleDocumentClick(event: MouseEvent) {
		if (!isOpen) return;
		const target = event.target;
		if (
			panelRef instanceof HTMLElement &&
			target instanceof Node &&
			(panelRef.contains(target) || triggerRef?.contains(target))
		) {
			return;
		}
		close();
	}

	function handleDocumentKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}

	if (browser) {
		document.addEventListener('click', handleDocumentClick);
		document.addEventListener('keydown', handleDocumentKeydown);
	}

	onDestroy(() => {
		if (!browser) return;
		document.removeEventListener('click', handleDocumentClick);
		document.removeEventListener('keydown', handleDocumentKeydown);
	});
</script>

<div class="relative">
	<button
		bind:this={triggerRef}
		class={`icon-button ${$songTextScale !== DEFAULT_SONG_TEXT_SCALE ? 'btn-gold' : ''}`}
		type="button"
		aria-expanded={isOpen}
		aria-haspopup="dialog"
		aria-label={$t('app.text_size_label')}
		title={`${$t('app.text_size_label')}: ${zoomPercent}%`}
		on:click|stopPropagation={toggleOpen}
	>
		<SlidersHorizontal class="h-5 w-5" />
		<span class="sr-only">{$t('app.text_size_label')}</span>
	</button>

	{#if isOpen}
		<div
			bind:this={panelRef}
			class={`zoom-popover glass-panel--soft absolute top-[calc(100%+0.7rem)] z-30 w-[min(18rem,calc(100vw-2.5rem))] rounded-[1.3rem] p-3 shadow-[0_18px_48px_rgb(var(--panel-shadow-rgb)/0.22)] ${
				align === 'left' ? 'left-0' : 'right-0'
			}`}
			role="dialog"
			tabindex="-1"
			aria-label={$t('app.text_size_label')}
			on:click|stopPropagation
			on:keydown|stopPropagation
		>
			<div class="flex items-center justify-between gap-3">
				<div>
					<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-muted">
						{$t('app.text_size_label')}
					</p>
					<p class="mt-1 text-sm font-semibold text-on-surface">{zoomPercent}%</p>
				</div>
				<button
					class="btn-secondary inline-flex h-9 min-w-[3.25rem] items-center justify-center rounded-full px-3 text-xs font-semibold uppercase tracking-[0.16em]"
					type="button"
					disabled={$songTextScale === DEFAULT_SONG_TEXT_SCALE}
					aria-label={$t('app.text_size_reset')}
					title={$t('app.text_size_reset')}
					on:click={resetTextSize}
				>
					<RotateCcw class="h-3.5 w-3.5" />
				</button>
			</div>

			<div class="mt-3 flex items-center gap-2">
				<button
					class="btn-secondary inline-flex h-9 w-9 items-center justify-center rounded-full p-0"
					type="button"
					disabled={$songTextScale <= SONG_TEXT_SCALE_MIN}
					aria-label={$t('app.text_size_decrease')}
					title={$t('app.text_size_decrease')}
					on:click={decreaseTextSize}
				>
					<Minus class="h-4 w-4" />
				</button>
				<input
					class="zoom-slider h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-200/80"
					type="range"
					min={SONG_TEXT_SCALE_MIN}
					max={SONG_TEXT_SCALE_MAX}
					step="1"
					bind:value={$songTextScale}
					aria-label={$t('app.text_size_label')}
				/>
				<button
					class="btn-secondary inline-flex h-9 w-9 items-center justify-center rounded-full p-0"
					type="button"
					disabled={$songTextScale >= SONG_TEXT_SCALE_MAX}
					aria-label={$t('app.text_size_increase')}
					title={$t('app.text_size_increase')}
					on:click={increaseTextSize}
				>
					<Plus class="h-4 w-4" />
				</button>
			</div>
		</div>
	{/if}
</div>
