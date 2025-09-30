<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import { addMessages, init, locale as i18nLocale } from 'svelte-i18n';
	import { get } from 'svelte/store';
        import AppHeader from '$lib/components/layout/AppHeader.svelte';
        import SearchOverlay from '$lib/components/search/SearchOverlay.svelte';
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

<div class="relative min-h-screen overflow-hidden text-on-surface">
        <div class="pointer-events-none absolute inset-0 -z-10">
                <div
                        class="absolute inset-0 bg-[linear-gradient(190deg,rgba(255,255,255,0.95)_0%,rgba(var(--hero-gradient-mid),0.58)_38%,rgba(255,255,255,0.9)_100%)]"
                ></div>
                <div
                        class="absolute left-[8%] top-[-16%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--hero-glow-secondary)/0.55),rgba(255,255,255,0))] blur-[140px]"
                ></div>
                <div
                        class="absolute right-[-12%] top-[0%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--hero-glow-primary)/0.65),rgba(255,255,255,0))] blur-[150px]"
                ></div>
                <div
                        class="absolute bottom-[8%] right-[12%] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle_at_center,rgb(var(--accent-gold)/0.42),rgba(255,255,255,0))] blur-[140px]"
                ></div>
                <div
                        class="absolute bottom-[-26%] left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.92),rgba(255,255,255,0))] blur-[170px]"
                ></div>
        </div>
        <div
                class="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-3 pb-10 sm:px-6 lg:max-w-6xl lg:px-10"
        >
                <AppHeader />
                <main class="flex-1 py-5 sm:py-8 lg:py-10">
                        <slot />
                </main>
                <footer class="mt-10 border-t border-surface-200/60 py-5 text-xs text-on-surface-muted sm:text-sm">
                        <p class="font-semibold uppercase tracking-[0.18em] text-[11px] text-primary-500/80">
                                Wspólnota Biblijna KWCh
                        </p>
                        <p class="mt-2 max-w-xl leading-relaxed text-on-surface">
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
        <SearchOverlay />
</div>
