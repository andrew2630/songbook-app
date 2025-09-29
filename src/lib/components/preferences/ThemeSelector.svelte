<script lang="ts">
  import { t } from 'svelte-i18n';
  import { Palette } from 'lucide-svelte';
  import { themeName } from '$lib/stores/preferences';
  import { themeOptions } from '$lib/config/themes';

  function selectTheme(id: string) {
    themeName.set(id);
  }
</script>

<div class="flex items-center gap-3 rounded-full border border-surface-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-surface-600 shadow-sm">
  <Palette class="h-4 w-4 text-primary-500" />
  <span class="hidden text-[11px] uppercase tracking-[0.18em] text-surface-500 sm:inline">
    {$t('app.theme_label')}
  </span>
  <div class="flex gap-1">
    {#each themeOptions as option}
      <button
        type="button"
        class={`group flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 ${
          $themeName === option.id
            ? 'bg-surface-100 text-primary-600 shadow'
            : 'text-surface-500 hover:text-primary-500'
        }`}
        aria-pressed={$themeName === option.id}
        aria-label={$t(`app.themes.${option.labelKey}`)}
        title={$t(`app.themes.${option.labelKey}`)}
        on:click={() => selectTheme(option.id)}
      >
        <span class="flex h-6 w-12 overflow-hidden rounded-full border border-surface-200/60 bg-white shadow-sm">
          {#each option.preview as color}
            <span class="flex-1" style={`background-color:${color}`}></span>
          {/each}
        </span>
        <span class="hidden whitespace-nowrap sm:inline">{$t(`app.themes.${option.labelKey}`)}</span>
      </button>
    {/each}
  </div>
</div>
