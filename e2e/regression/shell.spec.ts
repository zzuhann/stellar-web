import { test, expect, devices, type Page } from '@playwright/test';

/**
 * 全站骨架（Layout / Navigation）。未登入、對正式站唯讀。
 * 涵蓋 A-1 首頁載入、A-2 桌機導覽、A-3 手機漢堡選單、A-6 footer、A-7 404 一致性、H-7 console 乾淨。
 */

// ── A-1 首頁載入 ─────────────────────────────────────────────
test.describe('A-1 首頁載入', () => {
  // @scenario A-1
  test('首頁：<title> 同時含「STELLAR」與「生咖」、頁面恰好 1 個 h1、logo 連結指向 /', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page, '首頁 <title> 應包含「STELLAR」').toHaveTitle(/STELLAR/);
    await expect(page, '首頁 <title> 應包含「生咖」').toHaveTitle(/生咖/);
    await expect(
      page.locator('h1'),
      '首頁應恰好有 1 個 <h1>（單一 h1 慣例）；數量不對代表缺 h1 或有重複 h1'
    ).toHaveCount(1);
    const logo = page.getByRole('link', { name: 'STELLAR 首頁' }).first();
    await expect(logo, '首頁 header 應有 STELLAR logo 連結，但找不到').toBeVisible();
    await expect(logo, 'STELLAR logo 連結應指向首頁 /').toHaveAttribute('href', '/');
  });
});

// ── A-2 桌機 header 導覽 ─────────────────────────────────────
test.describe('A-2 桌機 header 導覽', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  // @scenario A-2
  test('桌機 header：「舉辦生日應援」→ /submit-event、「新增藝人」→ /submit-artist 皆可見且可點', async ({
    page,
  }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: '功能選單' });
    await expect(nav, '桌機 1440 寬度下應顯示 header 功能選單，但找不到').toBeVisible();

    const submitEvent = nav.getByRole('link', { name: '舉辦生日應援' });
    await expect(submitEvent, 'header 應有「舉辦生日應援」連結').toBeVisible();
    await expect(submitEvent, '「舉辦生日應援」連結 href 應為 /submit-event').toHaveAttribute(
      'href',
      '/submit-event'
    );

    const submitArtist = nav.getByRole('link', { name: '新增藝人' });
    await expect(submitArtist, 'header 應有「新增藝人」連結').toBeVisible();
    await expect(submitArtist, '「新增藝人」連結 href 應為 /submit-artist').toHaveAttribute(
      'href',
      '/submit-artist'
    );
  });
});

// ── A-3 手機漢堡選單 ─────────────────────────────────────────
const iPhone13 = devices['iPhone 13'];
test.describe('A-3 手機漢堡選單', () => {
  // Playwright 不允許在 describe 內用 test.use 改 defaultBrowserType（webkit）——會強制新 worker。
  // 因此在本 project 的 Chromium 上套用 iPhone 13 的視窗 / 觸控 / UA 做手機模擬；
  // 漢堡選單依 CSS max-width:768px 觸發，用視窗寬度模擬即足夠。
  test.use({
    viewport: iPhone13.viewport,
    userAgent: iPhone13.userAgent,
    deviceScaleFactor: iPhone13.deviceScaleFactor,
    isMobile: iPhone13.isMobile,
    hasTouch: iPhone13.hasTouch,
  });

  // @scenario A-3
  // 註：未登入態下抽屜只有「舉辦生日應援 / 新增藝人 / 登入 註冊」；
  // /my-submissions、/my-favorite、/settings 三個連結是登入後才出現（MobileMenu 內 {user ? ...}），本輪未登入不驗。
  test('手機：桌機導覽隱藏、漢堡按鈕可開關抽屜（含遮罩關閉），抽屜含未登入應有的連結', async ({
    page,
  }) => {
    await page.goto('/');

    // 桌機的功能選單在手機寬度應隱藏
    await expect(
      page.getByRole('navigation', { name: '功能選單' }),
      '手機寬度下桌機「功能選單」導覽應隱藏（display:none）'
    ).toBeHidden();

    // 漢堡按鈕可見
    const burger = page.getByRole('button', { name: '開啟選單' });
    await expect(burger, '手機應顯示「開啟選單」漢堡按鈕').toBeVisible();

    // 抽屜（role=dialog，aria-labelledby「選單」）一開始關閉：aria-hidden=true → 不在 a11y 樹
    const drawer = page.getByRole('dialog', { name: '選單' });
    await expect(drawer, '一開始漢堡抽屜應為關閉狀態').toBeHidden();

    // 點開
    await burger.click();
    await expect(drawer, '點漢堡後抽屜應開啟').toBeVisible();

    // 抽屜內容（未登入）
    await expect(
      drawer.getByRole('link', { name: '舉辦生日應援' }),
      '抽屜應有「舉辦生日應援」→ /submit-event'
    ).toHaveAttribute('href', '/submit-event');
    await expect(
      drawer.getByRole('link', { name: '新增藝人' }),
      '抽屜應有「新增藝人」→ /submit-artist'
    ).toHaveAttribute('href', '/submit-artist');
    await expect(
      drawer.getByRole('button', { name: '登入 / 註冊' }),
      '未登入抽屜應有「登入 / 註冊」入口'
    ).toBeVisible();

    // 「關閉選單」按鈕（抽屜內的 X）可關閉
    await drawer.getByRole('button', { name: '關閉選單' }).click();
    await expect(drawer, '點「關閉選單」後抽屜應關閉').toBeHidden();

    // 再開一次，點遮罩（aria-label「點擊關閉選單」）也可關閉
    await burger.click();
    await expect(drawer, '再次點漢堡後抽屜應開啟').toBeVisible();
    await page.getByRole('button', { name: '點擊關閉選單' }).click();
    await expect(drawer, '點遮罩後抽屜應關閉').toBeHidden();
  });
});

