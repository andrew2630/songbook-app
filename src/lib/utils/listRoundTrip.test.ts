// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	buildListUrlFromState,
	clearListFilterState,
	readListFilterStateFromSearch
} from '$lib/utils/listFilters';

async function loadSongNavigation(browser: boolean) {
	vi.resetModules();
	vi.doMock('$app/environment', () => ({ browser }));
	return import('$lib/utils/songNavigation');
}

describe('list round trip regression', () => {
	beforeEach(() => {
		window.sessionStorage.clear();
		window.history.replaceState({}, '', '/');
	});

	it('does not restore a historical filter after it was cleared before reopening a song', async () => {
		const navigation = await loadSongNavigation(true);

		const filteredListUrl = buildListUrlFromState(
			{
				query: 'łaska',
				menuView: 'index',
				pageFilter: null,
				sortMode: 'recent',
				sourceFilter: 'zborowy'
			},
			'/'
		);
		expect(filteredListUrl).toBe('/?q=%C5%82aska&sort=recent&source=zborowy');

		navigation.rememberSongReturnPath(filteredListUrl);
		navigation.rememberSongListPath(filteredListUrl);
		expect(navigation.getRememberedSongListPath()).toBe(filteredListUrl);

		const clearedState = clearListFilterState();
		const clearedListUrl = buildListUrlFromState(clearedState, '/');
		expect(clearedListUrl).toBe('/');

		navigation.rememberSongReturnPath(clearedListUrl);
		navigation.rememberSongListPath(clearedListUrl);
		expect(navigation.getRememberedSongListPath()).toBe('/');

		window.history.replaceState({}, '', clearedListUrl);

		const returnedState = readListFilterStateFromSearch(window.location.search);
		expect(returnedState).toEqual(clearedState);
		expect(returnedState.query).toBe('');
		expect(returnedState.sortMode).toBe('page');
		expect(returnedState.sourceFilter).toBe('all');
	});
});
