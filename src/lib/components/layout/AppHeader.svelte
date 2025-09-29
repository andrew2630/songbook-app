<script lang="ts">
  import { browser } from '$app/environment';
  import { t } from 'svelte-i18n';
  import { language, theme, themeOptions } from '$lib/stores/preferences';
  import { isSyncing, lastSynced } from '$lib/stores/songStore';
  import { derived } from 'svelte/store';
  import { Languages, Moon, Search, Sun } from 'lucide-svelte';
  import type { ThemeName } from '$lib/stores/preferences';
  import Select from 'svelte-select';

  type ThemeSelectItem = {
    value: ThemeName;
    label: string;
    swatch: [string, string];
  };

  const syncStatus = derived(isSyncing, ($isSyncing) => ($isSyncing ? $t('app.syncing') : $t('app.brand_available_offline')));

  function selectTheme(name: ThemeName) {
    theme.set(name);
  }

  function themeMode(name: ThemeName) {
    return themeOptions.find((option) => option.id === name)?.mode ?? 'light';
  }

  const fallbackSwatch: [string, string] = themeOptions[0]?.swatch ?? ['#6366f1', '#0ea5e9'];
  const themeSelectStyle = `
    --border: 0;
    --border-hover: 0;
    --border-focused: 0;
    --border-radius: 9999px;
    --padding: 0;
    --font-size: 12px;
    --height: 34px;
    --value-container-padding: 0;
    --selected-item-padding: 0;
    --placeholder-color: rgb(var(--color-surface-500));
    --placeholder-opacity: 1;
    --item-color: rgb(var(--color-surface-700));
    --item-hover-bg: rgb(var(--color-primary-500) / 0.12);
    --item-hover-color: rgb(var(--color-primary-600));
    --item-is-active-bg: rgb(var(--color-primary-500) / 0.18);
    --item-is-active-color: rgb(var(--color-primary-600));
    --list-background: rgb(var(--color-surface-50));
    --list-border: 1px solid rgb(var(--color-surface-200) / 0.8);
    --list-border-radius: 12px;
    --list-shadow: 0 16px 32px rgb(15 23 42 / 0.12);
    --input-color: rgb(var(--color-surface-700));
    --selected-item-color: rgb(var(--color-surface-700));
    --chevron-color: rgb(var(--color-surface-400));
    --chevron-width: 16px;
    --chevron-height: 16px;
  `;

  let themeSelectItems: ThemeSelectItem[] = [];
  let selectedThemeOption: ThemeSelectItem | undefined;
  let themeLabel = '';

  $: themeSelectItems = themeOptions.map((option) => ({
    value: option.id,
    label: $t(option.labelKey),
    swatch: option.swatch
  }));

  $: selectedThemeOption = themeSelectItems.find((item) => item.value === $theme) ?? themeSelectItems[0];

  $: themeLabel = $t('app.theme_label');

  function handleThemeSelect(event: CustomEvent<ThemeSelectItem>) {
    const selection = event.detail;
    if (selection?.value) {
      selectTheme(selection.value);
    }
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
          <div class="flex flex-wrap items-center gap-2 rounded-full border border-surface-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-surface-600 shadow-sm dark:border-surface-700 dark:bg-surface-800/90 dark:text-surface-200">
            {#if themeMode($theme) === 'dark'}
              <Moon class="h-4 w-4" aria-hidden="true" />
            {:else}
              <Sun class="h-4 w-4" aria-hidden="true" />
            {/if}
            <span class="hidden uppercase tracking-[0.18em] text-surface-500 dark:text-surface-400 sm:inline">
              {$t('app.theme_label')}
            </span>
            <Select
              class="theme-select min-w-[160px] flex-1"
              items={themeSelectItems}
              value={selectedThemeOption}
              itemId="value"
              placeholder={themeLabel}
              searchable={false}
              clearable={false}
              showChevron={true}
              listOffset={8}
              containerStyles={themeSelectStyle}
              inputAttributes={{ 'aria-label': themeLabel }}
              on:select={handleThemeSelect}
            >
              <svelte:fragment slot="selection" let:selection>
                <div class="flex w-full items-center gap-2 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-surface-600 dark:text-surface-300">
                  <span
                    aria-hidden="true"
                    class="h-2.5 w-6 rounded-full"
                    style={`background: linear-gradient(90deg, ${(selection?.swatch ?? fallbackSwatch)[0]}, ${(selection?.swatch ?? fallbackSwatch)[1]});`}
                  ></span>
                  <span class="truncate text-surface-700 dark:text-surface-200">
                    {selection ? selection.label : themeLabel}
                  </span>
                </div>
              </svelte:fragment>
              <svelte:fragment slot="item" let:item>
                <div class="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    class="h-2.5 w-6 rounded-full"
                    style={`background: linear-gradient(90deg, ${item.swatch[0]}, ${item.swatch[1]});`}
                  ></span>
                  <span class="text-sm font-medium text-surface-700 dark:text-surface-100">{item.label}</span>
                </div>
              </svelte:fragment>
            </Select>
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
        <button
          class="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          on:click={focusSearch}
          type="button"
        >
          <Search class="h-4 w-4" />
          {$t('app.search_placeholder')}
        </button>
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
