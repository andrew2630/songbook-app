<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import { addMessages, init, locale as i18nLocale } from 'svelte-i18n';
	import { get } from 'svelte/store';
	import AppHeader from '$lib/components/layout/AppHeader.svelte';
	import { loadSongs } from '$lib/stores/songStore';
	import { language } from '$lib/stores/preferences';
	import pl from '$lib/locales/pl.json';
	import en from '$lib/locales/en.json';

	addMessages('pl', pl);
	addMessages('en', en);

	const initialLocale = (browser ? get(language) : 'PL').toLowerCase();

	init({ fallbackLocale: 'pl', initialLocale });

	if (!browser) {
		i18nLocale.set(initialLocale);
	}

	let lenisController: { destroy: () => void } | null = null;

	onMount(() => {
		loadSongs();

		const handleOnline = () => loadSongs(true);

		async function initLenis() {
			if (!browser) return;
			const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			if (prefersReducedMotion) return;

			const { initLenis } = await import('$lib/utils/lenis');
			lenisController = await initLenis();
		}

		initLenis();

		if (browser) {
			window.addEventListener('online', handleOnline, { passive: true });

			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('/service-worker.js');
			}
		}

		return () => {
			if (browser) {
				window.removeEventListener('online', handleOnline);
			}
		};
	});

	onDestroy(() => {
		lenisController?.destroy();
	});
</script>

<div class="relative min-h-screen overflow-hidden text-surface-900">
	<div class="pointer-events-none absolute inset-0 -z-10">
		<div
			class="absolute inset-0 bg-gradient-to-b from-surface-50 via-surface-100/80 to-surface-50"
		></div>
		<div
			class="absolute left-1/2 top-[-25%] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgb(var(--color-secondary-200)/0.45),_rgba(255,255,255,0))] blur-3xl"
		></div>
		<div
			class="absolute bottom-[-18%] right-[-10%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_center,_rgb(var(--color-primary-200)/0.35),_rgba(255,255,255,0))] blur-3xl"
		></div>
	</div>
	<div
		class="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-3 pb-12 sm:px-5 lg:max-w-6xl lg:px-8"
	>
		<AppHeader />
		<main class="flex-1 py-6 sm:py-8 lg:py-10">
			<slot />
		</main>
		<footer class="mt-10 border-t border-surface-200/60 py-5 text-xs text-surface-500 sm:text-sm">
			<p class="font-semibold uppercase tracking-[0.18em] text-[11px] text-primary-500/80">
				Wspólnota Biblijna KWCh
			</p>
			<p class="mt-2 max-w-xl leading-relaxed">
				<a
					class="font-semibold text-primary-500 underline-offset-4 transition hover:text-primary-400 hover:underline"
					href="https://kwch.wroclaw.pl/"
					rel="noreferrer"
					target="_blank"
				>
					kwch.wroclaw.pl
				</a>
				.
			</p>
		</footer>
	</div>
</div>
