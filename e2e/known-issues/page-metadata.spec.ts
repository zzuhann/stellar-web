import { test, expect, type Page } from '@playwright/test';

/**
 * [KNOWN ISSUE] 部分頁面的 <title> 沿用首頁泛用標題，而非該頁專屬標題。
 *
 * 正式站觀察（2026-07-21）：
 *   /submit-event 的 <title> 是首頁泛用標題「STELLAR 台灣生咖地圖 | 生咖、生日應援活動資訊」，
 *   不是該頁專屬標題。
 * 後果：
 *   SEO 與社群分享卡片顯示錯誤（多個頁面看起來都像首頁）。
 * 正確行為：
 *   每個主要頁面都應有自己的專屬 <title>（不等於首頁泛用標題，且不是空的 / 過短）。
 * 變綠 = 工程師已替該頁補上專屬 title。
 *
 * 備註：首頁泛用標題於執行時動態讀取（goto '/' 取 title），不寫死字串，避免文案微調造成假紅/假綠。
 * /submit-event 目前預期紅；順便驗其他頁有沒有一起中。
 */

/** 需要動態解析的第一筆資料路徑（不寫死 slug / id） */
async function firstVenuePath(page: Page): Promise<string> {
  await page.goto('/venues');
  const card = page.getByRole('region', { name: '場地列表' }).getByRole('link').first();
  await expect(card, '場地列表應至少有一張卡片可取得場地路徑').toBeVisible({ timeout: 15_000 });
  return (await card.getAttribute('href')) ?? '/venues';
}

async function firstLinkPath(page: Page, hrefPrefix: string, label: string): Promise<string> {
  await page.goto('/');
  const link = page.locator(`a[href^="${hrefPrefix}"]`).first();
  await expect(link, `首頁應至少有一個 ${label} 連結 a[href^="${hrefPrefix}"]`).toBeVisible({
    timeout: 15_000,
  });
  return (await link.getAttribute('href')) ?? hrefPrefix;
}

const ROUTES: { label: string; resolve: (page: Page) => Promise<string> }[] = [
  { label: '場地列表 /venues', resolve: async () => '/venues' },
  { label: '場地詳情 /venues/[第一筆]', resolve: (page) => firstVenuePath(page) },
  { label: '活動詳情 /event/[第一筆]', resolve: (page) => firstLinkPath(page, '/event/', '活動') },
  { label: '藝人地圖 /map/[第一個藝人]', resolve: (page) => firstLinkPath(page, '/map/', '地圖') },
  { label: '舉辦活動 /submit-event', resolve: async () => '/submit-event' },
  { label: '新增藝人 /submit-artist', resolve: async () => '/submit-artist' },
  { label: '常見問題 /faq', resolve: async () => '/faq' },
  { label: '關於 /about', resolve: async () => '/about' },
];

test.describe('[KNOWN ISSUE] 主要頁面的 <title> 專屬性', () => {
  for (const { label, resolve } of ROUTES) {
    // @scenario none known-issue: 該頁 <title> 應為專屬標題，不等於首頁泛用標題、且長度 > 10。
    test(`[KNOWN ISSUE] ${label}：<title> 應為該頁專屬標題（不等於首頁泛用標題、長度 > 10）`, async ({
      page,
    }) => {
      await page.goto('/');
      const homeTitle = await page.title();
      expect(homeTitle.length, '首頁 <title> 應可正常讀取以作為比較基準').toBeGreaterThan(10);

      const target = await resolve(page);
      await page.goto(target);
      const title = await page.title();

      expect(
        title.length,
        `「${label}」(${target}) 的 <title> 太短或空白（長度 ${title.length}）："${title}"`
      ).toBeGreaterThan(10);
      expect(
        title,
        `「${label}」(${target}) 的 <title> 不應等於首頁泛用標題「${homeTitle}」——代表這頁沒設定專屬 title（SEO / 分享卡片會顯示成首頁）。實際 title："${title}"`
      ).not.toBe(homeTitle);
    });
  }
});
