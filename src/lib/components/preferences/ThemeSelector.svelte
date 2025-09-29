<script lang="ts">
        import { t } from 'svelte-i18n';
        import { Check, Palette } from 'lucide-svelte';
        import { themeName } from '$lib/stores/preferences';
        import { defaultTheme, themeOptions } from '$lib/config/themes';

        $: activeTheme = themeOptions.find((option) => option.id === $themeName) ?? defaultTheme;

        function selectTheme(themeId: string) {
                themeName.set(themeId);
        }
</script>

<div
        class="space-y-3 rounded-2xl border border-surface-200/70 bg-surface-50/80 px-4 py-3 text-xs font-semibold text-on-surface-soft shadow-sm backdrop-blur"
>
        <div class="flex items-center gap-3">
                <span class="flex h-9 w-9 items-center justify-center rounded-full border border-primary-200/60 bg-primary-50/70 text-primary-500 shadow-sm">
                        <Palette class="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                        <p class="text-[11px] uppercase tracking-[0.18em] text-on-surface-subtle">
                                {$t('app.theme_label')}
                        </p>
                        <p class="text-sm font-semibold text-on-surface">
                                {$t(`app.themes.${activeTheme.labelKey}`)}
                        </p>
                </div>
        </div>
        <div class="grid gap-2 sm:grid-cols-2">
                {#each themeOptions as option}
                        {#key option.id}
                                <button
                                        class={`group/theme relative flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 ${
                                                option.id === $themeName
                                                        ? 'border-primary-400 bg-primary-50/60 text-on-surface shadow-sm'
                                                        : 'border-surface-200/70 bg-surface-100/60 text-on-surface-soft hover:border-primary-300 hover:text-primary-500'
                                        }`}
                                        type="button"
                                        aria-pressed={option.id === $themeName}
                                        on:click={() => selectTheme(option.id)}
                                >
                                        <span
                                                class={`flex h-9 w-16 overflow-hidden rounded-full border shadow-inner ${
                                                        option.id === $themeName
                                                                ? 'border-primary-300'
                                                                : 'border-surface-200/70'
                                                }`}
                                        >
                                                {#each option.preview as color}
                                                        <span class="flex-1" style={`background:${color}`}></span>
                                                {/each}
                                        </span>
                                        <span class="flex flex-1 flex-col text-left">
                                                <span class="text-sm font-semibold text-on-surface">
                                                        {$t(`app.themes.${option.labelKey}`)}
                                                </span>
                                                <span class="text-[11px] uppercase tracking-[0.18em] text-on-surface-subtle">
                                                        {$t(`app.theme_scheme.${option.scheme}`)}
                                                </span>
                                        </span>
                                        {#if option.id === $themeName}
                                                <span class="text-primary-500">
                                                        <Check class="h-4 w-4" aria-hidden="true" />
                                                </span>
                                        {/if}
                                </button>
                        {/key}
                {/each}
        </div>
</div>
