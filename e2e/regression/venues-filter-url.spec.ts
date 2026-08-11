import { test, expect, type Page } from '@playwright/test';

/**
 * 場地列表篩選狀態持久化到網址（D-6）。
 *
 * 沿革：這條原本是 known-issue（2026-07-21：地區/人數不進 URL，重整/分享/上一頁會遺失）。
 * 2026-08 的部署把 region/capacity/sort/search/page 全改用 useQueryState → 篩選狀態已寫進網址、
 * D-6 已修復，故此測試從 known-issues 搬回 regression（斷言「正確且已運作」的行為，應保持綠）。
 *
 * 選擇器慣例：排序點「非預設」那顆（預設是最新上架，點了不產生 sort 參數；非預設才會）。
 * **動態讀非預設排序按鈕的名稱**，不寫死 label——排序 label 曾從「最多生咖數」改成「最多收錄生咖」，
 * 寫死會壞。test 2~4 用「app 產生的網址 → 重整/上一頁 → 檢查 UI 已選」，不寫死參數名稱。
 */

const REGION = '台北';
const CAPACITY_LABEL = '40-60人';

const listRegion = (page: Page) => page.getByRole('region', { name: '場地列表' });
const sortGroup = (page: Page) => page.getByRole('group', { name: '場地排序方式' });

async function gotoVenues(page: Page) {
  await page.goto('/venues');
  await expect(listRegion(page), '場地列表應載入').toBeVisible({ timeout: 15_000 });
}

/**
 * 套用 台北 + 40-60人 + 非預設排序；回傳「非預設排序的名稱」給還原斷言用。
 */
async function applyFilters(page: Page): Promise<string> {
  await page.getByRole('button', { name: REGION, exact: true }).click();
  await page.getByRole('button', { name: '空間人數' }).click();
  await page.getByRole('menuitemradio', { name: CAPACITY_LABEL }).click();

  // 動態讀「非預設」排序按鈕（aria-pressed=false 的那顆），用名稱鎖定後點擊
  const sortName =
    (await sortGroup(page).locator('button[aria-pressed="false"]').first().textContent())?.trim() ??
    '';
  expect(sortName, '排序群組應有一顆非預設按鈕可點').not.toBe('');
  await sortGroup(page).getByRole('button', { name: sortName }).click();
  return sortName;
}

/** 斷言三個篩選 UI 都呈現「已選」狀態（sortName = applyFilters 點的那顆） */
async function expectFiltersSelected(page: Page, sortName: string) {
  await expect(
    page.getByRole('button', { name: REGION, exact: true }),
    `地區「${REGION}」chip 應為已選(aria-pressed=true)——不是的話代表地區在還原後遺失`
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('button', { name: '空間人數' }),
    `人數下拉應顯示已選的「${CAPACITY_LABEL}」——不是的話代表人數在還原後遺失`
  ).toContainText(CAPACITY_LABEL);
  await expect(
    sortGroup(page).getByRole('button', { name: sortName }),
    `排序「${sortName}」應為已選(aria-pressed=true)——不是的話代表排序在還原後遺失`
  ).toHaveAttribute('aria-pressed', 'true');
}

test.describe('場地列表 — 篩選狀態持久化到網址（D-6）', () => {
  // @scenario D-6
  test('場地列表：套用地區 + 人數 + 排序後，網址應同時帶上這三個條件', async ({ page }) => {
    await gotoVenues(page);
    await applyFilters(page);

    // 三個條件都應反映在網址上（sort 值 eventCount 是 API 契約，label 才會漂移）
    await expect(page, '切非預設排序後網址應帶 sort 參數').toHaveURL(/[?&]sort=eventCount/);
    const url = decodeURIComponent(page.url());
    expect(url, `網址應帶地區「${REGION}」，實際：${url}`).toContain(REGION);
    expect(url, `網址應帶人數級距「40-60」，實際：${url}`).toMatch(/40-?60/);
  });

  // @scenario D-6
  test('場地列表：用 app 產生的網址重新開頁（deep-link），三個篩選 UI 應還原為已選狀態', async ({
    page,
    context,
  }) => {
    await gotoVenues(page);
    const sortName = await applyFilters(page);

    const sharedUrl = page.url();
    const fresh = await context.newPage();
    await fresh.goto(sharedUrl);
    await expect(
      fresh.getByRole('region', { name: '場地列表' }),
      '用分享網址開啟的新頁面應載入場地列表'
    ).toBeVisible({ timeout: 15_000 });
    await expectFiltersSelected(fresh, sortName);
    await fresh.close();
  });

  // @scenario D-6
  test('場地列表：套用篩選後重整頁面，三個篩選條件應保留', async ({ page }) => {
    await gotoVenues(page);
    const sortName = await applyFilters(page);
    await page.reload();
    await expect(listRegion(page), '重整後場地列表應載入').toBeVisible({ timeout: 15_000 });
    await expectFiltersSelected(page, sortName);
  });

  // @scenario D-6
  test('場地列表：套用篩選 → 點進場地詳情 → 按上一頁，篩選條件應保留', async ({ page }) => {
    await gotoVenues(page);
    const sortName = await applyFilters(page);

    const card = listRegion(page).getByRole('link').first();
    if ((await card.count()) > 0) {
      await card.click();
      await expect(page, '點卡片後應進入場地詳情頁').toHaveURL(/\/venues\/.+/);
      await page.goBack();
      await expect(listRegion(page), '按上一頁後應回到場地列表').toBeVisible({ timeout: 15_000 });
    } else {
      await page.reload();
      await expect(listRegion(page), '重整後場地列表應載入').toBeVisible({ timeout: 15_000 });
    }
    await expectFiltersSelected(page, sortName);
  });
});