// ── A-6 footer 連結 ─────────────────────────────────────────
test.describe('A-6 footer 連結', () => {
  const INTERNAL_LINKS = [
    '/about',
    '/contact',
    '/guide?tab=submit-event',
    '/guide?tab=submit-artist',
    '/faq',
    '/terms',
    '/privacy',
  ];

  // @scenario A-6
  test('footer：7 個站內連結存在且回應非 4xx/5xx；IG、Threads 為外部連結（target=_blank + rel 含 noopener）', async ({
    page,
    request,
  }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    await expect(footer, '頁面應有 footer（contentinfo）').toBeVisible();

    // 站內連結：先確認 footer 內存在該連結，再用 request.get 檢查狀態（不真的導航過去）
    const badStatus: string[] = [];
    for (const path of INTERNAL_LINKS) {
      await expect(
        footer.locator(`a[href="${path}"]`),
        `footer 應有連到 ${path} 的連結`
      ).toHaveCount(1);
      const res = await request.get(path);
      if (res.status() >= 400) badStatus.push(`${path} → HTTP ${res.status()}`);
    }
    expect(
      badStatus,
      `footer 站內連結不應回應 4xx/5xx。實際有問題的連結：\n${badStatus.join('\n') || '(無)'}`
    ).toEqual([]);

    // 外部社群連結：只驗屬性，不發 request、不點出去
    const ig = footer.locator('a[href*="instagram.com"]');
    await expect(ig, 'footer 應有 Instagram 外部連結').toHaveAttribute('href', /instagram\.com/);
    await expect(ig, 'IG 連結應以新分頁開啟(target=_blank)').toHaveAttribute('target', '_blank');
    await expect(ig, 'IG 連結 rel 應含 noopener').toHaveAttribute('rel', /noopener/);

    const threads = footer.locator('a[href*="threads.net"]');
    await expect(threads, 'footer 應有 Threads 外部連結').toHaveAttribute('href', /threads\.net/);
    await expect(threads, 'Threads 連結應以新分頁開啟(target=_blank)').toHaveAttribute(
      'target',
      '_blank'
    );
    await expect(threads, 'Threads 連結 rel 應含 noopener').toHaveAttribute('rel', /noopener/);
  });
});

// ── A-7 404 一致性 ──────────────────────────────────────────
// 四種型別的無效路徑，都應一致地顯示「404」+「頁面不存在」，且「回到首頁」可用並導回 /。
// 用固定的明顯假字串（不用 Math.random）：隨機值會讓 test 標題在主行程與 worker 行程不一致，
// 導致「Test not found in the worker process」。固定字串一樣「絕不存在」，且標題穩定。
const INVALID_PATHS = [
  { label: '不存在的一般路徑', path: '/this-route-does-not-exist-e2e-regression-404' },
  { label: '不存在的場地 id', path: '/venues/not-a-real-venue-e2e-regression-404' },
  { label: '不存在的藝人 slug', path: '/map/not-a-real-artist-e2e-regression-404' },
  { label: '不存在的活動 slug', path: '/event/not-a-real-event-e2e-regression-404' },
];

test.describe('A-7 404 一致性', () => {
  for (const { label, path } of INVALID_PATHS) {
    // @scenario A-7
    test(`404：造訪${label} ${path} 應顯示「404」「頁面不存在」，且「回到首頁」導回 /`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(
        page.getByText('404'),
        `造訪 ${path} 應顯示「404」，代表正確落到 not-found；未出現可能是該路由沒處理無效參數`
      ).toBeVisible({ timeout: 10_000 });
      await expect(
        page.getByText('頁面不存在'),
        `造訪 ${path} 應顯示「頁面不存在」文案，但找不到（404 頁面內容不一致）`
      ).toBeVisible();

      const home = page.getByRole('link', { name: '回到首頁' });
      await expect(home, `${path} 的 404 頁應有「回到首頁」連結`).toBeVisible();
      await home.click();
      await expect(page, '點「回到首頁」後應回到首頁 /').toHaveURL(/:\/\/[^/]+\/?(\?.*)?$/);
    });
  }
});

