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
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
    <div class="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
      <div class="flex items-center gap-3">
        <img
          src="/logo.svg"
          alt="Songbook logo"
          class="h-12 w-12 rounded-full border bg-[rgb(var(--surface))] p-1 shadow-sm"
          style="border-color: rgb(var(--border-muted) / 0.6)"
        />
        <div>
          <h1 class="text-2xl font-semibold leading-tight heading-gradient">{$t('app.title')}</h1>
          <p class="text-sm text-[rgb(var(--text-secondary))]">{$t('app.tagline')}</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--text-secondary))] lg:text-sm">
        <span class="chip uppercase tracking-wide">{$t('app.brand_global')}</span>
        <span class="chip uppercase tracking-wide">{$t('app.brand_available_offline')}</span>
      </div>
    </div>
    <div class="flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
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
    <div class="bg-[rgb(var(--surface-subtle))]/80 py-2 text-center text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-secondary))]">
      {$syncingLabel}
    </div>
  {/if}
</header>
