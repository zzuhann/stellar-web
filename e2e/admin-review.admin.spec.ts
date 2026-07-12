import { expect, test, type Page } from '@playwright/test';

const artist = {
  id: 'artist-1',
  stageName: 'ONE',
  stageNameZh: '一號',
  groupNames: [],
  status: 'pending',
  createdBy: 'user-1',
  createdAt: '2026-07-12T00:00:00.000Z',
  updatedAt: '2026-07-12T00:00:00.000Z',
};

const event = {
  id: 'event-1',
  title: '測試生咖',
  description: '活動說明',
  artists: [{ id: 'artist-1', name: 'ONE' }],
  location: {
    name: '測試場地',
    address: '台北市測試路 1 號',
    coordinates: { lat: 25.05, lng: 121.52 },
  },
  datetime: {
    start: { _seconds: 1783814400, _nanoseconds: 0 },
    end: { _seconds: 1783900800, _nanoseconds: 0 },
  },
  socialMedia: { instagram: '@stellar' },
  status: 'pending',
  createdBy: 'user-1',
  createdAt: { _seconds: 1783814400, _nanoseconds: 0 },
  updatedAt: { _seconds: 1783814400, _nanoseconds: 0 },
};

async function mockArtists(page: Page) {
  let approved = false;
  let updatedName = artist.stageName;
  await page.route('**/artists**', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      await route.fulfill({ json: approved ? [] : [{ ...artist, stageName: updatedName }] });
      return;
    }
    if (request.url().endsWith('/approve')) {
      approved = true;
      expect(request.postDataJSON()).toEqual({ adminUpdate: { groupNames: ['GROUP'] } });
      await route.fulfill({ status: 204 });
      return;
    }
    if (request.method() === 'PUT') {
      updatedName = request.postDataJSON().stageName;
      await route.fulfill({ json: { ...artist, stageName: updatedName } });
      return;
    }
    await route.fallback();
  });
}

async function mockEvents(page: Page) {
  let approved = false;
  await page.route('**/events**', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      await route.fulfill({ json: approved ? [] : [event] });
      return;
    }
    if (request.url().endsWith('/approve')) {
      approved = true;
      await route.fulfill({ json: event });
      return;
    }
    await route.fallback();
  });
}

test('待審藝人可編輯後設定團名並通過', async ({ page }) => {
  await mockArtists(page);
  await page.goto('/admin-new/review?tab=artists');

  await page.getByRole('button', { name: '編輯' }).click();
  await page.getByLabel('藝名（英文）').fill('ONE EDITED');
  await page.getByRole('button', { name: '儲存' }).click();
  await expect(page.getByText('ONE EDITED')).toBeVisible();

  await page.getByRole('button', { name: '通過' }).click();
  await page.getByLabel('團名 1').fill('GROUP');
  await page.getByRole('button', { name: '確認通過' }).click();
  await expect(page.getByText('沒有待審核藝人')).toBeVisible();
});

test('待審生咖可預覽後通過', async ({ page }) => {
  await mockEvents(page);
  await page.goto('/admin-new/review?tab=events');

  await page.getByRole('button', { name: '預覽' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: '預覽' })).toBeVisible();
  await expect(dialog.getByText('測試場地', { exact: false })).toBeVisible();
  await dialog.getByRole('button', { name: '關閉預覽' }).click();

  await page.getByRole('button', { name: '通過' }).click();
  await expect(page.getByText('沒有待審核生咖')).toBeVisible();
});