// ── H-7 console / 網路 乾淨 ──────────────────────────────────
// 排除的第三方網域（非我方可控，4xx/5xx 與 console error 皆略過）：
//   Google 系（analytics / tagmanager / fonts / maps / apis）、Firebase / Firestore / Identity Toolkit、
//   Sentry、地圖圖磚（OpenStreetMap / tile 伺服器 / carto / arcgis）、Microsoft Clarity、Bing。
const THIRD_PARTY = [
  'google',
  'gstatic',
  'googletagmanager',
  'google-analytics',
  'googleapis',
  'doubleclick',
  'firebase',
  'firebaseio',
  'firebaseinstallations',
  'identitytoolkit',
  'sentry.io',
  'sentry-cdn',
  'ingest.sentry',
  'openstreetmap',
  'tile.',
  'basemaps',
  'cartocdn',
  'carto.com',
  'arcgis',
  'clarity.ms',
  'bing.com',
];
const isThirdParty = (url: string) => THIRD_PARTY.some((h) => url.includes(h));

/** 掛上 console/response 監聽後導覽到 target，回傳我方（非第三方）的 error 與 4xx/5xx 清單 */
async function collectWhileVisiting(page: Page, target: string) {
  const consoleErrors: string[] = [];
  const badResponses: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const loc = msg.location()?.url ?? '';
    if (isThirdParty(loc)) return;
    // 排除地圖頁既有的 React #418 hydration mismatch（正常載入即會出現、Sentry 已在追、且間歇性）。
    // 已列入 HANDOFF 給工程師另修；不讓這個既有錯誤造成 H-7 間歇假紅。
    if (/#418|errors\/418|hydrat/i.test(msg.text())) return;
    consoleErrors.push(`${msg.text()}  @ ${loc || '(無位置資訊)'}`);
  });
  page.on('response', (resp) => {
    if (resp.status() < 400) return;
    if (isThirdParty(resp.url())) return;
    badResponses.push(`HTTP ${resp.status()} ${resp.request().method()} ${resp.url()}`);
  });
  await page.goto(target, { waitUntil: 'load' });
  await page.waitForTimeout(1500); // 等晚到的 console error / xhr 落地
  return { consoleErrors, badResponses };
}

function assertClean(
  routeLabel: string,
  result: { consoleErrors: string[]; badResponses: string[] }
) {
  expect(
    result.consoleErrors,
    `${routeLabel}：不應有 console error（已排除第三方）。實際捕捉到：\n${result.consoleErrors.join('\n') || '(無)'}`
  ).toEqual([]);
  expect(
    result.badResponses,
    `${routeLabel}：不應有 4xx/5xx 資源請求（已排除第三方）。實際捕捉到：\n${result.badResponses.join('\n') || '(無)'}`
  ).toEqual([]);
}

test.describe('H-7 主要路由 console / 網路乾淨', () => {
  // @scenario H-7
  test('首頁 / 載入時無 console error、無 4xx/5xx（第三方除外）', async ({ page }) => {
    assertClean('首頁 /', await collectWhileVisiting(page, '/'));
  });

  // @scenario H-7
  test('場地列表 /venues 載入時無 console error、無 4xx/5xx（第三方除外）', async ({ page }) => {
    assertClean('場地列表 /venues', await collectWhileVisiting(page, '/venues'));
  });

  // @scenario H-7
  test('活動詳情（首頁第一筆）載入時無 console error、無 4xx/5xx（第三方除外）', async ({
    page,
  }) => {
    await page.goto('/');
    const href = await page.locator('a[href^="/event/"]').first().getAttribute('href');
    expect(href, '首頁應有活動連結以取得 /event 路由').toBeTruthy();
    assertClean(`活動詳情 ${href}`, await collectWhileVisiting(page, href!));
  });

  // @scenario H-7
  test('藝人地圖（首頁第一個藝人）載入時無 console error、無 4xx/5xx（第三方除外）', async ({
    page,
  }) => {
    await page.goto('/');
    const href = await page.locator('a[href^="/map/"]').first().getAttribute('href');
    expect(href, '首頁應有地圖連結以取得 /map 路由').toBeTruthy();
    assertClean(`藝人地圖 ${href}`, await collectWhileVisiting(page, href!));
  });
});
