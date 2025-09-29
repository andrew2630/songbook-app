<script lang="ts">
        import { browser } from '$app/environment';
        import { goto, afterNavigate } from '$app/navigation';
        import { tick } from 'svelte';
        import { t } from 'svelte-i18n';
        import { Search, X } from 'lucide-svelte';
        import { favourites, language } from '$lib/stores/preferences';
        import { closeSearchOverlay, isSearchOverlayOpen } from '$lib/stores/ui';
        import { filterSongs, searchableSongs } from '$lib/stores/songStore';
        import type { Song } from '$lib/types/song';

        let query = '';
        let inputRef: HTMLInputElement | null = null;
        let panelRef: HTMLDivElement | null = null;

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

        async function focusInput() {
                await tick();
                if (inputRef) {
                        inputRef.focus();
                        inputRef.select();
                }
                if (panelRef) {
                        panelRef.scrollTop = 0;
                }
        }

        async function handleSelect(song: Song) {
                try {
                        await goto(`/song/${song.id}?lang=${song.language}`);
                } finally {
                        handleClose();
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
                class="fixed inset-0 z-50 flex items-start justify-center bg-surface-900/50 px-4 py-16 backdrop-blur"
                role="presentation"
                on:click={handleBackdropClick}
                on:keydown={handleKeydown}
        >
                <div
                        class="w-full max-w-xl rounded-3xl border border-surface-200/70 bg-surface-50/95 p-5 shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        tabindex="-1"
                        bind:this={panelRef}
                >
                        <div class="flex items-start justify-between gap-3">
                                <div class="flex-1">
                                        <label
                                                class="text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-subtle"
                                                for="search-overlay-input"
                                        >
                                                {$t('app.search_placeholder')}
                                        </label>
                                        <div
                                                class="mt-2 flex items-center gap-2.5 rounded-xl border border-surface-200/60 bg-surface-100/70 px-3.5 py-2.5 shadow-inner"
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
                                        class="inline-flex shrink-0 items-center justify-center rounded-full border border-surface-200/70 bg-surface-100/70 p-2 text-on-surface-soft transition hover:border-primary-300 hover:text-primary-400"
                                        type="button"
                                        on:click={handleClose}
                                >
                                        <span class="sr-only">{$t('app.clear_query')}</span>
                                        <X class="h-4 w-4" aria-hidden="true" />
                                </button>
                        </div>

                        {#if results.length}
                                <div class="mt-5 space-y-2">
                                        {#each results as song (song.id + song.language)}
                                                <button
                                                        class="flex w-full items-center justify-between gap-3 rounded-2xl border border-surface-200/70 bg-surface-50/80 px-4 py-3 text-left text-sm font-medium text-on-surface transition hover:border-primary-400 hover:text-primary-500"
                                                        type="button"
                                                        on:click={() => handleSelect(song)}
                                                >
                                                        <div>
                                                                <p class="font-semibold">{song.title}</p>
                                                                <p class="text-xs text-on-surface-muted">
                                                                        {$t('app.page_label')} {song.page} · {song.source}
                                                                </p>
                                                        </div>
                                                        <span class="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-400/80">
                                                                {$t('app.view_song')}
                                                        </span>
                                                </button>
                                        {/each}
                                </div>
                        {:else if hasQuery}
                                <p class="mt-6 text-center text-sm text-on-surface-muted">
                                        {$t('app.empty_state')}
                                </p>
                        {:else}
                                <p class="mt-6 text-center text-sm text-on-surface-muted">
                                        {$t('app.search_hint')}
                                </p>
                        {/if}
                </div>
        </div>
{/if}
