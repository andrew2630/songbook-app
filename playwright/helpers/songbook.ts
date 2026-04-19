import type { Page } from '@playwright/test';

export const songHeaders = [
	{
		id: 1,
		language: 'EN',
		version: 1,
		title: 'Alpha Grace',
		source: 'zborowy',
		page: 11,
		externalIndex: '11',
		isPublic: true,
		lastUpdatedAt: '2026-04-01T10:00:00.000Z'
	},
	{
		id: 2,
		language: 'EN',
		version: 1,
		title: 'Pilgrim Hope',
		source: 'pielgrzym',
		page: 42,
		externalIndex: 'P-42',
		isPublic: true,
		lastUpdatedAt: '2026-04-10T10:00:00.000Z'
	},
	{
		id: 3,
		language: 'EN',
		version: 1,
		title: 'River Song',
		source: 'zborowy',
		page: 7,
		externalIndex: '7',
		isPublic: true,
		lastUpdatedAt: '2026-04-15T10:00:00.000Z'
	}
];

export const songItems = [
	{
		id: 1,
		language: 'EN',
		lineNumber: 1,
		type: 'TEXT',
		text: 'Amazing grace, how sweet the sound',
		alignment: 'LEFT',
		isBold: false,
		isItalics: false
	},
	{
		id: 1,
		language: 'EN',
		lineNumber: 2,
		type: 'CHORDS',
		text: 'C G Am F',
		alignment: 'LEFT',
		isBold: false,
		isItalics: false
	},
	{
		id: 1,
		language: 'EN',
		lineNumber: 3,
		type: 'TEXT',
		text: 'That saved a soul like me',
		alignment: 'LEFT',
		isBold: false,
		isItalics: false
	},
	{
		id: 1,
		language: 'EN',
		lineNumber: 4,
		type: 'TECHNICAL',
		text: 'Capo 2',
		alignment: 'LEFT',
		isBold: false,
		isItalics: false
	},
	{
		id: 1,
		language: 'EN',
		lineNumber: 5,
		type: 'TEXT',
		text: 'I once was lost but now am found',
		alignment: 'LEFT',
		isBold: false,
		isItalics: false
	},
	{
		id: 1,
		language: 'EN',
		lineNumber: 6,
		type: 'TEXT',
		text: 'Was blind but now I see',
		alignment: 'LEFT',
		isBold: false,
		isItalics: false
	},
	{
		id: 2,
		language: 'EN',
		lineNumber: 1,
		type: 'TEXT',
		text: 'Lead us onward with your hope',
		alignment: 'LEFT',
		isBold: false,
		isItalics: false
	},
	{
		id: 2,
		language: 'EN',
		lineNumber: 2,
		type: 'TEXT',
		text: 'Guide our footsteps through the night',
		alignment: 'LEFT',
		isBold: false,
		isItalics: false
	},
	{
		id: 3,
		language: 'EN',
		lineNumber: 1,
		type: 'TEXT',
		text: 'River of mercy flowing free',
		alignment: 'LEFT',
		isBold: false,
		isItalics: false
	}
];

export async function seedClientState(page: Page) {
	await page.addInitScript(() => {
		window.localStorage.setItem('songbook-language', JSON.stringify('EN'));
		window.localStorage.setItem('songbook-theme', JSON.stringify('light'));
		window.localStorage.setItem('songbook-view-mode', JSON.stringify('basic'));
		window.localStorage.setItem('songbook-favourites', JSON.stringify([]));
		window.localStorage.setItem('songbook-text-size', JSON.stringify(0));

		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: {
				writeText: async (value: string) => {
					(window as Window & { __copiedSongUrl?: string }).__copiedSongUrl = value;
				}
			}
		});
	});
}

export async function mockSongbookApi(page: Page) {
	await page.route('**/rest/v1/songsHeaders**', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(songHeaders)
		});
	});

	await page.route('**/rest/v1/songsItems**', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(songItems)
		});
	});
}
