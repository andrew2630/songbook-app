<script lang="ts">
	import { browser } from '$app/environment';
	import { t } from 'svelte-i18n';
	import { language, theme, type ThemePreference } from '$lib/stores/preferences';
	import { get } from 'svelte/store';
	import { Languages, Monitor, Search } from 'lucide-svelte';
	import type { SongLanguage } from '$lib/types/song';
	import { openSearchOverlay } from '$lib/stores/ui';
	import { canInstall, installPrompt, isStandalone, setInstallPrompt } from '$lib/stores/pwa';

	type LanguageOption = {
		code: SongLanguage;
		label: string;
	};
	type ThemeOption = {
		value: ThemePreference;
		label: string;
	};

	const languageOptions: LanguageOption[] = [
		{ code: 'PL', label: 'Polski' },
		{ code: 'EN', label: 'English' }
	];
	const themeOptions: ThemeOption[] = [
		{ value: 'system', label: 'app.theme.system' },
		{ value: 'light', label: 'app.theme.light' },
		{ value: 'dark', label: 'app.theme.dark' }
	];

	function setLanguage(code: SongLanguage) {
		language.set(code);
	}

	function setThemePreference(preference: ThemePreference) {
		theme.set(preference);
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
	<div class="glass-panel relative overflow-hidden rounded-3xl p-4 sm:p-6">
		<div class="pointer-events-none absolute inset-0 -z-10">
			<div
				class="absolute inset-0 bg-[linear-gradient(135deg,rgb(var(--hero-card-start)/0.94)_0%,rgb(var(--accent-gold)/0.28)_45%,rgb(var(--hero-card-end)/0.82)_100%)]"
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
					<div
						class="inline-flex items-center gap-2 self-center rounded-full border border-[rgb(var(--accent-gold)/0.35)] bg-[rgb(var(--accent-gold)/0.12)] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgb(var(--accent-gold)/0.92)] shadow-sm shadow-[0_10px_24px_rgb(var(--panel-shadow-rgb)/0.12)] lg:self-start"
					>
						{$t('app.brand_global')}
					</div>
					<div class="space-y-2">
						<h1 class="text-balance text-3xl font-semibold text-on-surface sm:text-4xl lg:text-5xl">
							{$t('app.title')}
						</h1>
					</div>
				</div>
				<div class="flex w-full items-start justify-center lg:max-w-sm lg:justify-end">
					<div class="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
						<div
							class="glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface"
						>
							<Languages class="h-3 w-3 text-primary-500" aria-hidden="true" />
							<label class="sr-only" for="language-select">{$t('app.language_label')}</label>
							<select
								id="language-select"
								class="cursor-pointer appearance-none bg-transparent text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface outline-none focus-visible:text-primary-600"
								value={$language}
								on:change={(event) =>
									setLanguage((event.currentTarget as HTMLSelectElement).value as SongLanguage)}
							>
								{#each languageOptions as option (option.code)}
									<option value={option.code}>{option.label}</option>
								{/each}
							</select>
						</div>
						<div
							class="glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface"
						>
							<Monitor class="h-3 w-3 text-primary-500" aria-hidden="true" />
							<label class="sr-only" for="theme-select">{$t('app.theme_label')}</label>
							<select
								id="theme-select"
								class="cursor-pointer appearance-none bg-transparent text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface outline-none focus-visible:text-primary-600"
								value={$theme}
								on:change={(event) =>
									setThemePreference(
										(event.currentTarget as HTMLSelectElement).value as ThemePreference
									)}
							>
								{#each themeOptions as option (option.value)}
									<option value={option.value}>{$t(option.label)}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
			</div>

			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
					{#if $canInstall && !$isStandalone}
						<div class="flex flex-col items-center gap-2 sm:items-start">
							<button
								class="btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
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
						class="btn-gold inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-[1px] focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--panel-bg))]"
						on:click={focusSearch}
						type="button"
					>
						<Search class="h-4 w-4" />
						{$t('app.search_placeholder')}
					</button>
				</div>
				<!-- <div
					class="flex flex-col gap-2 text-xs text-on-surface-soft sm:flex-row sm:items-center sm:gap-3"
				>
					<div
						class="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/75 px-4 py-2 font-semibold uppercase tracking-[0.2em] text-on-surface"
					>
						{$syncStatus}
					</div>
					<div
						class="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/75 px-4 py-2 font-semibold uppercase tracking-[0.12em] text-on-surface"
					>
						<span class="text-on-surface-muted">{$t('app.last_synced')}</span>
						<span class="text-on-surface">
							{$lastSynced ? new Date($lastSynced).toLocaleString() : '—'}
						</span>
					</div>
				</div> -->
			</div>
		</div>
	</div>
</section>
