<script lang="ts">
  import { t } from 'svelte-i18n';
  import { language, theme, toggleTheme } from '$lib/stores/preferences';
  import { isSyncing, lastSynced } from '$lib/stores/songStore';
  import { derived } from 'svelte/store';
  import { Languages, Moon, Search, Sun } from 'lucide-svelte';

  const syncStatus = derived(isSyncing, ($isSyncing) => ($isSyncing ? $t('app.syncing') : $t('app.brand_available_offline')));
</script>

<section class="pt-10 sm:pt-12 lg:pt-14">
  <div class="rounded-2xl border border-surface-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-surface-800/60 dark:bg-surface-900/70 sm:p-8">
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">
            {$t('app.brand_global')}
          </p>
          <h1 class="text-balance text-3xl font-semibold text-surface-900 dark:text-surface-50 sm:text-4xl">
            {$t('app.title')}
          </h1>
          <p class="max-w-2xl text-sm leading-relaxed text-surface-600 dark:text-surface-300">
            {$t('app.tagline')}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            class="inline-flex items-center gap-2 rounded-full border border-surface-200/80 bg-white px-4 py-2 text-sm font-semibold text-surface-700 shadow-sm transition hover:border-primary-400 hover:text-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:border-surface-700 dark:bg-surface-800/90 dark:text-surface-200"
            on:click={toggleTheme}
            type="button"
            aria-label={$theme === 'dark'
              ? `${$t('app.theme_label')} – ${$t('app.theme.light')}`
              : `${$t('app.theme_label')} – ${$t('app.theme.dark')}`}
          >
            {#if $theme === 'dark'}
              <Sun class="h-4 w-4" />
              <span class="text-xs font-semibold uppercase tracking-[0.2em]">{$t('app.theme.light') ?? 'Light'}</span>
            {:else}
              <Moon class="h-4 w-4" />
              <span class="text-xs font-semibold uppercase tracking-[0.2em]">{$t('app.theme.dark') ?? 'Dark'}</span>
            {/if}
          </button>
          <label class="inline-flex items-center gap-2 rounded-full border border-surface-200/80 bg-white px-4 py-2 text-sm font-semibold text-surface-700 shadow-sm transition hover:border-primary-400 focus-within:ring-2 focus-within:ring-primary-400 focus-within:ring-offset-2 focus-within:ring-offset-white dark:border-surface-700 dark:bg-surface-800/90 dark:text-surface-200 dark:focus-within:ring-offset-surface-900">
            <Languages class="h-4 w-4 text-primary-500" />
            <span class="text-xs font-semibold uppercase tracking-[0.2em] text-surface-500 dark:text-surface-400">
              {$t('app.language_label')}
            </span>
            <select
              class="rounded-full border-none bg-transparent text-sm font-semibold text-surface-700 outline-none dark:text-surface-200"
              bind:value={$language}
            >
              <option value="PL">Polski</option>
              <option value="EN">English</option>
            </select>
          </label>
        </div>
      </div>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <a
          class="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          href="#songbook-search"
        >
          <Search class="h-4 w-4" />
          {$t('app.search_placeholder')}
        </a>
        <div class="flex flex-col gap-2 text-sm text-surface-600 dark:text-surface-300 sm:flex-row sm:items-center">
          <p class="flex items-center gap-2 rounded-full border border-surface-200/70 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] dark:border-surface-700 dark:bg-surface-800/80">
            <span class="text-surface-500 dark:text-surface-400">{$t('app.syncing')}</span>
            <span class="text-surface-900 dark:text-surface-100">{$syncStatus}</span>
          </p>
          <p class="flex items-center gap-2 rounded-full border border-surface-200/70 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] dark:border-surface-700 dark:bg-surface-800/80">
            <span class="text-surface-500 dark:text-surface-400">{$t('app.last_synced')}</span>
            <span class="text-surface-900 dark:text-surface-100">{$lastSynced ? new Date($lastSynced).toLocaleString() : '—'}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
