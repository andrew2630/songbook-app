<script lang="ts">
        import { browser } from '$app/environment';
        import { t } from 'svelte-i18n';
        import { language } from '$lib/stores/preferences';
        import { isSyncing, lastSynced } from '$lib/stores/songStore';
        import { derived } from 'svelte/store';
        import { Languages, Search } from 'lucide-svelte';
        import type { SongLanguage } from '$lib/types/song';
        import { openSearchOverlay } from '$lib/stores/ui';

        type LanguageOption = {
                code: SongLanguage;
                label: string;
                shortLabel: string;
        };

        const syncStatus = derived(isSyncing, ($isSyncing) =>
                $isSyncing ? $t('app.syncing') : $t('app.brand_available_offline')
        );

        const languageOptions: LanguageOption[] = [
                { code: 'PL', label: 'Polski', shortLabel: 'PL' },
                { code: 'EN', label: 'English', shortLabel: 'EN' }
        ];

        function setLanguage(code: SongLanguage) {
                language.set(code);
        }

        function focusSearch() {
                if (!browser) return;

                const searchField = document.getElementById('song-search') as HTMLInputElement | null;
                if (searchField) {
                        searchField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        searchField.focus({ preventScroll: true });
                        searchField.select();
                        return;
                }

                openSearchOverlay();
        }
</script>

<section class="pt-8 sm:pt-12 lg:pt-16">
        <div
                class="relative overflow-hidden rounded-[36px] border border-white/30 bg-surface-50/70 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-7"
        >
                <div class="pointer-events-none absolute inset-0 -z-10">
                        <div
                                class="absolute inset-0 bg-[linear-gradient(135deg,rgb(var(--hero-gradient-from))_0%,rgb(var(--hero-gradient-to))_60%,rgba(255,255,255,0.85)_100%)]"
                        ></div>
                        <div
                                class="absolute -top-32 right-6 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--hero-glow-primary)/0.45),rgba(255,255,255,0))] blur-3xl"
                        ></div>
                        <div
                                class="absolute bottom-[-28%] left-[-12%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--hero-glow-secondary)/0.55),rgba(255,255,255,0))] blur-3xl"
                        ></div>
                </div>

                <div class="relative flex flex-col gap-8">
                        <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                                <div class="space-y-5 text-center lg:max-w-2xl lg:text-left">
                                        <div class="inline-flex items-center gap-2 self-center rounded-full bg-white/50 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-600 shadow-sm shadow-primary-500/20 lg:self-start">
                                                {$t('app.brand_global')}
                                        </div>
                                        <div class="space-y-3">
                                                <h1 class="text-balance text-3xl font-semibold text-on-surface sm:text-4xl lg:text-5xl">
                                                        {$t('app.title')}
                                                </h1>
                                                <p class="text-base leading-relaxed text-on-surface-soft sm:text-lg">
                                                        {$t('app.tagline')}
                                                </p>
                                        </div>
                                </div>
                                <div class="flex w-full flex-col lg:max-w-sm">
                                        <div class="rounded-[26px] border border-white/40 bg-white/70 p-4 shadow-lg shadow-primary-500/10 backdrop-blur">
                                                <div class="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-subtle">
                                                        <span class="inline-flex items-center gap-2 text-on-surface">
                                                                <Languages class="h-4 w-4 text-primary-500" />
                                                                {$t('app.language_label')}
                                                        </span>
                                                        <span class="text-[11px] text-on-surface-muted">{$t('app.view_song')}</span>
                                                </div>
                                                <div class="mt-3 grid grid-cols-2 gap-2">
                                                        {#each languageOptions as option}
                                                                <button
                                                                        class={`rounded-2xl px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                                                                                $language === option.code
                                                                                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/40'
                                                                                        : 'bg-white/60 text-on-surface hover:bg-white/80 hover:text-primary-600'
                                                                        }`}
                                                                        type="button"
                                                                        aria-pressed={$language === option.code}
                                                                        on:click={() => setLanguage(option.code)}
                                                                >
                                                                        <span class="hidden sm:inline">{option.label}</span>
                                                                        <span class="sm:hidden">{option.shortLabel}</span>
                                                                </button>
                                                        {/each}
                                                </div>
                                        </div>
                                </div>
                        </div>

                        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                        <button
                                                class="inline-flex items-center justify-center gap-2 rounded-full bg-[radial-gradient(circle_at_top_left,_rgb(var(--color-primary-400))_0%,_rgb(var(--color-primary-600))_60%,_rgb(var(--color-secondary-500))_100%)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(221,91,180,0.35)] transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
                                                on:click={focusSearch}
                                                type="button"
                                        >
                                                <Search class="h-4 w-4" />
                                                {$t('app.search_placeholder')}
                                        </button>
                                </div>
                                <div class="flex flex-col gap-2 text-xs text-on-surface-soft sm:flex-row sm:items-center sm:gap-3">
                                        <div class="inline-flex items-center gap-3 rounded-full border border-white/50 bg-white/60 px-4 py-2 font-semibold uppercase tracking-[0.2em] text-on-surface">
                                                {$syncStatus}
                                        </div>
                                        <div class="inline-flex items-center gap-3 rounded-full border border-white/50 bg-white/60 px-4 py-2 font-semibold uppercase tracking-[0.2em] text-on-surface">
                                                <span class="text-on-surface-muted">{$t('app.last_synced')}</span>
                                                <span class="text-on-surface">
                                                        {$lastSynced ? new Date($lastSynced).toLocaleString() : '—'}
                                                </span>
                                        </div>
                                </div>
                        </div>
                </div>
        </div>
</section>
