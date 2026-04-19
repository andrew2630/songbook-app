import { expect, test } from '@playwright/test';
import { mockSongbookApi, seedClientState } from './helpers/songbook';

test.beforeEach(async ({ page }) => {
	await seedClientState(page);
	await mockSongbookApi(page);
	await page.goto('/');
});

test('supports detail view modes, text zoom, favourites and compact-header search', async ({
	page
}) => {
	const alphaCard = page.locator('article').filter({ hasText: 'Alpha Grace' });

	await alphaCard.getByRole('button', { name: 'Open' }).click();
	await expect(page).toHaveURL(/\/song\/1\?/);
	await expect(page.getByRole('heading', { name: 'Alpha Grace' })).toBeVisible();

	await expect(page.getByText('C G Am F')).toHaveCount(0);
	await expect(page.getByText('Capo 2')).toHaveCount(0);

	await page.getByRole('tab', { name: 'Chords view' }).click();
	await expect(page.getByText('C G Am F')).toBeVisible();
	await expect(page.getByText('Capo 2')).toBeVisible();

	await page.getByRole('button', { name: 'Add to favourites' }).click();
	await expect(page.getByRole('button', { name: 'Remove from favourites' })).toBeVisible();

	await page.getByRole('button', { name: 'Text size' }).click();
	const zoomDialog = page.getByRole('dialog', { name: 'Text size' });
	await expect(zoomDialog).toBeVisible();
	await page.getByRole('button', { name: 'Increase text size' }).click();
	await expect(zoomDialog).toContainText('104%');
	await page.getByRole('button', { name: 'Reset text size to 100%' }).click();
	await expect(zoomDialog).toContainText('100%');

	await page.getByRole('button', { name: /Search by title, lyric, page or index/i }).click();
	const overlay = page.getByRole('dialog');
	await expect(overlay).toBeVisible();
	await overlay.getByRole('searchbox').fill('pilgrim');
	await overlay.locator('button').filter({ hasText: 'Pilgrim Hope' }).click();

	await expect(page).toHaveURL(/\/song\/2\?/);
	await expect(page.getByRole('heading', { name: 'Pilgrim Hope' })).toBeVisible();

	await page.getByRole('button', { name: 'Back to song list' }).click();
	await expect(page).toHaveURL('http://127.0.0.1:4173/');
	await page.getByRole('button', { name: 'Favourites', exact: true }).click();
	await expect(page.locator('article').filter({ hasText: 'Alpha Grace' })).toBeVisible();
	await expect(page.locator('article').filter({ hasText: 'Pilgrim Hope' })).toHaveCount(0);
});
