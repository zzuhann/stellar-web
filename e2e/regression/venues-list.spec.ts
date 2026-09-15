import { test, expect, type Page } from '@playwright/test';
import { firstCard } from '../helpers/cards';
import { expectImageLoaded } from '../helpers/images';

/**
 * 場地列表頁 /venues 篩選與排序。
 *
 * 選擇器慣例：
 * - 地區 chip 沒有專屬的可存取容器名稱，因此以「全部」這顆永遠存在的 chip 當錨點取得地區列，
 *   再動態抓「全部」以外的地區，不寫死地名清單（原 :41 的地名 regex 已移除）。
 *   → 已在 HANDOFF 建議工程師替地區列補 role="group" aria-label="地區篩選"。
 * - 排序在 role="group" aria-label="場地排序方式" 內，預設排序改為動態讀當前 aria-pressed 的那顆
 *   （原 :80 的「預設 = 最多生咖數」假設已移除）。
 */

const resultCount = (page: Page) => page.getByText(/找到 \d+ 個場地/);

function parseCount(text: string | null): number {
  const m = text?.match(/找到 (\d+) 個場地/);
  return m ? Number(m[1]) : NaN;
}

/** 以「全部」chip 為錨點取得整個地區篩選列 */
const regionRow = (page: Page) =>
  page.getByRole('button', { name: '全部', exact: true }).locator('..');

