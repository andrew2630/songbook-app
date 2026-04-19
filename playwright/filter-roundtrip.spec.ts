import { expect, test } from '@playwright/test';
import { mockSongbookApi, seedClientState } from './helpers/songbook';

test.beforeEach(async ({ page }) => {
	await seedClientState(page);
});

test('cleared list filters are not restored after reopening and leaving a song', async ({
	page
}) => {
	const alphaCard = page.locator('article').filter({ hasText: 'Alpha Grace' });
	const pilgrimCard = page.locator('article').filter({ hasText: 'Pilgrim Hope' });

	await mockSongbookApi(page);
	await page.goto('/');

	await expect(alphaCard).toBeVisible();
	await expect(pilgrimCard).toBeVisible();

	await page
		.locator('label')
		.filter({ hasText: 'Sort by' })
		.locator('select')
		.selectOption('recent');
	await page.getByRole('combobox', { name: 'Source' }).selectOption('zborowy');

	await expect(alphaCard).toBeVisible();
	await expect(pilgrimCard).toHaveCount(0);
	await alphaCard.getByRole('button', { name: 'Open' }).click();

	await expect(page).toHaveURL(/\/song\/1\?/);
	await page.getByRole('button', { name: 'Back to song list' }).click();

	await expect(alphaCard).toBeVisible();
	await expect(pilgrimCard).toHaveCount(0);

	await page.getByRole('button', { name: 'Reset filters' }).click();

	await expect(page).toHaveURL('http://127.0.0.1:4173/');
	await expect(alphaCard).toBeVisible();
	await expect(pilgrimCard).toBeVisible();
	await expect(page.getByRole('combobox', { name: 'Source' })).toHaveValue('all');
	await expect(page.getByRole('combobox', { name: 'Sort by' })).toHaveValue('page');

	await pilgrimCard.getByRole('button', { name: 'Open' }).click();

	await expect(page).toHaveURL(/\/song\/2\?/);
	await page.getByRole('button', { name: 'Back to song list' }).click();

	await expect(page).toHaveURL('http://127.0.0.1:4173/');
	await expect(alphaCard).toBeVisible();
	await expect(pilgrimCard).toBeVisible();
	await expect(page.getByRole('combobox', { name: 'Source' })).toHaveValue('all');
	await expect(page.getByRole('combobox', { name: 'Sort by' })).toHaveValue('page');
});
