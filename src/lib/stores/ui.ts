import { writable } from 'svelte/store';

const searchOverlay = writable(false);

export const isSearchOverlayOpen = {
	subscribe: searchOverlay.subscribe
};

export function openSearchOverlay() {
	searchOverlay.set(true);
}

export function closeSearchOverlay() {
	searchOverlay.set(false);
}
