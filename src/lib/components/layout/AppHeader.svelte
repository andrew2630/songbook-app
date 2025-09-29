<script lang="ts">
  import { t } from 'svelte-i18n';
  import { language, theme, themeOptions } from '$lib/stores/preferences';
  import { isSyncing, lastSynced } from '$lib/stores/songStore';
  import { derived } from 'svelte/store';
  import { Languages, Moon, Search, Sun } from 'lucide-svelte';
  import type { ThemeName } from '$lib/stores/preferences';

  const syncStatus = derived(isSyncing, ($isSyncing) => ($isSyncing ? $t('app.syncing') : $t('app.brand_available_offline')));

  function selectTheme(name: ThemeName) {
    theme.set(name);
  }

  function themeMode(name: ThemeName) {
    return themeOptions.find((option) => option.id === name)?.mode ?? 'light';
  }
</script>

<section class="pt-6 sm:pt-10 lg:pt-12">
  <div class="rounded-xl border border-surface-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-surface-800/60 dark:bg-surface-900/70 sm:rounded-2xl sm:p-7">
    <div class="flex flex-col gap-5">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-2">
          <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-500">
            {$t('app.brand_global')}
          </p>
          <h1 class="text-balance text-2xl font-semibold text-surface-900 dark:text-surface-50 sm:text-3xl lg:text-4xl">
            {$t('app.title')}
          </h1>
          <!-- <p class="max-w-2xl text-sm leading-relaxed text-surface-600 dark:text-surface-300">
            {$t('app.tagline')}
          </p> -->
        </div>
        <div class="flex flex-wrap items-center gap-2 sm:justify-end">
          <div class="flex flex-wrap items-center gap-1 rounded-full border border-surface-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-surface-600 shadow-sm dark:border-surface-700 dark:bg-surface-800/90 dark:text-surface-200">
            {#if themeMode($theme) === 'dark'}
              <Moon class="h-4 w-4" aria-hidden="true" />
            {:else}
              <Sun class="h-4 w-4" aria-hidden="true" />
            {/if}
            <span class="uppercase tracking-[0.18em] text-surface-500 dark:text-surface-400">
              {$t('app.theme_label')}
            </span>
            <div class="flex flex-wrap gap-1">
              {#each themeOptions as option}
                <button
                  class={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                    $theme === option.id
                      ? 'border-primary-400 text-primary-600 dark:border-primary-500 dark:text-primary-300'
                      : 'border-transparent text-surface-500 hover:text-primary-500 dark:text-surface-300'
                  }`}
                  type="button"
                  on:click={() => selectTheme(option.id)}
                  aria-label={$t(option.labelKey)}
                >
                  <span
                    aria-hidden="true"
                    class="h-2.5 w-6 rounded-full"
                    style={`background: linear-gradient(90deg, ${option.swatch[0]}, ${option.swatch[1]});`}
                  />
                  <span class="hidden sm:inline">{$t(option.labelKey)}</span>
                </button>
              {/each}
            </div>
          </div>
          <label class="inline-flex items-center gap-2 rounded-full border border-surface-200/80 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-surface-600 shadow-sm transition hover:border-primary-400 focus-within:ring-2 focus-within:ring-primary-400 focus-within:ring-offset-2 focus-within:ring-offset-white dark:border-surface-700 dark:bg-surface-800/90 dark:text-surface-200 dark:focus-within:ring-offset-surface-900">
            <Languages class="h-4 w-4 text-primary-500" />
            <span class="hidden text-[11px] sm:inline">{$t('app.language_label')}</span>
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
          class="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          href="#songbook-search"
        >
          <Search class="h-4 w-4" />
          {$t('app.search_placeholder')}
        </a>
        <div class="flex flex-col gap-2 text-xs text-surface-600 dark:text-surface-300 sm:flex-row sm:items-center">
          <p class="flex items-center gap-2 rounded-full border border-surface-200/70 bg-white px-3 py-1.5 uppercase tracking-[0.18em] dark:border-surface-700 dark:bg-surface-800/80">
            <!-- <span class="text-surface-500 dark:text-surface-400">{$t('app.syncing')}</span> -->
            <span class="text-surface-900 dark:text-surface-100">{$syncStatus}</span>
          </p>
          <p class="flex items-center gap-2 rounded-full border border-surface-200/70 bg-white px-3 py-1.5 uppercase tracking-[0.18em] dark:border-surface-700 dark:bg-surface-800/80">
            <span class="text-surface-500 dark:text-surface-400">{$t('app.last_synced')}</span>
            <span class="text-surface-900 dark:text-surface-100">{$lastSynced ? new Date($lastSynced).toLocaleString() : '—'}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
