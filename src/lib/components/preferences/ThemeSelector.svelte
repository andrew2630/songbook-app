<script lang="ts">
        import { t } from 'svelte-i18n';
        import { Check, Palette } from 'lucide-svelte';
        import { themeName } from '$lib/stores/preferences';
        import { defaultTheme, themeOptions } from '$lib/config/themes';

        let optionRefs: HTMLButtonElement[] = [];

        $: activeTheme = themeOptions.find((option) => option.id === $themeName) ?? defaultTheme;

        function selectTheme(themeId: string) {
                themeName.set(themeId);
        }

        function focusOption(index: number) {
                const target = optionRefs[index];
                if (target) {
                        target.focus();
                }
        }

        function handleOptionKeydown(event: KeyboardEvent, index: number, themeId: string) {
                const lastIndex = themeOptions.length - 1;
                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                        event.preventDefault();
                        const nextIndex = index === lastIndex ? 0 : index + 1;
                        selectTheme(themeOptions[nextIndex].id);
                        focusOption(nextIndex);
                        return;
                }
                if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                        event.preventDefault();
                        const prevIndex = index === 0 ? lastIndex : index - 1;
                        selectTheme(themeOptions[prevIndex].id);
                        focusOption(prevIndex);
                        return;
                }
                if (event.key === 'Home') {
                        event.preventDefault();
                        selectTheme(themeOptions[0].id);
                        focusOption(0);
                        return;
                }
                if (event.key === 'End') {
                        event.preventDefault();
                        selectTheme(themeOptions[lastIndex].id);
                        focusOption(lastIndex);
                        return;
                }
                if (event.key === ' ' || event.key === 'Enter') {
                        event.preventDefault();
                        selectTheme(themeId);
                }
        }
</script>

<div class="space-y-4 rounded-[28px] border border-surface-200/70 bg-surface-50/75 p-4 shadow-xl shadow-primary-500/10 backdrop-blur-xl sm:p-5">
        <div class="flex items-center gap-3">
                <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/90 to-secondary-500/90 text-on-primary shadow-lg shadow-primary-500/30">
                        <Palette class="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface-subtle">
                                {$t('app.theme_label')}
                        </p>
                        <p class="text-sm font-semibold text-on-surface">
                                {$t(`app.themes.${activeTheme.labelKey}`)}
                                <span class="ml-2 text-xs font-medium text-on-surface-muted">
                                        {$t(`app.theme_scheme.${activeTheme.scheme}`)}
                                </span>
                        </p>
                </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label={$t('app.theme_label')}>
                {#each themeOptions as option, index}
                        <button
                                class={`group relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-3 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 ${
                                        option.id === $themeName
                                                ? 'border-primary-300/80 bg-white/70 text-on-surface shadow-[0_20px_45px_rgba(15,23,42,0.12)]'
                                                : 'border-surface-200/60 bg-surface-100/40 text-on-surface-muted hover:border-primary-200/60 hover:bg-surface-100/70 hover:text-primary-600'
                                }`}
                                type="button"
                                role="radio"
                                aria-checked={option.id === $themeName}
                                tabindex={option.id === $themeName ? 0 : -1}
                                on:click={() => selectTheme(option.id)}
                                on:keydown={(event) => handleOptionKeydown(event, index, option.id)}
                                bind:this={optionRefs[index]}
                        >
                                <span class="relative flex h-16 w-full items-center justify-center overflow-hidden rounded-xl">
                                        <span
                                                class="absolute inset-0 bg-[linear-gradient(135deg,var(--from),var(--via),var(--to))] opacity-90"
                                                style={`--from:${option.preview[0]};--via:${option.preview[1]};--to:${option.preview[2]};`}
                                                aria-hidden="true"
                                        ></span>
                                        <span class="absolute inset-0 bg-black/10" aria-hidden="true"></span>
                                        <span class="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                                                {$t(`app.theme_scheme.${option.scheme}`)}
                                        </span>
                                </span>
                                <span class="flex items-center justify-between gap-3">
                                        <span class="text-sm font-semibold">
                                                {$t(`app.themes.${option.labelKey}`)}
                                        </span>
                                        {#if option.id === $themeName}
                                                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-on-primary shadow-lg">
                                                        <Check class="h-3.5 w-3.5" aria-hidden="true" />
                                                </span>
                                        {:else}
                                                <span class="flex h-6 w-6 items-center justify-center rounded-full border border-surface-200/60 text-on-surface-muted transition group-hover:border-primary-300/60 group-hover:text-primary-500">
                                                        <Check class="h-3.5 w-3.5" aria-hidden="true" />
                                                </span>
                                        {/if}
                                </span>
                        </button>
                {/each}
        </div>
</div>
