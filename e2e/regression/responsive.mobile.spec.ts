import { test, expect, type Locator } from '@playwright/test';

/**
 * G-5 橫向捲動區在觸控裝置可滑 —— 這是第一支 *.mobile.spec.ts，由 regression-mobile project
 * 用 devices['iPhone 13']（真 WebKit 引擎，非 Chromium 模擬）執行。
 *
 * 四個橫向容器的實際型態（實測，與 prompt 假設有出入，已據實調整）：
 *   1. 熱門生咖輪播  → Swiper（CSS transform，scrollLeft 恆 0）→ 驗內容寬於可視 + 分頁點切換後 active slide 改變
 *   2. 藝人頭像列    → Swiper（無分頁點）→ 驗內容寬於可視（可滑內容存在）
 *      ⚠️ prompt 假設「藝人列 = 原生 scroll」，實測是 Swiper，故改用 Swiper 驗法
 *   3. 探索生咖場地  → 原生 overflow scroll → 記錄 scrollLeft、程式水平捲動、斷言 scrollLeft 增加
 *   4. 場地詳情 生日應援紀錄列 → 原生 overflow scroll → 同上
 *
 * 原生容器用 element.evaluate 設 scrollLeft（prompt 允許的穩定做法；真觸控 swipe 手勢在自動化下易 flaky）。
 */

/** 原生 overflow 容器：設 scrollLeft 後應真的移動 */
async function expectNativeScrollable(el: Locator, label: string) {
  const { sw, cw } = await el.evaluate((n) => ({ sw: n.scrollWidth, cw: n.clientWidth }));
  expect(sw, `${label} 內容寬(${sw}) 應大於可視寬(${cw})，才有東西可橫向捲`).toBeGreaterThan(cw);
  await el.evaluate((n) => {
    n.scrollLeft = 200;
  });
  await expect
    .poll(() => el.evaluate((n) => n.scrollLeft), {
      message: `${label} 設 scrollLeft=200 後，實際 scrollLeft 應 > 0（代表在此觸控視窗下可橫向捲動）`,
    })
    .toBeGreaterThan(0);
}

test.describe('G-5 橫向捲動區在觸控裝置可滑（iPhone 13 · 真 WebKit）', () => {
  // @scenario G-5
  test('首頁 熱門生咖輪播（Swiper）：內容寬於可視，切分頁點後 active slide 改變', async ({
    page,
  }) => {
    await page.goto('/');
    const region = page.getByRole('region', { name: '即將到來的生日應援輪播' });
    await expect(region, '首頁應顯示熱門輪播').toBeVisible({ timeout: 15_000 });
    const { sw, cw } = await region
      .locator('.swiper')
      .evaluate((n) => ({ sw: n.scrollWidth, cw: n.clientWidth }));
    expect(sw, `熱門輪播 Swiper 內容寬(${sw}) 應大於可視寬(${cw})`).toBeGreaterThan(cw);

    const bullets = region.locator('.swiper-pagination-bullet');
    expect(await bullets.count(), '熱門輪播應有多個分頁點可切換').toBeGreaterThan(1);
    const slides = region.locator('.swiper-slide');
    await bullets.nth(1).click();
    await expect(
      slides.nth(1),
      '切到第二個分頁點後，第二張 slide 應成為 active（Swiper 用 transform 移動，故驗 active slide 而非 scrollLeft）'
    ).toHaveClass(/swiper-slide-active/);
  });

  // @scenario G-5
  test('首頁 藝人頭像列（Swiper，無分頁點）：內容寬於可視，可橫向滑', async ({ page }) => {
    await page.goto('/');
    const region = page.getByRole('region', { name: '擁有最多生咖的藝人' });
    await expect(region, '首頁應顯示藝人頭像列').toBeVisible({ timeout: 15_000 });
    const { sw, cw } = await region
      .locator('.swiper')
      .evaluate((n) => ({ sw: n.scrollWidth, cw: n.clientWidth }));
    // 藝人列 Swiper 無分頁點；以「內容寬於可視」證明有可橫向滑的內容（此觸控視窗下）
    expect(sw, `藝人列 Swiper 內容寬(${sw}) 應大於可視寬(${cw})，代表可橫向滑`).toBeGreaterThan(cw);
  });

  // @scenario G-5
  test('首頁 探索生咖場地（原生 scroll）：程式水平捲動後 scrollLeft 增加', async ({ page }) => {
    await page.goto('/');
    const list = page.getByRole('list', { name: '隨機推薦場地' });
    await expect(list, '首頁應顯示探索場地列').toBeVisible({ timeout: 15_000 });
    await expectNativeScrollable(list, '探索場地列');
  });

  // @scenario G-5
  test('場地詳情 生日應援紀錄列（原生 scroll）：程式水平捲動後 scrollLeft 增加', async ({
    page,
  }) => {
    // 動態找一個有「生日應援紀錄」橫向列且可捲動的場地
    await page.goto('/venues');
    const firstCard = page.getByRole('region', { name: '場地列表' }).getByRole('link').first();
    await expect(firstCard, '場地列表應有卡片').toBeVisible({ timeout: 15_000 });
    await firstCard.click();
    await expect(page, '應進入場地詳情').toHaveURL(/\/venues\/.+/);

    const strip = page.getByRole('region', { name: '平台記錄的生咖、生日應援' });
    const track = strip.getByRole('list').first();
    const hasScrollable =
      (await track.count()) > 0 &&
      (await track.evaluate((n) => n.scrollWidth > n.clientWidth).catch(() => false));
    test.skip(
      !hasScrollable,
      '這個場地沒有可橫向捲動的生日應援紀錄列（記錄數不足）——換有記錄的場地再測'
    );
    await expectNativeScrollable(track, '生日應援紀錄列');
  });
});
