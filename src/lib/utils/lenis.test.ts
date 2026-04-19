// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

const lenisConstructor = vi.fn();

vi.mock('lenis', () => ({
	default: lenisConstructor
}));

type PointerController = {
	get matches(): boolean;
	set matches(value: boolean);
};

function installPointerMediaQuery(initialMatches = false) {
	let matches = initialMatches;
	Object.defineProperty(window, 'matchMedia', {
		configurable: true,
		value: vi.fn(() => ({
			get matches() {
				return matches;
			},
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}))
	});

	return {
		get matches() {
			return matches;
		},
		set matches(value: boolean) {
			matches = value;
		}
	} satisfies PointerController;
}

async function loadLenis(browser: boolean) {
	vi.resetModules();
	vi.doMock('$app/environment', () => ({ browser }));
	return import('$lib/utils/lenis');
}

describe('lenis', () => {
	beforeEach(() => {
		document.body.className = '';
		document.documentElement.removeAttribute('data-lenis');
		lenisConstructor.mockReset();
	});

	it('returns null outside the browser and on coarse pointers', async () => {
		installPointerMediaQuery(true);
		const serverModule = await loadLenis(false);
		await expect(serverModule.initLenis()).resolves.toBeNull();

		const browserModule = await loadLenis(true);
		await expect(browserModule.initLenis()).resolves.toBeNull();
	});

	it('initialises lenis, wires raf/resize handling, and cleans up on destroy', async () => {
		const pointer = installPointerMediaQuery(false);
		pointer.matches = false;

		const resizeObserverDisconnect = vi.fn();
		const resizeObserverObserve = vi.fn();
		const resizeObserverCallbacks: Array<() => void> = [];
		class FakeResizeObserver {
			constructor(callback: () => void) {
				resizeObserverCallbacks.push(callback);
			}
			observe = resizeObserverObserve;
			disconnect = resizeObserverDisconnect;
		}

		const rafCallbacks: FrameRequestCallback[] = [];
		const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(((
			callback: FrameRequestCallback
		) => {
			rafCallbacks.push(callback);
			return 10 + rafCallbacks.length;
		}) as typeof window.requestAnimationFrame);
		const cancelAnimationFrameSpy = vi
			.spyOn(window, 'cancelAnimationFrame')
			.mockImplementation(() => undefined);

		vi.stubGlobal('ResizeObserver', FakeResizeObserver);

		const raf = vi.fn();
		const resize = vi.fn();
		const destroy = vi.fn();
		lenisConstructor.mockImplementation(() => ({ raf, resize, destroy }));

		const lenisModule = await loadLenis(true);
		const controller = await lenisModule.initLenis();

		expect(controller).not.toBeNull();
		expect(lenisConstructor).toHaveBeenCalledWith({ duration: 0.32 });
		expect(document.body.classList.contains('is-lenis')).toBe(true);
		expect(document.documentElement.dataset.lenis).toBe('active');

		rafCallbacks[0](16);
		expect(raf).toHaveBeenCalledWith(16);
		expect(resizeObserverObserve).toHaveBeenCalledWith(document.body);

		resizeObserverCallbacks[0]();
		expect(resize).toHaveBeenCalled();

		controller?.destroy();
		expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(12);
		expect(resizeObserverDisconnect).toHaveBeenCalled();
		expect(destroy).toHaveBeenCalled();
		expect(document.body.classList.contains('is-lenis')).toBe(false);
		expect(document.documentElement.dataset.lenis).toBeUndefined();

		requestAnimationFrameSpy.mockRestore();
		cancelAnimationFrameSpy.mockRestore();
	});
});
