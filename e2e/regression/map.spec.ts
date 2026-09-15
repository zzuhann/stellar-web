import { test, expect, type Page } from '@playwright/test';

/**
 * 藝人活動地圖頁 /map/[artist]。未登入、對正式站唯讀。
 *
 * 技術背景（真 Playwright 1280×800 實測，2026-08-09）：地圖用 Leaflet；marker **按場地聚合**
 * （scoups 25 個活動只顯示 3 個 marker，多活動同場地共用一個 marker），故 marker 數 ≠ 活動數。
 * 點 marker 會依「單/多活動」而不同：單活動→浮出活動卡；多活動/聚合→放大地圖顯示更細（越放大 marker 越多，
 * 類似 Google Maps）或篩選 bottom sheet。下方有可拖曳 bottom sheet（data-testid="bottom-sheet"）。
 * 標題「[藝人]的生日應援地圖」灌進全域 header（非頁內 h1）。無「我的位置」按鈕——geolocation 載入時自動請求（見 F-9）。
 *
 * marker 需「真實 viewport」才會渲染（Leaflet 依地圖尺寸算邊界）；regression project 是 Desktop Chrome，有 viewport → OK。
 */

async function gotoFirstMap(page: Page): Promise<void> {
  await page.goto('/');
  const link = page.locator('a[href^="/map/"]').first();
  await expect(link, '首頁應至少有一個地圖連結 a[href^="/map/"]，但找不到').toBeVisible({
    timeout: 15_000,
  });
  await link.click();
  await expect(page, '點地圖連結後網址應變成 /map/[artist]').toHaveURL(/\/map\/.+/);
}

