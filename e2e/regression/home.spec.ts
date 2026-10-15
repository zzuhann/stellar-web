import { test, expect, type Locator } from '@playwright/test';

/**
 * 首頁 B 系列。未登入、對正式站唯讀。
 *
 * 重要前提：首頁「探索生咖場地」卡片順序在不同載入間會變動，故所有斷言只驗「結構與數量下限」，
 * 不依賴特定店名或卡片順序。
 *
 * lazy loading 處理：站上大量圖片為 lazy（首頁 34 張中 30 張 lazy）。做法是——
 *   (1) 先把該輪播區塊 scrollIntoViewIfNeeded 捲進頁面視窗；
 *   (2) 只挑「水平方向真的落在該輪播可視範圍內」的圖片（用 boundingBox 交集判斷），略過被 Swiper/
 *       overflow 裁切在視窗外、可能尚未載入的圖，避免 false negative；
 *   (3) 對挑中的圖用 expect.poll 等 naturalWidth > 0（poll 會重試，等於等待圖片 load 完成）。
 */

/** 檢查某捲動容器「當前可見範圍內」的圖片都已載入（naturalWidth > 0） */
async function assertVisibleImagesLoaded(imagesScope: Locator, viewport: Locator, label: string) {
  await viewport.scrollIntoViewIfNeeded();
  const vb = await viewport.boundingBox();
  const imgs = imagesScope.locator('img');
  const total = await imgs.count();
  let checked = 0;
  for (let i = 0; i < total; i++) {
    const img = imgs.nth(i);
    const box = await img.boundingBox();
    if (!box || !vb) continue;
    const centerX = box.x + box.width / 2;
    // 只檢查中心點落在容器水平可視範圍內的圖（其餘可能是 lazy 尚未載入，略過避免誤判）
    if (centerX < vb.x || centerX > vb.x + vb.width) continue;
    checked++;
    await expect
      .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth), {
        timeout: 10_000,
        message: `${label} 第 ${i + 1} 張可見圖片的 naturalWidth 應 > 0（等待 lazy 載入後仍為 0 代表破圖）`,
      })
      .toBeGreaterThan(0);
  }
  expect(
    checked,
    `${label} 應至少檢查到 1 張可見圖片，但一張都沒挑到（選擇器可能失效）`
  ).toBeGreaterThan(0);
}

