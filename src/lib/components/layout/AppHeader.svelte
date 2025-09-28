<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from 'svelte-i18n';
  import { language, theme } from '$lib/stores/preferences';
  import { isSyncing, lastSynced } from '$lib/stores/songStore';
  import { derived } from 'svelte/store';
  import { fadeSlide } from '$lib/actions/fadeSlide';
  import { animate } from 'motion';
  import { Music3, Sparkles, Languages, Sun, MoonStar } from 'lucide-svelte';

  const syncingLabel = derived([isSyncing, lastSynced], ([$isSyncing, $lastSynced]) => {
    if ($isSyncing) return $t('app.syncing');
    if ($lastSynced) return `${$t('app.last_synced')}: ${new Date($lastSynced).toLocaleString()}`;
    return '';
  });

  let heroRef: HTMLDivElement | null = null;

  onMount(() => {
    if (!heroRef) return;
    animate(heroRef, { opacity: [0, 1], scale: [0.98, 1] }, { duration: 0.6, easing: 'ease-out' });
  });
</script>

<header class="relative w-full">
  <div class="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-10">
    <div class="card card-hero relative overflow-hidden" bind:this={heroRef}>
      <div class="glass-line absolute inset-0 opacity-60" aria-hidden="true"></div>
      <div class="relative flex flex-col gap-8 p-6 sm:p-10">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div class="space-y-6" use:fadeSlide={{ delay: 0 }}>
            <div class="inline-flex items-center gap-3 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 mix-blend-overlay">
              {$t('app.brand_global')}
            </div>
            <div class="space-y-3">
              <div class="inline-flex items-center gap-3 text-sm text-white/80">
                <Music3 class="h-5 w-5" />
                <span>{$t('app.brand_available_offline')}</span>
              </div>
              <h1 class="text-3xl font-semibold text-[rgb(var(--foreground))] sm:text-4xl lg:text-5xl">
                {$t('app.title')}
              </h1>
              <p class="max-w-2xl text-base text-[rgb(var(--muted))] sm:text-lg">
                {$t('app.tagline')}
              </p>
            </div>
          </div>
          <div class="toolbar flex w-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/10 p-4 shadow-lg sm:flex-row sm:items-center sm:justify-end" use:fadeSlide={{ delay: 0.1 }}>
            <div class="flex flex-1 items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 text-sm font-semibold text-[rgb(var(--foreground))] shadow-sm dark:bg-white/10 dark:text-[rgb(var(--foreground))]">
              <Languages class="h-5 w-5 text-[rgb(var(--accent))]" />
              <label class="flex w-full items-center gap-3">
                <span class="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
                  {$t('app.language_label')}
                </span>
                <select
                  class="w-full bg-transparent text-sm font-semibold text-[rgb(var(--foreground))] outline-none"
                  bind:value={$language}
                >
                  <option value="PL">Polski</option>
                  <option value="EN">English</option>
                </select>
              </label>
            </div>
            <div class="flex flex-1 items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 text-sm font-semibold text-[rgb(var(--foreground))] shadow-sm dark:bg-white/10 dark:text-[rgb(var(--foreground))]">
              <Sun class="h-5 w-5 text-[rgb(var(--accent))]" />
              <label class="flex w-full items-center gap-3">
                <span class="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">
                  {$t('app.theme_label')}
                </span>
                <select
                  class="w-full bg-transparent text-sm font-semibold text-[rgb(var(--foreground))] outline-none"
                  bind:value={$theme}
                >
                  <option value="light">{$t('app.light')}</option>
                  <option value="dark">{$t('app.dark')}</option>
                  <option value="system">{$t('app.system')}</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" use:fadeSlide={{ delay: 0.15 }}>
          <div class="stat">
            <Sparkles class="h-6 w-6 text-[rgb(var(--accent))]" />
            <div>
              <p class="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">{$t('app.brand_available_offline')}</p>
              <p class="text-lg font-semibold text-[rgb(var(--foreground))]">{$t('app.toggle_index')}</p>
            </div>
          </div>
          <div class="stat">
            <MoonStar class="h-6 w-6 text-[rgb(var(--accent))]" />
            <div>
              <p class="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">{$t('app.theme_label')}</p>
              <p class="text-lg font-semibold text-[rgb(var(--foreground))]">{$t('app.system')}</p>
            </div>
          </div>
          <div class="stat">
            <Music3 class="h-6 w-6 text-[rgb(var(--accent))]" />
            <div>
              <p class="text-xs uppercase tracking-wide text-[rgb(var(--muted))]">{$t('app.view.basic')}</p>
              <p class="text-lg font-semibold text-[rgb(var(--foreground))]">{$t('app.view.chords')}</p>
            </div>
          </div>
        </div>
      </div>
      {#if $syncingLabel}
        <div class="border-t border-white/20 bg-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))] dark:bg-white/5">
          {$syncingLabel}
        </div>
      {/if}
    </div>
  </div>
</header>
