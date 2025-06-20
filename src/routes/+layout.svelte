<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { init, register, getLocaleFromNavigator } from 'svelte-i18n';
	import { theme } from '$lib/stores/theme';

	register('en', () => import('$lib/locales/en.json'));
	register('pl', () => import('$lib/locales/pl.json'));

	onMount(() => {
		init({ fallbackLocale: 'en', initialLocale: getLocaleFromNavigator() });
	});
</script>

<div class={$theme}>
	<slot />
</div>
