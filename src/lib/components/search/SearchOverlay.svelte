<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate, goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { tick } from 'svelte';
	import { t } from 'svelte-i18n';
	import { Search, X } from 'lucide-svelte';
	import { favourites, language } from '$lib/stores/preferences';
	import { closeSearchOverlay, isSearchOverlayOpen } from '$lib/stores/ui';
	import { filterSongs, searchableSongs } from '$lib/stores/songStore';
	import type { Song } from '$lib/types/song';

	let query = '';
	let inputRef: HTMLInputElement | null = null;
	let resultsRef: HTMLDivElement | null = null;

	afterNavigate(() => {
		closeSearchOverlay();
	});

	function resetState() {
		query = '';
	}

	function handleClose() {
		closeSearchOverlay();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			handleClose();
		}
	}

	async function handleSongSelect(song: Song) {
		const url = `${base}/song/${song.id}?lang=${song.language}`;
		handleClose();
		await goto(url, { noScroll: false });
	}

	async function focusInput() {
		await tick();
		if (inputRef) {
			inputRef.focus();
			inputRef.select();
		}
		if (resultsRef) {
			resultsRef.scrollTop = 0;
		}
	}

	$: if (!$isSearchOverlayOpen) {
		resetState();
	}

	$: if ($isSearchOverlayOpen) {
		focusInput();
		if (browser) {
			document.body.classList.add('overflow-hidden');
		}
	} else if (browser) {
		document.body.classList.remove('overflow-hidden');
	}

	$: results = filterSongs(
		$searchableSongs,
		query,
		$language,
		false,
		$favourites,
		null,
		'alpha'
	).slice(0, 10);

	$: hasQuery = query.trim().length > 0;
</script>

{#if $isSearchOverlayOpen}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center px-3 py-12 backdrop-blur-2xl sm:px-4 sm:py-16"
		style="background-color: rgba(var(--overlay-backdrop), 0.58);"
		role="presentation"
		on:click={handleBackdropClick}
		on:keydown={handleKeydown}
	>
		<div
			class="flex w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/30 bg-white/85 p-4 shadow-[0_34px_110px_rgba(15,23,42,0.24)] sm:max-h-[min(85vh,640px)] sm:p-6"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div class="flex items-start justify-between gap-4">
				<div class="flex-1">
					<label
						class="text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-muted"
						for="search-overlay-input"
					>
						{$t('app.search_placeholder')}
					</label>
					<div
						class="mt-3 flex items-center gap-3 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-inner shadow-primary-500/10"
					>
						<Search class="h-4 w-4 text-primary-500" aria-hidden="true" />
						<input
							id="search-overlay-input"
							class="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-muted sm:text-base"
							type="search"
							autocomplete="off"
							spellcheck={false}
							bind:value={query}
							bind:this={inputRef}
						/>
					</div>
				</div>
				<button
					class="inline-flex shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/70 p-2 text-on-surface-soft transition hover:border-primary-200 hover:text-primary-500"
					type="button"
					on:click={handleClose}
				>
					<span class="sr-only">{$t('app.clear_query')}</span>
					<X class="h-4 w-4" aria-hidden="true" />
				</button>
			</div>

			{#if results.length}
				<div class="mt-6 flex-1 overflow-y-auto space-y-3 pr-1" bind:this={resultsRef}>
					{#each results as song (song.id + song.language)}
						<button
							class="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/40 bg-white/70 px-5 py-3.5 text-left text-sm font-semibold text-on-surface transition hover:border-primary-300 hover:text-primary-600 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
							type="button"
							on:click={() => handleSongSelect(song)}
						>
							<div>
								<p class="font-semibold text-on-surface">{song.title}</p>
								<p class="text-xs text-on-surface-muted">
									{$t('app.page_label')}
									{song.page} · {song.source}
								</p>
							</div>
							<span
								class="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-400/90"
							>
								{$t('app.go_to_song')}
							</span>
						</button>
					{/each}
				</div>
			{:else if hasQuery}
				<div class="mt-6 flex-1 overflow-y-auto pr-1" bind:this={resultsRef}>
					<p class="text-center text-sm text-on-surface-muted">
						{$t('app.empty_state')}
					</p>
				</div>
			{:else}
				<div class="mt-6 flex-1 overflow-y-auto pr-1" bind:this={resultsRef}>
					<p class="text-center text-sm text-on-surface-muted">
						{$t('app.search_hint')}
					</p>
				</div>
			{/if}
		</div>
	</div>
{/if}
