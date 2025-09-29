export type ThemeOption = {
	id: string;
	labelKey: string;
	preview: string[];
	scheme: 'light' | 'dark';
	metaColor: string;
};

export const themeOptions: ThemeOption[] = [
	{
		id: 'songbook-dawn',
		labelKey: 'dawn',
		preview: ['#fff7ed', '#fed7aa', '#fb923c'],
		scheme: 'light',
		metaColor: '#fde68a'
	},
	{
		id: 'songbook-meadow',
		labelKey: 'meadow',
		preview: ['#ecfdf3', '#bbf7d0', '#34d399'],
		scheme: 'light',
		metaColor: '#86efac'
	},
	{
		id: 'songbook-aurora',
		labelKey: 'aurora',
		preview: ['#eef2ff', '#c7d2fe', '#6366f1'],
		scheme: 'light',
		metaColor: '#a5b4fc'
	},
	{
		id: 'songbook-dusk',
		labelKey: 'dusk',
		preview: ['#ede9fe', '#c4b5fd', '#7c3aed'],
		scheme: 'dark',
		metaColor: '#5b21b6'
	},
	{
		id: 'songbook-midnight',
		labelKey: 'midnight',
		preview: ['#0f172a', '#1e293b', '#38bdf8'],
		scheme: 'dark',
		metaColor: '#0f172a'
	}
];

export const defaultTheme = themeOptions[0];

export const themeMap = new Map(themeOptions.map((option) => [option.id, option]));