test.describe('場地列表 — 篩選與排序', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/venues');
    await expect(
      page.getByRole('region', { name: '場地列表' }),
      '場地列表區塊(role=region aria-label="場地列表")應載入，但等待逾時仍未出現'
    ).toBeVisible({ timeout: 15_000 });
  });

  // @scenario D-2
  test('場地列表：地區 tag 一次只能選一個（選了新地區後，原本的「全部」應自動取消選中）', async ({
    page,
  }) => {
    const allChip = page.getByRole('button', { name: '全部', exact: true });
    // 動態抓「全部」以外的第一顆地區 chip，不寫死地名
    const otherChip = regionRow(page).getByRole('button').filter({ hasNotText: '全部' }).first();

    const chipCount = await regionRow(page).getByRole('button').count();
    expect(
      chipCount,
      '地區列除了「全部」外應至少還有一個地區 chip，才能驗證單選互斥'
    ).toBeGreaterThan(1);

    const otherName = (await otherChip.textContent())?.trim() ?? '(未知地區)';

    await expect(allChip, '初始狀態下「全部」地區應為選中(aria-pressed=true)').toHaveAttribute(
      'aria-pressed',
      'true'
    );

    await otherChip.click();
    await expect(
      otherChip,
      `點選地區「${otherName}」後，它應變為選中(aria-pressed=true)`
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      allChip,
      `選了「${otherName}」後，「全部」應取消選中(aria-pressed=false)，證明地區為單選互斥`
    ).toHaveAttribute('aria-pressed', 'false');

    const pressedCount = await regionRow(page).locator('button[aria-pressed="true"]').count();
    expect(
      pressedCount,
      '地區列任一時刻應恰好只有一顆 chip 被選中(單選)，實際被選中的數量不對'
    ).toBe(1);
  });

  // @scenario D-3
  test('場地列表：套用「20人以下」人數級距後，結果數不會變多，且每張卡片都標示該級距', async ({
    page,
  }) => {
    const baseCount = parseCount(await resultCount(page).textContent());
    expect(
      baseCount,
      '「全部地區 + 不限人數」時結果數應可解析且 > 0，否則後續交集無從比較'
    ).toBeGreaterThan(0);

    await page.getByRole('button', { name: '空間人數' }).click();
    await page.getByRole('menuitemradio', { name: '20人以下' }).click();

    await expect
      .poll(async () => parseCount(await resultCount(page).textContent()), {
        message: '套用人數級距後的結果數應 <= 未篩選前的結果數（篩選是縮小，不是放寬）',
      })
      .toBeLessThanOrEqual(baseCount);

    const cards = page.getByRole('region', { name: '場地列表' }).getByRole('link');
    const cardCount = await cards.count();
    if (cardCount > 0) {
      for (let i = 0; i < cardCount; i++) {
        await expect(
          cards.nth(i),
          `套用「20人以下」後，第 ${i + 1} 張卡片應標示「20人以下」，代表人數過濾確實生效`
        ).toContainText('20人以下');
      }
    } else {
      await expect(
        page.getByText('沒有符合條件的場地'),
        '若沒有符合「20人以下」的場地，應顯示空狀態文案，但找不到'
      ).toBeVisible();
    }
  });

  // @scenario D-4
  test('場地列表：先選特定地區再疊人數級距，兩個條件應同時生效（交集），卡片同時符合地區與人數', async ({
    page,
  }) => {
    const baseCount = parseCount(await resultCount(page).textContent());
    expect(baseCount, '初始「全部地區」結果數應可解析且 > 0').toBeGreaterThan(0);

    // 1) 動態選一個「全部」以外的地區
    const otherChip = regionRow(page).getByRole('button').filter({ hasNotText: '全部' }).first();
    const regionName = (await otherChip.textContent())?.trim() ?? '';
    await otherChip.click();

    await expect
      .poll(async () => parseCount(await resultCount(page).textContent()), {
        message: `選地區「${regionName}」後結果數應 <= 全部地區的結果數（地區篩選會縮小範圍）`,
      })
      .toBeLessThanOrEqual(baseCount);
    const regionOnlyCount = parseCount(await resultCount(page).textContent());

    // 2) 在地區之上再疊人數級距
    await page.getByRole('button', { name: '空間人數' }).click();
    await page.getByRole('menuitemradio', { name: '20人以下' }).click();

    await expect
      .poll(async () => parseCount(await resultCount(page).textContent()), {
        message: `在地區「${regionName}」之上再疊「20人以下」，結果數應 <= 只選地區時的結果數`,
      })
      .toBeLessThanOrEqual(regionOnlyCount);

    // 3) 疊人數不應清掉地區選擇 → 地區 chip 仍為選中，證明兩條件「同時」生效
    await expect(
      otherChip,
      `疊上人數級距後，地區「${regionName}」應仍為選中(aria-pressed=true)，代表地區與人數是交集而非互相取代`
    ).toHaveAttribute('aria-pressed', 'true');

    // 4) 若有卡片，每張都應同時含「該地區名稱」與「20人以下」
    const cards = page.getByRole('region', { name: '場地列表' }).getByRole('link');
    const cardCount = await cards.count();
    for (let i = 0; i < cardCount; i++) {
      await expect(
        cards.nth(i),
        `交集後第 ${i + 1} 張卡片應標示地區「${regionName}」，代表地區條件仍生效`
      ).toContainText(regionName);
      await expect(
        cards.nth(i),
        `交集後第 ${i + 1} 張卡片應標示「20人以下」，代表人數條件也同時生效`
      ).toContainText('20人以下');
    }
  });

  // @scenario D-5
  // 動態讀預設、切「非預設」那顆、只驗 URL 有沒有 sort 參數（不寫死是哪個值）：
  // 這樣不管預設是「最新上架」還是「最多生咖數」都成立。2026-07 PR#122 把預設改成 newest 後，
  // 「切到非預設 → ?sort=eventCount」；未來再翻也不會壞。
  test('場地列表：切到非預設排序後網址應帶 sort 參數，切回預設後該參數應移除', async ({ page }) => {
    const sortGroup = page.getByRole('group', { name: '場地排序方式' });
    const defaultName =
      (await sortGroup.locator('button[aria-pressed="true"]').textContent())?.trim() ?? '';
    expect(defaultName, '排序群組應有一顆預設被選中的按鈕，但讀不到').not.toBe('');

    await expect(page, '預設排序狀態下，網址不應帶 sort 參數（乾淨網址）').not.toHaveURL(
      /[?&]sort=/
    );

    // 先讀出「非預設」那顆的名稱，再用「名稱」鎖定穩定 locator。
    // 不能用 button[aria-pressed="false"] 當 selector 去斷言——點下去後該屬性會翻，
    // 這個動態 locator 會改指向另一顆（預設那顆），造成誤判。
    const otherName =
      (await sortGroup.locator('button[aria-pressed="false"]').first().textContent())?.trim() ?? '';
    expect(otherName, '排序群組應有一顆非預設按鈕，但讀不到').not.toBe('');
    const otherBtn = sortGroup.getByRole('button', { name: otherName });
    await otherBtn.click();
    await expect(
      otherBtn,
      `點非預設排序「${otherName}」後它應為選中(aria-pressed=true)`
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page,
      `切到非預設排序「${otherName}」後，網址應帶 sort 參數（排序狀態要能反映在網址上、可分享 / 可還原）`
    ).toHaveURL(/[?&]sort=/);
    await expect(resultCount(page), '切換排序後清單仍應正常渲染出結果數').toBeVisible();

    // 切回預設排序，網址應移除 sort 參數
    await sortGroup.getByRole('button', { name: defaultName }).click();
    await expect(
      page,
      `切回預設排序「${defaultName}」後，網址應移除 sort 參數（回到乾淨網址）`
    ).not.toHaveURL(/[?&]sort=/);
  });

  // @scenario D-1, D-10
  test('場地列表：清單載入後，第一張卡片圖片應非破圖，點擊應進入該場地詳情頁', async ({ page }) => {
    const card = firstCard(page.getByRole('region', { name: '場地列表' }));
    await expect(card, '場地列表應至少有一張卡片，但找不到').toBeVisible();

    await expectImageLoaded(card.locator('img').first(), '場地列表第一張卡片圖片');

    const href = await card.getAttribute('href');
    expect(href, `場地卡片連結應指向 /venues/[id]，實際為：${href}`).toMatch(/^\/venues\/.+/);

    await card.click();
    await expect(page, '點卡片後網址應變成 /venues/[id]').toHaveURL(/\/venues\/.+/);
    await expect(
      page.getByRole('region', { name: '基本資訊' }),
      '場地詳情頁應顯示「基本資訊」區塊，但載入逾時仍未出現'
    ).toBeVisible({ timeout: 15_000 });
  });

  // @scenario D-7
  test('場地列表：後端回傳空結果時，應顯示「沒有符合條件的場地」空狀態而非壞頁或空白', async ({
    page,
  }) => {
    // 攔截「場地列表」API（/venues，非 /venues/[id]），強制回空陣列，穩定重現空狀態、不依賴真實資料的空窗。
    // 以「非預設」排序 ?sort=eventCount 進頁，讓 client 端一定發出查詢：預設已是 newest（PR#122），
    // 用預設值會直接吃 SSR initialData、不觸發 client fetch，mock 就攔不到。非預設值才會 client fetch。
    await page.route(
      (url) => url.pathname.endsWith('/venues'),
      async (route) => {
        const req = route.request();
        // 只攔 API 的 XHR/fetch；放行頁面本身的 document 導覽，否則整頁 HTML 會被換成 JSON、頁面壞掉
        if (req.resourceType() === 'document' || req.method() !== 'GET') return route.fallback();
        await route.fulfill({ json: { venues: [] } });
      }
    );

    await page.goto('/venues?sort=eventCount');
    await expect(
      page.getByRole('region', { name: '場地列表' }),
      '場地列表區塊應載入，但等待逾時仍未出現'
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.getByText('沒有符合條件的場地'),
      '列表為空時應顯示「沒有符合條件的場地」空狀態文案，但找不到（可能空狀態沒渲染或頁面壞掉）'
    ).toBeVisible({ timeout: 15_000 });
  });
});
