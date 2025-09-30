<script lang="ts">
        import { browser } from '$app/environment';
        import { t } from 'svelte-i18n';
        import { language } from '$lib/stores/preferences';
        import { isSyncing, lastSynced } from '$lib/stores/songStore';
        import { derived, get } from 'svelte/store';
        import { Languages, Search } from 'lucide-svelte';
        import type { SongLanguage } from '$lib/types/song';
        import { openSearchOverlay } from '$lib/stores/ui';
        import { canInstall, installPrompt, isStandalone, setInstallPrompt } from '$lib/stores/pwa';

        type LanguageOption = {
                code: SongLanguage;
                label: string;
        };

        const syncStatus = derived(isSyncing, ($isSyncing) =>
                $isSyncing ? $t('app.syncing') : $t('app.brand_available_offline')
        );

        const languageOptions: LanguageOption[] = [
                { code: 'PL', label: 'Polski' },
                { code: 'EN', label: 'English' }
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

        async function installApp() {
                const promptEvent = get(installPrompt);
                if (!promptEvent) return;

                await promptEvent.prompt();
                try {
                        await promptEvent.userChoice;
                } finally {
                        setInstallPrompt(null);
                }
        }
</script>

<section class="pt-6 sm:pt-12 lg:pt-16">
        <div
                class="relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:p-6"
        >
                <div class="pointer-events-none absolute inset-0 -z-10">
                        <div
                                class="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(var(--accent-gold),0.28)_45%,rgba(var(--hero-gradient-to),0.82)_100%)]"
                        ></div>
                        <div
                                class="absolute -top-24 right-6 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--hero-glow-primary)/0.55),rgba(255,255,255,0))] blur-3xl"
                        ></div>
                        <div
                                class="absolute bottom-[-28%] left-[-12%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--hero-glow-secondary)/0.6),rgba(255,255,255,0))] blur-3xl"
                        ></div>
                        <div
                                class="absolute bottom-[18%] right-[-8%] h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--accent-gold)/0.45),rgba(255,255,255,0))] blur-[120px]"
                        ></div>
                </div>

                <div class="relative flex flex-col gap-8">
                        <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                                <div class="space-y-4 text-center lg:max-w-2xl lg:text-left">
                                        <div class="inline-flex items-center gap-2 self-center rounded-full border border-[rgb(var(--accent-gold)/0.4)] bg-[rgb(var(--accent-gold)/0.15)] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgb(var(--accent-gold)/0.95)] shadow-sm shadow-[rgba(234,179,8,0.25)] lg:self-start">
                                                {$t('app.brand_global')}
                                        </div>
                                        <div class="space-y-2">
                                                <h1 class="text-balance text-3xl font-semibold text-on-surface sm:text-4xl lg:text-5xl">
                                                        {$t('app.title')}
                                                </h1>
                                        </div>
                                </div>
                                <div class="flex w-full items-start justify-center lg:max-w-sm lg:justify-end">
                                        <div class="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface shadow-sm shadow-primary-500/5 backdrop-blur">
                                                <Languages class="h-3 w-3 text-primary-500" aria-hidden="true" />
                                                <label class="sr-only" for="language-select">{$t('app.language_label')}</label>
                                                <select
                                                        id="language-select"
                                                        class="cursor-pointer appearance-none bg-transparent text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface outline-none focus-visible:text-primary-600"
                                                        value={$language}
                                                        on:change={(event) =>
                                                                setLanguage((event.currentTarget as HTMLSelectElement).value as SongLanguage)
                                                        }
                                                >
                                                        {#each languageOptions as option}
                                                                <option value={option.code}>{option.label}</option>
                                                        {/each}
                                                </select>
                                        </div>
                                </div>
                        </div>

                        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                        {#if $canInstall && !$isStandalone}
                                                <div class="flex flex-col items-center gap-2 sm:items-start">
                                                        <button
                                                                class="inline-flex items-center justify-center gap-2 rounded-full border border-primary-500/70 bg-white/70 px-5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm transition hover:bg-white hover:text-primary-700"
                                                                type="button"
                                                                on:click={installApp}
                                                        >
                                                                {$t('app.install_cta')}
                                                        </button>
                                                        <!-- <p class="max-w-[16rem] text-center text-xs font-medium text-on-surface-soft sm:text-left">
                                                                {$t('app.install_hint')}
                                                        </p> -->
                                                </div>
                                        <!-- {:else if $isStandalone}
                                                <div class="inline-flex items-center justify-center gap-2 rounded-full border border-white/60 bg-white/70 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
                                                        {$t('app.install_installed')}
                                                </div> -->
                                        {/if}
                                        <button
                                                class="btn-gold inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition"
                                                on:click={focusSearch}
                                                type="button"
                                        >
                                                <Search class="h-4 w-4" />
                                                {$t('app.search_placeholder')}
                                        </button>
                                </div>
                                <div class="flex flex-col gap-2 text-xs text-on-surface-soft sm:flex-row sm:items-center sm:gap-3">
                                        <div class="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/75 px-4 py-2 font-semibold uppercase tracking-[0.2em] text-on-surface">
                                                {$syncStatus}
                                        </div>
                                        <div class="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/75 px-4 py-2 font-semibold uppercase tracking-[0.12em] text-on-surface">
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
