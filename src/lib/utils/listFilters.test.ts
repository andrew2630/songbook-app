import { describe, expect, it } from 'vitest';
import {
	buildListUrlFromState,
	clearListFilterState,
	DEFAULT_LIST_FILTER_STATE,
	readListFilterStateFromSearch
} from '$lib/utils/listFilters';

describe('listFilters', () => {
	it('reads filter state from URL params', () => {
		expect(
			readListFilterStateFromSearch('?q=grace&view=favourites&page=12&sort=recent&source=pielgrzym')
		).toEqual({
			query: 'grace',
			menuView: 'favourites',
			pageFilter: 12,
			sortMode: 'recent',
			sourceFilter: 'pielgrzym'
		});
	});

	it('falls back to default state for an empty or cleared URL', () => {
		const historicalState = readListFilterStateFromSearch(
			'?q=test&view=favourites&page=9&sort=alpha&source=zborowy'
		);
		expect(historicalState).not.toEqual(DEFAULT_LIST_FILTER_STATE);

		expect(readListFilterStateFromSearch('')).toEqual(DEFAULT_LIST_FILTER_STATE);
		expect(readListFilterStateFromSearch('?')).toEqual(DEFAULT_LIST_FILTER_STATE);
	});

	it('clears every exposed list filter and builds a clean root URL', () => {
		const clearedState = clearListFilterState();

		expect(clearedState).toEqual(DEFAULT_LIST_FILTER_STATE);
		expect(buildListUrlFromState(clearedState, '/')).toBe('/');
	});

	it('builds a shareable URL only from non-default state', () => {
		expect(
			buildListUrlFromState(
				{
					query: '  grace  ',
					menuView: 'favourites',
					pageFilter: 18,
					sortMode: 'recent',
					sourceFilter: 'pielgrzym'
				},
				'/songs',
				'#top'
			)
		).toBe('/songs?q=grace&view=favourites&page=18&sort=recent&source=pielgrzym#top');
	});
});
