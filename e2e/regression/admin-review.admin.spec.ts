import { expect, test, type Page } from '@playwright/test';

/**
 * 後台審核 /admin-new/review（全 mock，不落地）。
 *
 * 此檔實體放在 regression/，但因檔名為 *.admin.spec.ts，由 playwright.config.ts 的 `chromium-admin`
 * project 執行——需要 admin storageState（e2e/.auth/admin.json）+ Firestore emulator 才能通過
 * `role==='admin'` 守衛。因此它「不會」出現在對正式站(BASE_URL)的例行執行中（見 e2e/README.md）。
 * 所有 API（artists / events）皆以 page.route mock，不寫入任何資料。@scenario none：不在 34 條情境清單內。
 */

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
      expect(
        request.postDataJSON(),
        '通過藝人時應把 admin 補的團名一起送出（adminUpdate.groupNames）'
      ).toEqual({ adminUpdate: { groupNames: ['GROUP'] } });
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

// @scenario none: 後台審核 — 待審藝人可先編輯藝名、通過時補團名，通過後從待審清單消失。
test('後台審核：待審藝人可編輯藝名，並在通過時補上團名，通過後從待審清單移除', async ({ page }) => {
  await mockArtists(page);
  await page.goto('/admin-new/review?tab=artists');

  await page.getByRole('button', { name: '編輯' }).click();
  await page.getByLabel('藝名（英文）').fill('ONE EDITED');
  await page.getByRole('button', { name: '儲存' }).click();
  await expect(
    page.getByText('ONE EDITED'),
    '編輯並儲存後，清單應顯示更新後的藝名「ONE EDITED」'
  ).toBeVisible();

  await page.getByRole('button', { name: '通過' }).click();
  await page.getByLabel('團名 1').fill('GROUP');
  await page.getByRole('button', { name: '確認通過' }).click();
  await expect(
    page.getByText('沒有待審核藝人'),
    '通過後該藝人應離開待審清單，顯示「沒有待審核藝人」空狀態'
  ).toBeVisible();
});

// @scenario none: 後台審核 — 待審生咖可先預覽內容，再通過，通過後從待審清單消失。
test('後台審核：待審生咖可先預覽活動內容，再通過，通過後從待審清單移除', async ({ page }) => {
  await mockEvents(page);
  await page.goto('/admin-new/review?tab=events');

  await page.getByRole('button', { name: '預覽' }).click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog.getByRole('heading', { name: '預覽' }),
    '點「預覽」應開啟預覽 dialog'
  ).toBeVisible();
  await expect(
    dialog.getByText('測試場地', { exact: false }),
    '預覽 dialog 應顯示該活動的場地名稱「測試場地」'
  ).toBeVisible();
  await dialog.getByRole('button', { name: '關閉預覽' }).click();

  await page.getByRole('button', { name: '通過' }).click();
  await expect(
    page.getByText('沒有待審核生咖'),
    '通過後該生咖應離開待審清單，顯示「沒有待審核生咖」空狀態'
  ).toBeVisible();
});