test.describe('首頁 — B 系列', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ── B-1 熱門生咖輪播 ──────────────────────────────────────
  // @scenario B-1
  // 註：此輪播是 Swiper（transform 移動，非原生 scrollLeft），且未開 autoplay。
  // 「點分頁點後移動」用語意斷言驗證——點第二個分頁點後，第二張 slide 成為 .swiper-slide-active、
  // 第一張不再 active。這是「點擊應到達的確定狀態」，不受 autoplay 干擾，也證明點擊真的生效
  // （比驗 transform 有沒有變更精確：transform 只證明有東西動了，證不了是這次點擊到達了目標）。
  test('B-1 熱門生咖輪播：Swiper 內容寬於可視、分頁點 > 1、點第二個分頁點後第二張 slide 成為 active、第一張卡連到 /event/', async ({
    page,
  }) => {
    const region = page.getByRole('region', { name: '即將到來的生日應援輪播' });
    await expect(region, '首頁應顯示熱門生咖輪播區塊，但等待逾時').toBeVisible({ timeout: 15_000 });
    await region.scrollIntoViewIfNeeded();

    const swiper = region.locator('.swiper');
    const { scrollWidth, clientWidth } = await swiper.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(
      scrollWidth,
      `Swiper 內容寬(${scrollWidth}px)應大於可視寬(${clientWidth}px)，代表有多張卡可以滑動`
    ).toBeGreaterThan(clientWidth);

    const bullets = region.locator('.swiper-pagination-bullet');
    const bulletCount = await bullets.count();
    expect(bulletCount, `分頁點數量應 > 1（實際 ${bulletCount}）`).toBeGreaterThan(1);

    // 語意斷言：點第二個分頁點 → 第二張 slide 成為 active（點擊應到達的確定狀態，不受 autoplay 干擾）。
    const slides = region.locator('.swiper-slide');
    await expect(
      slides.nth(0),
      '初始狀態第一張 slide 應為 active(.swiper-slide-active)'
    ).toHaveClass(/swiper-slide-active/);
    await bullets.nth(1).click();
    await expect(
      slides.nth(1),
      '點第二個分頁點後，第二張 slide 應成為 active(.swiper-slide-active) —— 這是點擊應到達的確定狀態'
    ).toHaveClass(/swiper-slide-active/);
    await expect(
      slides.nth(0),
      '第二張成為 active 後，第一張 slide 不應再是 active（證明 active 確實因點擊而移動，非原本就在該狀態）'
    ).not.toHaveClass(/swiper-slide-active/);

    const firstCard = region.locator('a[href^="/event/"]').first();
    await expect(firstCard, '第一張活動卡的 href 應以 /event/ 開頭').toHaveAttribute(
      'href',
      /^\/event\/.+/
    );
  });

  // ── B-2 熱門卡片圖片不破圖 ────────────────────────────────
  // @scenario B-2
  test('B-2 熱門卡片圖片：輪播中可見卡片的圖片 naturalWidth > 0，且每張 img 都有非空 alt', async ({
    page,
  }) => {
    const region = page.getByRole('region', { name: '即將到來的生日應援輪播' });
    await expect(region, '首頁應顯示熱門生咖輪播區塊，但等待逾時').toBeVisible({ timeout: 15_000 });

    // 每張卡片圖都要有非空 alt（alt 是 DOM 屬性，與是否載入無關，全部檢查）
    const imgs = region.locator('img');
    const total = await imgs.count();
    expect(total, '熱門輪播應至少有一張卡片圖片').toBeGreaterThan(0);
    for (let i = 0; i < total; i++) {
      const alt = await imgs.nth(i).getAttribute('alt');
      expect(alt?.trim(), `熱門輪播第 ${i + 1} 張圖片應有非空 alt`).toBeTruthy();
    }

    // 可見卡片的圖片實際載入（處理 lazy loading，見檔頭說明）
    await assertVisibleImagesLoaded(region, region.locator('.swiper'), '熱門輪播');
  });

  // ── B-3 藝人頭像列 ────────────────────────────────────────
  // @scenario B-3
  test('B-3 藝人頭像列：橫向可捲動、首項「新增生咖」→ /submit-event、其餘項 → /map/、每位藝人顯示「N 個」', async ({
    page,
  }) => {
    const region = page.getByRole('region', { name: '擁有最多生咖的藝人' });
    await expect(region, '首頁應顯示藝人頭像列區塊，但等待逾時').toBeVisible({ timeout: 15_000 });
    await region.scrollIntoViewIfNeeded();

    const { scrollWidth, clientWidth } = await region
      .locator('.swiper')
      .evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
    expect(
      scrollWidth,
      `藝人列內容寬(${scrollWidth}px)應大於可視寬(${clientWidth}px)，代表可橫向捲動`
    ).toBeGreaterThan(clientWidth);

    const links = region.getByRole('link');
    const linkCount = await links.count();
    expect(linkCount, '藝人列應至少有「新增生咖」+ 一位藝人').toBeGreaterThan(1);

    // 首項：新增生咖 → /submit-event
    const first = links.first();
    await expect(first, '藝人列第一項應為「新增生咖」入口').toContainText('新增生咖');
    await expect(first, '「新增生咖」href 應為 /submit-event').toHaveAttribute(
      'href',
      '/submit-event'
    );

    // 其餘項：href 皆為 /map/ 開頭，且顯示「N 個」活動數
    for (let i = 1; i < linkCount; i++) {
      const link = links.nth(i);
      await expect(link, `藝人列第 ${i + 1} 項 href 應以 /map/ 開頭`).toHaveAttribute(
        'href',
        /^\/map\//
      );
      await expect(link, `藝人列第 ${i + 1} 項應顯示活動數量（形如「N 個」）`).toContainText(
        /\d+\s*個/
      );
    }
  });

  // ── B-4 探索生咖場地區塊 ──────────────────────────────────
  // @scenario B-4
  test('B-4 探索生咖場地：橫向可捲動、卡片數量 >= 3、可見卡片圖片不破圖', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: '探索生咖場地' }),
      '首頁應顯示「探索生咖場地」區塊標題，但等待逾時'
    ).toBeVisible({ timeout: 15_000 });

    const list = page.getByRole('list', { name: '隨機推薦場地' });
    await expect(list, '應有「隨機推薦場地」橫向列表').toBeVisible();
    await list.scrollIntoViewIfNeeded();

    // 橫向可捲動（此列是原生 overflow 捲動，scrollWidth > clientWidth）
    const { scrollWidth, clientWidth } = await list.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(
      scrollWidth,
      `場地列內容寬(${scrollWidth}px)應大於可視寬(${clientWidth}px)，代表可橫向捲動`
    ).toBeGreaterThan(clientWidth);

    // 卡片數量 >= 3（卡片連結為 /venues/{id}，排除「查看全部場地」的 /venues）
    const cardCount = await list.locator('a[href^="/venues/"]').count();
    expect(cardCount, `探索場地卡片數量應 >= 3（實際 ${cardCount}）`).toBeGreaterThanOrEqual(3);

    // 可見卡片圖片不破圖
    await assertVisibleImagesLoaded(list, list, '探索場地');
  });

  // @scenario B-4
  test('B-4 探索生咖場地：點第一張場地卡應導向 /venues/[id]', async ({ page }) => {
    const list = page.getByRole('list', { name: '隨機推薦場地' });
    await expect(list, '應有「隨機推薦場地」橫向列表，但等待逾時').toBeVisible({ timeout: 15_000 });

    const firstCard = list.getByRole('link').first();
    await expect(firstCard, '場地列應至少有一張可點卡片').toBeVisible();
    const href = await firstCard.getAttribute('href');
    expect(href, `場地卡片連結應為 /venues/{id}，實際：${href}`).toMatch(/^\/venues\/.+/);

    await firstCard.click();
    await expect(page, '點卡片後網址應變成 /venues/[id]').toHaveURL(/\/venues\/.+/);
  });

  // @scenario B-4
  test('B-4 探索生咖場地：點「查看全部場地」應導向 /venues', async ({ page }) => {
    await page.getByRole('link', { name: '查看全部場地' }).click();
    await expect(page, '點「查看全部場地」後網址應為 /venues').toHaveURL(/\/venues$/);
    await expect(
      page.getByRole('heading', { name: '生咖、生日應援場地列表' }),
      '場地列表頁應顯示標題，但找不到'
    ).toBeVisible();
  });
});
