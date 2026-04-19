import { expect, test } from '@playwright/test';
import { mockSongbookApi, seedClientState } from './helpers/songbook';

test.beforeEach(async ({ page }) => {
	await seedClientState(page);
	await mockSongbookApi(page);
	await page.goto('/');
});

test('supports search, preview expansion, sharing and favourites on the song list', async ({
	page
}) => {
	const alphaCard = page.locator('article').filter({ hasText: 'Alpha Grace' });
	const pilgrimCard = page.locator('article').filter({ hasText: 'Pilgrim Hope' });
	const riverCard = page.locator('article').filter({ hasText: 'River Song' });

	await expect(alphaCard).toBeVisible();
	await expect(pilgrimCard).toBeVisible();
	await expect(riverCard).toBeVisible();

	await page.locator('#song-search').fill('river');
	await expect(riverCard).toBeVisible();
	await expect(alphaCard).toHaveCount(0);
	await expect(pilgrimCard).toHaveCount(0);

	await page.locator('#song-search').fill('');
	await expect(alphaCard).toBeVisible();

	await alphaCard.getByRole('button', { name: 'Preview lyrics' }).click();
	await expect(alphaCard.getByText('Was blind but now I see')).toBeVisible();
	await alphaCard.getByRole('button', { name: 'Hide preview' }).click();
	await expect(alphaCard.getByText('Was blind but now I see')).toHaveCount(0);

	await alphaCard.getByRole('button', { name: 'Copy share link' }).click();
	await expect(alphaCard.getByRole('button', { name: 'Link copied!' })).toBeVisible();
	await expect
		.poll(() =>
			page.evaluate(() => (window as Window & { __copiedSongUrl?: string }).__copiedSongUrl ?? '')
		)
		.toContain('/song/1?lang=EN');

	await alphaCard.getByRole('button', { name: 'Add to favourites' }).click();
	await expect(alphaCard.getByRole('button', { name: 'Remove from favourites' })).toBeVisible();

	await page
		.locator('#song-filters-panel')
		.getByRole('button', { name: 'Favourites', exact: true })
		.click();
	await expect(alphaCard).toBeVisible();
	await expect(pilgrimCard).toHaveCount(0);
	await expect(riverCard).toHaveCount(0);
});
