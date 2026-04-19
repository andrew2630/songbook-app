// @vitest-environment jsdom

import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type MediaQueryController = {
	get matches(): boolean;
	set matches(value: boolean);
	trigger(): void;
};

function installMatchMedia(initialMatches = false) {
	let matches = initialMatches;
	const listeners = new Set<() => void>();
	Object.defineProperty(window, 'matchMedia', {
		configurable: true,
		value: vi.fn(() => ({
			get matches() {
				return matches;
			},
			addEventListener: (_event: string, listener: () => void) => {
				listeners.add(listener);
			},
			removeEventListener: (_event: string, listener: () => void) => {
				listeners.delete(listener);
			}
		}))
	});

	return {
		get matches() {
			return matches;
		},
		set matches(value: boolean) {
			matches = value;
		},
		trigger() {
			for (const listener of listeners) {
				listener();
			}
		}
	} satisfies MediaQueryController;
}

async function loadPwaStore(browser: boolean) {
	vi.resetModules();
	vi.doMock('$app/environment', () => ({ browser }));
	return import('$lib/stores/pwa');
}

describe('pwa store', () => {
	beforeEach(() => {
		Object.defineProperty(navigator, 'standalone', {
			configurable: true,
			value: false
		});
	});

	it('tracks install prompt availability', async () => {
		installMatchMedia(false);
		const pwa = await loadPwaStore(true);
		const event = {
			prompt: vi.fn(async () => undefined),
			userChoice: Promise.resolve({ outcome: 'accepted' as const, platform: 'web' })
		} as unknown as Parameters<typeof pwa.setInstallPrompt>[0];

		expect(get(pwa.canInstall)).toBe(false);
		pwa.setInstallPrompt(event);
		expect(get(pwa.installPrompt)).toBe(event);
		expect(get(pwa.canInstall)).toBe(true);
		pwa.setInstallPrompt(null);
		expect(get(pwa.canInstall)).toBe(false);
	});

	it('detects standalone mode from display-mode media query changes', async () => {
		const media = installMatchMedia(false);
		const pwa = await loadPwaStore(true);

		expect(get(pwa.isStandalone)).toBe(false);

		media.matches = true;
		media.trigger();
		expect(get(pwa.isStandalone)).toBe(true);
	});

	it('supports ios standalone mode and no-ops outside the browser', async () => {
		Object.defineProperty(navigator, 'standalone', {
			configurable: true,
			value: true
		});
		installMatchMedia(false);

		const browserStore = await loadPwaStore(true);
		expect(get(browserStore.isStandalone)).toBe(true);

		const serverStore = await loadPwaStore(false);
		expect(get(serverStore.canInstall)).toBe(false);
		expect(get(serverStore.installPrompt)).toBeNull();
	});
});
