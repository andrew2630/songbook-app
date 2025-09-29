<script lang="ts">
	import { browser } from '$app/environment';
	import { t } from 'svelte-i18n';
	import { language } from '$lib/stores/preferences';
	import { isSyncing, lastSynced } from '$lib/stores/songStore';
	import { derived } from 'svelte/store';
	import { Languages, Search } from 'lucide-svelte';
	import type { SongLanguage } from '$lib/types/song';
	import ThemeSelector from '$lib/components/preferences/ThemeSelector.svelte';

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
		}
	}
</script>

<section class="pt-6 sm:pt-10 lg:pt-12">
	<div
		class="rounded-2xl border border-surface-200/70 bg-surface-50/80 p-5 shadow-lg shadow-primary-500/5 backdrop-blur-xl sm:p-7"
	>
		<div class="flex flex-col gap-6">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div class="space-y-2">
					<p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-500">
						{$t('app.brand_global')}
					</p>
					<h1 class="text-balance text-2xl font-semibold text-surface-900 sm:text-3xl lg:text-4xl">
						{$t('app.title')}
					</h1>
					<!-- <p class="max-w-2xl text-sm leading-relaxed text-surface-600">
            {$t('app.tagline')}
          </p> -->
				</div>
				<div
					class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4"
				>
					<ThemeSelector />
					<div
						class="flex items-center gap-3 rounded-full border border-surface-200/70 bg-surface-100/70 px-3 py-1.5 text-xs font-semibold text-surface-600 shadow-sm"
					>
						<Languages class="h-4 w-4 text-primary-500" />
						<span class="hidden text-[11px] uppercase tracking-[0.18em] text-surface-500 sm:inline">
							{$t('app.language_label')}
						</span>
						<div class="grid grid-cols-2 gap-1 rounded-full bg-surface-50/80 p-1 shadow-inner">
							{#each languageOptions as option}
								<button
									class={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition ${
										$language === option.code
											? 'bg-primary-500 text-white shadow'
											: 'text-surface-500 hover:text-primary-500'
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
				<button
					class="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-primary-500/90 hover:to-secondary-500/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
					on:click={focusSearch}
					type="button"
				>
					<Search class="h-4 w-4" />
					{$t('app.search_placeholder')}
				</button>
				<div class="flex flex-col gap-2 text-xs text-surface-600 sm:flex-row sm:items-center">
					<p
						class="flex items-center gap-2 rounded-full border border-surface-200/70 bg-surface-100/70 px-3 py-1.5 uppercase tracking-[0.18em]"
					>
						<span class="text-surface-900">{$syncStatus}</span>
					</p>
					<p
						class="flex items-center gap-2 rounded-full border border-surface-200/70 bg-surface-100/70 px-3 py-1.5 uppercase tracking-[0.18em]"
					>
						<span class="text-surface-500">{$t('app.last_synced')}</span>
						<span class="text-surface-900"
							>{$lastSynced ? new Date($lastSynced).toLocaleString() : '—'}</span
						>
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
