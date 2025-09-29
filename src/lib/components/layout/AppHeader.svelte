<script lang="ts">
  import { t } from 'svelte-i18n';
  import { language } from '$lib/stores/preferences';
  import { isSyncing, lastSynced } from '$lib/stores/songStore';
  import { derived } from 'svelte/store';
  import { Languages, Search } from 'lucide-svelte';

  const syncStatus = derived(isSyncing, ($isSyncing) => ($isSyncing ? $t('app.syncing') : $t('app.brand_available_offline')));
</script>

<section class="pt-12 sm:pt-16 lg:pt-20">
  <div class="rounded-3xl border border-primary-500/15 bg-white/90 px-6 py-10 shadow-xl backdrop-blur-sm dark:border-surface-700/40 dark:bg-surface-900/80 sm:px-10">
    <div class="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div class="space-y-6">
        <p class="inline-flex items-center gap-2 rounded-full bg-primary-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-500">
          {$t('app.brand_global')}
        </p>
        <div class="space-y-4">
          <h1 class="text-balance text-3xl font-semibold text-surface-900 dark:text-surface-50 sm:text-4xl lg:text-5xl">
            {$t('app.title')}
          </h1>
          <p class="max-w-2xl text-base leading-relaxed text-surface-600 dark:text-surface-300">
            {$t('app.tagline')}
          </p>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            class="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            href="#songbook-search"
          >
            <Search class="h-4 w-4" />
            {$t('app.search_placeholder')}
          </a>
          <label class="flex w-full items-center justify-between gap-3 rounded-2xl border border-primary-500/10 bg-white/70 px-4 py-3 text-sm font-semibold text-surface-700 shadow-sm transition dark:border-surface-700/40 dark:bg-surface-900/70 dark:text-surface-200 sm:w-auto">
            <span class="flex items-center gap-2">
              <Languages class="h-4 w-4 text-primary-500" />
              <span class="uppercase tracking-[0.16em] text-xs text-surface-500 dark:text-surface-400">
                {$t('app.language_label')}
              </span>
            </span>
            <select
              class="rounded-xl border border-transparent bg-transparent text-right text-sm font-semibold text-surface-700 outline-none transition focus-visible:border-primary-500 dark:text-surface-200"
              bind:value={$language}
            >
              <option value="PL">Polski</option>
              <option value="EN">English</option>
            </select>
          </label>
        </div>
      </div>

      <div class="space-y-6 rounded-2xl border border-primary-500/10 bg-white/70 p-6 shadow-inner dark:border-surface-700/40 dark:bg-surface-900/70">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-primary-400/80">
            {$t('app.brand_available_offline')}
          </p>
          <p class="text-sm text-surface-500 dark:text-surface-300">
            {$t('app.toggle_index')}
          </p>
        </div>
        <div class="space-y-3 text-sm text-surface-600 dark:text-surface-200">
          <div class="flex items-center justify-between rounded-xl border border-primary-500/10 bg-white/80 px-4 py-3 shadow-sm dark:border-surface-700/30 dark:bg-surface-900/60">
            <span class="text-xs uppercase tracking-[0.2em] text-surface-500 dark:text-surface-400">{$t('app.syncing')}</span>
            <span class="font-semibold">{$syncStatus}</span>
          </div>
          <div class="rounded-xl border border-primary-500/10 bg-white/80 px-4 py-3 shadow-sm dark:border-surface-700/30 dark:bg-surface-900/60">
            <p class="text-xs uppercase tracking-[0.2em] text-surface-500 dark:text-surface-400">{$t('app.last_synced')}</p>
            <p class="mt-1 font-semibold text-surface-800 dark:text-surface-100">{$lastSynced ? new Date($lastSynced).toLocaleString() : '—'}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
