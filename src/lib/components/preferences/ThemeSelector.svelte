<script lang="ts">
	import { t } from 'svelte-i18n';
	import { Palette } from 'lucide-svelte';
	import { themeName } from '$lib/stores/preferences';
	import { defaultTheme, themeOptions } from '$lib/config/themes';

	let selectElement: HTMLSelectElement | null = null;

	$: activeTheme = themeOptions.find((option) => option.id === $themeName) ?? defaultTheme;
	$: if (selectElement) {
		selectElement.value = $themeName;
	}

	function handleChange(event: Event) {
		const target = event.currentTarget as HTMLSelectElement | null;
		if (!target) return;
		themeName.set(target.value);
	}
</script>

<div
	class="group flex items-center gap-3 rounded-2xl border border-surface-200/70 bg-surface-50/80 px-4 py-2.5 text-xs font-semibold text-surface-600 shadow-sm backdrop-blur"
>
	<Palette
		class="h-4 w-4 text-primary-500 transition group-hover:text-primary-400"
		aria-hidden="true"
	/>
	<div class="flex flex-col gap-2">
		<label class="text-[11px] uppercase tracking-[0.18em] text-surface-500" for="theme-select">
			{$t('app.theme_label')}
		</label>
		<div class="flex items-center gap-3">
			<div class="relative">
				<select
					id="theme-select"
					class="appearance-none rounded-xl border border-surface-200/70 bg-surface-100/80 px-3 py-2 pr-8 text-xs font-semibold uppercase tracking-[0.2em] text-surface-700 shadow-sm outline-none transition focus:border-primary-300 focus:ring-2 focus:ring-primary-200/60"
					bind:this={selectElement}
					value={$themeName}
					on:change={handleChange}
				>
					{#each themeOptions as option}
						<option value={option.id}>{$t(`app.themes.${option.labelKey}`)}</option>
					{/each}
				</select>
				<span
					aria-hidden="true"
					class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[10px] text-primary-400"
				>
					▼
				</span>
			</div>
			<span
				class="flex h-7 w-16 overflow-hidden rounded-full border border-surface-200/70 bg-surface-100 shadow-sm"
			>
				{#each activeTheme.preview as color}
					<span class="flex-1" style={`background:${color}`}></span>
				{/each}
			</span>
		</div>
	</div>
</div>
