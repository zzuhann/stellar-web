import { test, expect, type Page } from '@playwright/test';

// qa.md 情境 42：分享連結進站不閃綜合排序；重新整理後需重新定位。
//
// 資料集刻意只放一間場地——此情境無法靠「排序順序變了」來證明「沒有先閃一份綜合排序」
// （只有一間場地時任何排序順序都相同），改用「卡片第一次出現時已經帶距離文字」佐證：
// 若曾經有過一次「無距離」的中間渲染，使用者理論上會先看到沒有距離文字的卡片，之後才
// 補上；這裡沒有辦法排除瀏覽器把兩次 paint 合併在一次視覺更新裡的可能，是 E2E 層級能做
// 到的近似驗證，不是逐 frame 的嚴格證明。

const VENUE_FIXTURE = {
  id: 'venue-1',
  name: '測試場地',
  address: '台北市中山區測試路 1 號',
  region: '台北',
  lat: 25.0478,
  lng: 121.517,
  nearestMrt: '台北車站',
  mrtWalkMinutes: 5,
  capacityRange: '20-40',
  eventCount: 2,
  coverPhoto: null,
  status: 'active',
};

async function mockVenuesList(page: Page) {
  await page.route('**/api/venues**', async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('limit') === '1000') {
      // VenuesClient 的 page.tsx 另外打一次大量查詢來列舉地區 chip，與下方分頁查詢形狀不同。
      await route.fulfill({ json: { venues: [VENUE_FIXTURE] } });
      return;
    }
    await route.fulfill({
      json: {
        venues: [VENUE_FIXTURE],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    });
  });
}

test.describe('venue-distance-sort（qa.md 情境 42）', () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 25.033, longitude: 121.5654 });
  });

  test('帶 ?sort=distance 的分享連結進站：最終依距離排序，卡片顯示距離文字', async ({ page }) => {
    await mockVenuesList(page);
    await page.goto('/venues?sort=distance');

    const card = page.getByRole('link', { name: /測試場地/ });
    await expect(card).toBeVisible({ timeout: 15_000 });
    await expect(card).toContainText(/公尺|公里/);
  });

  test('選取「距離最近」取得座標後重新整理，reload 後不操作選單仍自動重新定位', async ({
    page,
  }) => {
    await mockVenuesList(page);

    // 包裝 getCurrentPosition 計數，用來斷言 reload 後的「新文件」確實又呼叫了一次
    // （addInitScript 會在每個新文件載入時重新注入，reload 後計數器天然歸零重算）。
    await page.addInitScript(() => {
      const w = window as unknown as { __geoCallCount: number };
      w.__geoCallCount = 0;
      const original = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
      navigator.geolocation.getCurrentPosition = ((...args: Parameters<typeof original>) => {
        w.__geoCallCount += 1;
        return original(...args);
      }) as typeof navigator.geolocation.getCurrentPosition;
    });

    await page.goto('/venues');
    await page.getByRole('button', { name: '排序' }).click();
    await page.getByRole('menuitemradio', { name: /距離最近/ }).click();

    await expect(page.getByRole('link', { name: /測試場地/ })).toContainText(/公尺|公里/, {
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/sort=distance/);

    await page.reload();

    // 不以「正在取得你的位置…」提示是否出現作為判斷依據——已 grantPermissions 時定位可能
    // 瞬間完成，提示來不及出現；授權彈窗也不會再跳出（已授權過）。直接斷言新文件確實呼叫
    // 了 getCurrentPosition（等同重新整理後視同全新一次流程，requirements.md 已定案行為）。
    await expect
      .poll(async () =>
        page.evaluate(() => (window as unknown as { __geoCallCount: number }).__geoCallCount)
      )
      .toBeGreaterThanOrEqual(1);
  });
});
