import { expect, test, type Page } from '@playwright/test';

const ARTIST = {
  id: 'artist-1',
  slug: 'alpha',
  stageName: 'ALPHA',
  realName: '甲',
  birthday: '2000-01-02',
  status: 'approved',
  createdBy: 'someone-else',
  createdAt: { _seconds: 1700000000, _nanoseconds: 0 },
  updatedAt: { _seconds: 1700000000, _nanoseconds: 0 },
};

async function mockArtistApis(page: Page) {
  // Search results (list endpoint) and the single-artist lookup used by the preselect.
  await page.route('**/api/artists?*', async (route) => {
    await route.fulfill({ json: [ARTIST] });
  });
  await page.route('**/api/artists/artist-1', async (route) => {
    await route.fulfill({ json: ARTIST });
  });
}

test.describe('投稿藝人防重複搜尋', () => {
  test('TC-008 搜尋入口 → 新增應援 → 落地投稿活動頁並看到預選藝人', async ({ page }) => {
    await mockArtistApis(page);

    await page.goto('/submit-artist');
    await page
      .getByRole('button', { name: /投稿前，先確認你想新增的藝人、團體是否已經存在/ })
      .click();
    await page.getByRole('textbox', { name: '搜尋藝人' }).fill('alpha');
    await page.getByRole('link', { name: '為 ALPHA 新增生日應援' }).click();

    await expect(page).toHaveURL(/\/submit-event\?artistId=artist-1/);
    await expect(page.getByRole('button', { name: /已選擇 ALPHA/ })).toBeVisible();
    // Still on step 1: the artist picker is showing, not the event info fields.
    await expect(page.getByText('若為聯合應援，可選擇多個藝人')).toBeVisible();
  });

  test('TC-010 不帶 artistId 的 create 流程：沒有預選、沒有被 redirect', async ({ page }) => {
    await mockArtistApis(page);

    await page.goto('/submit-event');

    await expect(page).toHaveURL(/\/submit-event$/);
    await expect(page.getByRole('button', { name: '請選擇藝人' })).toBeVisible();
    await expect(page.getByRole('button', { name: /已選擇/ })).toHaveCount(0);
  });
});
