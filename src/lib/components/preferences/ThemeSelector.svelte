<script lang="ts">
        import { onDestroy, onMount } from 'svelte';
        import { tick } from 'svelte';
        import { t } from 'svelte-i18n';
        import { Check, ChevronDown, Palette } from 'lucide-svelte';
        import { themeName } from '$lib/stores/preferences';
        import { defaultTheme, themeOptions, type ThemeOption } from '$lib/config/themes';

        let isOpen = false;
        let triggerRef: HTMLButtonElement | null = null;
        let menuRef: HTMLDivElement | null = null;

        $: activeTheme = themeOptions.find((option) => option.id === $themeName) ?? defaultTheme;

        function selectTheme(themeId: string) {
                themeName.set(themeId);
                closeMenu();
        }

        function toggleMenu() {
                if (isOpen) {
                        closeMenu();
                        return;
                }
                openMenu();
        }

        async function openMenu() {
                isOpen = true;
                await tick();
                focusActiveOption();
        }

        function closeMenu() {
                isOpen = false;
        }

        function focusActiveOption() {
                if (!menuRef) return;
                const activeOption = menuRef.querySelector<HTMLButtonElement>("[data-active='true']");
                activeOption?.focus();
        }

        function handleDocumentClick(event: MouseEvent) {
                if (!isOpen) return;
                const target = event.target as Node;
                if (triggerRef?.contains(target) || menuRef?.contains(target)) return;
                closeMenu();
        }

        function handleDocumentKeydown(event: KeyboardEvent) {
                if (event.key === 'Escape' && isOpen) {
                        event.preventDefault();
                        closeMenu();
                        triggerRef?.focus();
                }
        }

        function handleOptionKeydown(event: KeyboardEvent, option: ThemeOption) {
                if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        selectTheme(option.id);
                }
        }

        onMount(() => {
                document.addEventListener('click', handleDocumentClick);
                document.addEventListener('keydown', handleDocumentKeydown);
        });

        onDestroy(() => {
                document.removeEventListener('click', handleDocumentClick);
                document.removeEventListener('keydown', handleDocumentKeydown);
        });
</script>

<div class="space-y-3 rounded-2xl border border-surface-200/70 bg-surface-50/80 px-4 py-3 text-xs font-semibold text-on-surface-soft shadow-sm backdrop-blur">
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
        <div class="relative">
                <button
                        class="flex w-full items-center justify-between gap-3 rounded-2xl border border-surface-200/70 bg-surface-50/80 px-4 py-3 text-left text-sm font-semibold text-on-surface-soft shadow-sm backdrop-blur transition hover:border-primary-300 hover:text-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={isOpen}
                        on:click={toggleMenu}
                        bind:this={triggerRef}
                >
                        <span class="flex flex-1 items-center gap-3">
                                <span class="flex h-9 w-16 overflow-hidden rounded-full border border-surface-200/70 bg-surface-100/70 shadow-inner">
                                        {#each activeTheme.preview as color}
                                                <span class="flex-1" style={`background:${color}`}></span>
                                        {/each}
                                </span>
                                <span class="flex flex-1 flex-col text-left">
                                        <span class="text-sm font-semibold text-on-surface">
                                                {$t(`app.themes.${activeTheme.labelKey}`)}
                                        </span>
                                        <span class="text-[11px] uppercase tracking-[0.18em] text-on-surface-subtle">
                                                {$t(`app.theme_scheme.${activeTheme.scheme}`)}
                                        </span>
                                </span>
                        </span>
                        <ChevronDown
                                class={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180 text-primary-500' : 'text-on-surface-muted'}`}
                                aria-hidden="true"
                        />
                </button>

                {#if isOpen}
                        <div
                                class="absolute left-0 right-0 z-20 mt-2 origin-top rounded-2xl border border-surface-200/80 bg-surface-50/95 p-2 shadow-xl backdrop-blur"
                                role="listbox"
                                aria-label={$t('app.theme_label')}
                                bind:this={menuRef}
                        >
                                {#each themeOptions as option}
                                        <button
                                                class={`group flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 ${
                                                        option.id === $themeName
                                                                ? 'bg-primary-50/70 text-on-surface shadow-sm'
                                                                : 'text-on-surface-soft hover:bg-surface-100/80 hover:text-primary-500'
                                                }`}
                                                type="button"
                                                role="option"
                                                aria-selected={option.id === $themeName}
                                                data-active={option.id === $themeName}
                                                on:click={() => selectTheme(option.id)}
                                                on:keydown={(event) => handleOptionKeydown(event, option)}
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
                                                {:else}
                                                        <span class="text-on-surface-muted opacity-0 transition group-hover:opacity-100">
                                                                <Check class="h-4 w-4" aria-hidden="true" />
                                                        </span>
                                                {/if}
                                        </button>
                                {/each}
                        </div>
                {/if}
        </div>
</div>
