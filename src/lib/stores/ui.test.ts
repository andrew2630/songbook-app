import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { closeSearchOverlay, isSearchOverlayOpen, openSearchOverlay } from '$lib/stores/ui';

describe('ui store', () => {
	it('opens and closes the search overlay flag', () => {
		closeSearchOverlay();
		expect(get(isSearchOverlayOpen)).toBe(false);

		openSearchOverlay();
		expect(get(isSearchOverlayOpen)).toBe(true);

		closeSearchOverlay();
		expect(get(isSearchOverlayOpen)).toBe(false);
	});
});
