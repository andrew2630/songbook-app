import { browser } from '$app/environment';

const RETURN_PATH_KEY = 'songbook-last-return-path';
const LIST_PATH_KEY = 'songbook-last-list-path';

export function getCurrentAppPath(fallback = '/') {
	if (!browser) return fallback;
	return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function rememberSongReturnPath(path: string) {
	if (!browser) return;
	window.sessionStorage.setItem(RETURN_PATH_KEY, path);
}

export function hasRememberedSongReturnPath(path: string | null) {
	if (!browser || !path) return false;
	return window.sessionStorage.getItem(RETURN_PATH_KEY) === path;
}

export function rememberSongListPath(path: string) {
	if (!browser) return;
	window.sessionStorage.setItem(LIST_PATH_KEY, path);
}

export function getRememberedSongListPath() {
	if (!browser) return null;
	return window.sessionStorage.getItem(LIST_PATH_KEY);
}
