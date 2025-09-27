<script lang="ts">
  import { t } from 'svelte-i18n';
  import { language, theme } from '$lib/stores/preferences';
  import { isSyncing, lastSynced } from '$lib/stores/songStore';
  import { derived } from 'svelte/store';

  const syncingLabel = derived([isSyncing, lastSynced], ([$isSyncing, $lastSynced]) => {
    if ($isSyncing) return $t('app.syncing');
    if ($lastSynced) return `${$t('app.last_synced')}: ${new Date($lastSynced).toLocaleString()}`;
    return '';
  });
</script>

<header class="sticky top-0 z-40 header-border surface-overlay backdrop-strong">
  <div class="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 class="text-2xl font-semibold heading-gradient">{$t('app.title')}</h1>
      <p class="text-sm text-[rgb(var(--text-secondary))]">{$t('app.tagline')}</p>
    </div>
    <div class="flex flex-wrap items-center gap-3 text-sm">
      <label class="flex items-center gap-2 rounded-full border border-[rgb(var(--border-muted))] surface-pill px-4 py-2 shadow-sm transition">
        <span class="font-medium text-[rgb(var(--text-secondary))]">{$t('app.language_label')}</span>
        <select
          class="bg-transparent font-semibold text-[rgb(var(--text-primary))] focus:outline-none"
          bind:value={$language}
        >
          <option value="PL">Polski</option>
          <option value="EN">English</option>
        </select>
      </label>
      <label class="flex items-center gap-2 rounded-full border border-[rgb(var(--border-muted))] surface-pill px-4 py-2 shadow-sm transition">
        <span class="font-medium text-[rgb(var(--text-secondary))]">{$t('app.theme_label')}</span>
        <select
          class="bg-transparent font-semibold text-[rgb(var(--text-primary))] focus:outline-none"
          bind:value={$theme}
        >
          <option value="light">{$t('app.light')}</option>
          <option value="dark">{$t('app.dark')}</option>
          <option value="system">{$t('app.system')}</option>
        </select>
      </label>
    </div>
  </div>
  {#if $syncingLabel}
    <div class="bg-[rgb(var(--surface-subtle))]/80 py-2 text-center text-xs font-medium text-[rgb(var(--text-secondary))]">
      {$syncingLabel}
    </div>
  {/if}
</header>
