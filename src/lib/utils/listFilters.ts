import type { SongSortMode, SongSourceFilter } from '$lib/stores/songStore';

export type SongMenuView = 'index' | 'favourites';

export interface ListFilterState {
	query: string;
	menuView: SongMenuView;
	pageFilter: number | null;
	sortMode: SongSortMode;
	sourceFilter: SongSourceFilter;
	pageSearch: string;
}

export const DEFAULT_LIST_FILTER_STATE: ListFilterState = {
	query: '',
	menuView: 'index',
	pageFilter: null,
	sortMode: 'page',
	sourceFilter: 'all',
	pageSearch: ''
};

export function readListFilterStateFromSearch(search: string): ListFilterState {
	const params = new URLSearchParams(search);
	const nextQuery = params.get('q');
	const nextMenuView = params.get('view');
	const nextPageFilter = params.get('page');
	const nextSortMode = params.get('sort');
	const nextSourceFilter = params.get('source');

	return {
		query: nextQuery ?? DEFAULT_LIST_FILTER_STATE.query,
		menuView: nextMenuView === 'favourites' ? 'favourites' : DEFAULT_LIST_FILTER_STATE.menuView,
		pageFilter:
			nextPageFilter && /^\d+$/.test(nextPageFilter)
				? Number(nextPageFilter)
				: DEFAULT_LIST_FILTER_STATE.pageFilter,
		sortMode:
			nextSortMode === 'alpha' || nextSortMode === 'recent' || nextSortMode === 'page'
				? nextSortMode
				: DEFAULT_LIST_FILTER_STATE.sortMode,
		sourceFilter:
			nextSourceFilter === 'zborowy' ||
			nextSourceFilter === 'pielgrzym' ||
			nextSourceFilter === 'all'
				? nextSourceFilter
				: DEFAULT_LIST_FILTER_STATE.sourceFilter,
		pageSearch: DEFAULT_LIST_FILTER_STATE.pageSearch
	};
}

export function buildListUrlFromState(
	state: Pick<ListFilterState, 'query' | 'menuView' | 'pageFilter' | 'sortMode' | 'sourceFilter'>,
	pathname: string,
	hash = ''
) {
	const params = new URLSearchParams();
	const trimmedQuery = state.query.trim();
	if (trimmedQuery) params.set('q', trimmedQuery);
	if (state.menuView === 'favourites') params.set('view', state.menuView);
	if (state.pageFilter !== null) params.set('page', String(state.pageFilter));
	if (state.sortMode !== DEFAULT_LIST_FILTER_STATE.sortMode) params.set('sort', state.sortMode);
	if (state.sourceFilter !== DEFAULT_LIST_FILTER_STATE.sourceFilter) {
		params.set('source', state.sourceFilter);
	}

	const nextSearch = params.toString();
	return `${pathname}${nextSearch ? `?${nextSearch}` : ''}${hash}`;
}

export function clearListFilterState(): ListFilterState {
	return { ...DEFAULT_LIST_FILTER_STATE };
}
