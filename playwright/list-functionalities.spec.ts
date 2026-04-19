import { expect, test } from '@playwright/test';
import { mockSongbookApi, seedClientState } from './helpers/songbook';

test.beforeEach(async ({ page }) => {
	await seedClientState(page);
	await mockSongbookApi(page);
	await page.goto('/');
});

test('supports search, card preview expansion and compact list mode on the song list', async ({
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
	await expect(alphaCard.getByText('Amazing grace, how sweet the sound')).toBeVisible();

	await alphaCard.getByRole('button', { name: 'Preview lyrics' }).click();
	await expect(alphaCard.getByText('Was blind but now I see')).toBeVisible();
	await alphaCard.getByRole('button', { name: 'Hide preview' }).click();
	await expect(alphaCard.getByText('Was blind but now I see')).toHaveCount(0);

	await page.getByRole('button', { name: 'Hide preview lines' }).click();
	await expect(alphaCard.getByText('Amazing grace, how sweet the sound')).toHaveCount(0);
	await expect(alphaCard.getByRole('button', { name: 'Preview lyrics' })).toHaveCount(0);

	await page.getByRole('button', { name: 'Show preview lines' }).click();
	await expect(alphaCard.getByText('Amazing grace, how sweet the sound')).toBeVisible();
	await expect(alphaCard.getByRole('button', { name: 'Preview lyrics' })).toBeVisible();
});