test.describe('藝人活動地圖頁', () => {
  // @scenario F-1
  test('F-1 地圖渲染：Leaflet 容器 + 圖磚實際載入、標題含「的生日應援地圖」、attribution 連結存在', async ({
    page,
  }) => {
    await gotoFirstMap(page);

    await expect(
      page.locator('.leaflet-container'),
      'Leaflet 地圖容器應渲染，但找不到 .leaflet-container'
    ).toBeVisible({ timeout: 15_000 });

    // 圖磚要「實際載入」——容器在圖磚掛掉時仍會存在，所以驗至少一張 .leaflet-tile 的 naturalWidth>0
    await expect
      .poll(
        () =>
          page
            .locator('.leaflet-tile')
            .evaluateAll(
              (imgs) => imgs.filter((i) => (i as HTMLImageElement).naturalWidth > 0).length
            ),
        {
          timeout: 15_000,
          message:
            '地圖圖磚應實際載入（至少一張 .leaflet-tile 的 naturalWidth>0）；為 0 代表圖磚掛掉、只剩空容器',
        }
      )
      .toBeGreaterThan(0);

    // 標題「[藝人]的生日應援地圖」——灌進全域 header（useHeaderTitleStore），非頁內 h1
    await expect(
      page.getByText(/的生日應援地圖/),
      'header 應顯示「[藝人]的生日應援地圖」標題，但找不到'
    ).toBeVisible({ timeout: 15_000 });

    // attribution：Leaflet / OpenStreetMap / CARTO
    const attribution = page.locator('.leaflet-control-attribution');
    await expect(
      attribution.locator('a[href*="openstreetmap.org"]'),
      'attribution 應有 OpenStreetMap 連結'
    ).toBeVisible();
    await expect(
      attribution.locator('a[href*="carto.com"]'),
      'attribution 應有 CARTO 連結'
    ).toBeVisible();
  });

  // @scenario F-6
  test('F-6 bottom sheet 卡片 → 活動頁：第一張活動卡 href 為 /event/，點入後活動頁標題與卡片一致', async ({
    page,
  }) => {
    await gotoFirstMap(page);

    const sheet = page.getByTestId('bottom-sheet');
    await expect(sheet, 'bottom sheet 應出現，但找不到').toBeVisible({ timeout: 15_000 });

    const firstCard = sheet.locator('a[href^="/event/"]').first();
    await expect(firstCard, 'bottom sheet 應有活動卡連結 a[href^="/event/"]，但找不到').toBeVisible(
      {
        timeout: 15_000,
      }
    );

    const href = await firstCard.getAttribute('href');
    expect(href, `bottom sheet 卡片 href 應為 /event/…，實際：${href}`).toMatch(/^\/event\/.+/);

    // 卡片標題取自 aria-label「前往 {活動名} 活動詳情」
    const label = (await firstCard.getAttribute('aria-label')) ?? '';
    const cardTitle = label
      .replace(/^前往\s*/, '')
      .replace(/\s*活動詳情$/, '')
      .trim();

    await firstCard.click();
    await expect(page, '點卡片後應進入 /event/[slug]').toHaveURL(/\/event\/.+/);
    if (cardTitle) {
      await expect(
        page.getByRole('heading', { level: 2 }).first(),
        `活動頁標題應與 bottom sheet 卡片一致（卡片為「${cardTitle}」）`
      ).toContainText(cardTitle, { timeout: 15_000 });
    }
  });

  // @scenario F-9 partial: 產品無「我的位置」按鈕，geolocation 於載入時自動請求；被拒時靜默降級（不顯示提示訊息）。
  // 這裡驗「被拒不崩潰、地圖與 bottom sheet 仍正常、無未捕捉錯誤」。原 spec 的「點按鈕→出現提示訊息」與現行產品不符（已回報 PM）。
  test('F-9 地理位置被拒：載入時自動定位被拒，頁面不崩潰、無未捕捉 JS 錯誤、地圖與清單仍正常', async ({
    browser,
  }) => {
    // 全新 context 不 grant geolocation → 載入時的自動定位請求會被拒
    const context = await browser.newContext();
    const page = await context.newPage();
    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    try {
      await page.goto('/');
      const href = await page.locator('a[href^="/map/"]').first().getAttribute('href');
      expect(href, '首頁應有地圖連結以取得 /map 路由').toBeTruthy();
      await page.goto(new URL(href!, page.url()).toString());

      await expect(
        page.locator('.leaflet-container'),
        '定位被拒時，地圖容器仍應正常渲染（不得因定位失敗而壞頁）'
      ).toBeVisible({ timeout: 15_000 });
      await expect(
        page.getByTestId('bottom-sheet'),
        '定位被拒時，bottom sheet 仍應正常顯示'
      ).toBeVisible({ timeout: 15_000 });

      await page.waitForTimeout(1500); // 等自動定位請求走完 + 可能的錯誤浮現
      // 排除與 geolocation 無關的既有雜訊：
      //  - ResizeObserver loop（瀏覽器常見無害警告）
      //  - React #418 hydration mismatch：實測地圖頁「正常載入（未拒絕定位）」也會出現、且 Sentry 已在追，
      //    是地圖頁本身的 SSR/CSR 不一致，非 geolocation 造成。已列入 HANDOFF 給工程師另修。
      //    這條 F-9 只驗「geolocation 被拒不會『新增』崩潰」，不該被這個既有錯誤誤觸。
      const geoRelated = pageErrors.filter(
        (e) => !/ResizeObserver/.test(e) && !/#418|errors\/418|hydrat/i.test(e)
      );
      expect(
        geoRelated,
        `定位被拒不應產生（與定位相關的）未捕捉 JS 錯誤（靜默降級即可），實際捕捉到：\n${geoRelated.join('\n') || '(無)'}`
      ).toEqual([]);
    } finally {
      await context.close();
    }
  });

  // @scenario F-2 adapted: marker 按「場地」聚合（多活動同場地共用一個 marker），故 marker 數 = 不重複場地數 ≤ 活動數 N，
  // 非原 spec 的「= N」。此處驗「marker 有渲染(>0) 且不超過活動數」。
  test('F-2 marker 數量：地圖 marker 應渲染（> 0）且不超過活動數 N（marker 按場地聚合）', async ({
    page,
  }) => {
    await gotoFirstMap(page);
    await expect(page.locator('.leaflet-container'), '地圖容器應渲染').toBeVisible({
      timeout: 15_000,
    });

    // 讀 bottom sheet 的「N 個生日應援」
    const countText =
      (await page
        .getByText(/\d+ 個生日應援/)
        .first()
        .textContent()) ?? '';
    const n = Number(countText.match(/(\d+)\s*個生日應援/)?.[1] ?? '0');
    expect(n, `應能讀到「N 個生日應援」的活動數，實際文字：「${countText}」`).toBeGreaterThan(0);

    // marker 需真實 viewport 才渲染，故 poll 等它出現
    let markerCount = 0;
    await expect
      .poll(async () => (markerCount = await page.locator('.leaflet-marker-icon').count()), {
        timeout: 20_000,
        message: '地圖應渲染出至少一個 marker（.leaflet-marker-icon）；為 0 代表 marker 沒畫出來',
      })
      .toBeGreaterThan(0);

    expect(
      markerCount,
      `marker 數(${markerCount}) 應 ≤ 活動數 N(${n})——marker 按場地聚合（多活動同場地共用一個 marker、或聚合成 cluster），不該超過活動數`
    ).toBeLessThanOrEqual(n);
  });

  // @scenario F-3 adapted: 點 marker 的回應依「單/多活動」而不同——單活動→浮出活動卡；多活動/聚合→放大地圖（marker 數改變）或篩選 bottom sheet。
  // 此處驗「點下去有可觀察的回應、不無反應」；若浮出單一活動卡，再驗其連結與關閉。
  test('F-3 marker 點擊：點一個 marker 應有回應（浮出活動卡 / 放大地圖 / 篩選清單），不得無反應', async ({
    page,
  }) => {
    await gotoFirstMap(page);
    await expect(page.locator('.leaflet-container'), '地圖容器應渲染').toBeVisible({
      timeout: 15_000,
    });

    const markers = page.locator('.leaflet-marker-icon');
    await expect
      .poll(() => markers.count(), { timeout: 20_000, message: '地圖應至少有一個 marker 可點' })
      .toBeGreaterThan(0);

    const before = await markers.count();
    const singleCardClose = page.getByRole('button', { name: '關閉', exact: true });
    const locationFilterChip = page.getByRole('button', { name: '清除地點篩選' });

    await markers.first().click(); // 真滑鼠點擊，觸發 Leaflet 事件（DOM .click() 不會觸發）

    // 回應三選一：浮出單一活動卡 / bottom sheet 依地點篩選 / 地圖放大（marker 數改變）
    await expect
      .poll(
        async () => {
          const hasCard = await singleCardClose.isVisible().catch(() => false);
          const hasFilter = await locationFilterChip.isVisible().catch(() => false);
          const after = await markers.count();
          return hasCard || hasFilter || after !== before;
        },
        {
          timeout: 10_000,
          message:
            '點 marker 後應有可觀察的回應（浮出活動卡 / 出現地點篩選 / 地圖放大出更多 marker），不得毫無反應',
        }
      )
      .toBe(true);

    // 若浮出「單一活動卡」，進一步驗內容 + 關閉（此時 bottom sheet 已被卡片取代）
    if (await singleCardClose.isVisible().catch(() => false)) {
      await expect(
        page.locator('a[aria-label^="前往"]').first(),
        '單一活動卡應有指向 /event/ 的連結'
      ).toHaveAttribute('href', /^\/event\/.+/);
      await singleCardClose.click();
      await expect(singleCardClose, '點關閉鈕後單一活動卡應消失').toBeHidden();
    }
  });
});
