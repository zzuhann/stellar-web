import { test, expect, type Page } from '@playwright/test';
import { expectImageLoaded } from '../helpers/images';

/**
 * 活動詳情 /event/[slug] — 使用者從 IG 限動點進來的落地頁，全站最該保護的路徑。
 * 未登入、對正式站唯讀；外部連結只驗 href + target + rel，不點出去。
 */

const HOME_GENERIC_TITLE = 'STELLAR 台灣生咖地圖 | 生咖、生日應援活動資訊';

/** 從首頁抓第一個活動連結並點入，回到活動詳情頁（動態，不寫死 slug） */
async function gotoFirstEvent(page: Page): Promise<void> {
  await page.goto('/');
  const eventLink = page.locator('a[href^="/event/"]').first();
  await expect(eventLink, '首頁應至少有一個活動連結 a[href^="/event/"]，但找不到').toBeVisible({
    timeout: 15_000,
  });
  await eventLink.click();
  await expect(page, '點活動連結後網址應變成 /event/[slug]').toHaveURL(/\/event\/.+/);
  await expect(
    page.locator('#main-content'),
    '活動詳情頁主內容容器 #main-content 應載入，但等待逾時'
  ).toBeVisible({ timeout: 15_000 });
}

/** 活動主標題（頁面唯一 h2；h1 是全站 layout 的 sr-only） */
const eventTitleHeading = (page: Page) => page.getByRole('heading', { level: 2 }).first();

/** ArtistSection 的藝人連結（排除 breadcrumb 的「…生日應援地圖」連結） */
const artistLink = (page: Page) =>
  page.locator('#main-content a[href^="/map/"]').filter({ hasNotText: '生日應援地圖' }).first();

// ── C-1 站內點入 ────────────────────────────────────────────
// @scenario C-1
test('C-1 站內點入：從首頁點第一個活動連結進入 /event/[slug]，標題、主視覺海報、藝人名稱皆渲染', async ({
  page,
}) => {
  await gotoFirstEvent(page);

  const title = eventTitleHeading(page);
  await expect(title, '活動詳情應顯示活動標題(h2)，但找不到').toBeVisible();
  expect((await title.textContent())?.trim(), '活動標題文字不應為空').toBeTruthy();

  await expect(
    page.locator('#main-content img').first(),
    '活動詳情應渲染主視覺海報圖，但找不到 img'
  ).toBeVisible();

  const artist = artistLink(page);
  await expect(artist, '活動詳情應渲染藝人名稱（連到 /map/ 的連結），但找不到').toBeVisible();
  expect((await artist.textContent())?.trim(), '藝人名稱文字不應為空').toBeTruthy();
});

// ── C-2 深連結直落（模擬 IG 導流）────────────────────────────
// @scenario C-2
test('C-2 深連結直落：全新 context（無 cookie/referrer）直接開活動 URL，首屏完整渲染且 <title> 含活動名與藝人名', async ({
  page,
  browser,
}) => {
  // 先從首頁取得一個活動的絕對 URL
  await page.goto('/');
  const href = await page.locator('a[href^="/event/"]').first().getAttribute('href');
  expect(href, '首頁應有活動連結以取得活動 URL').toBeTruthy();
  const eventUrl = new URL(href!, page.url()).toString();

  // 全新 browser context：不帶任何既有 cookie；直接 goto = 無 referrer（模擬從 IG 限動直落）
  const freshContext = await browser.newContext();
  const freshPage = await freshContext.newPage();
  try {
    await freshPage.goto(eventUrl);
    await expect(
      freshPage.locator('#main-content'),
      '深連結直落時活動詳情主內容應完整渲染，但等待逾時'
    ).toBeVisible({ timeout: 15_000 });

    // 海報非破圖
    await expectImageLoaded(freshPage.locator('#main-content img').first(), '活動海報');

    // 活動標題
    const title = freshPage.getByRole('heading', { level: 2 }).first();
    await expect(title, '深連結首屏應顯示活動標題(h2)').toBeVisible();
    const eventName = (await title.textContent())?.trim() ?? '';
    expect(eventName, '活動標題文字不應為空').toBeTruthy();

    // 「時間/地點」區塊：日期列（加入行事曆 CTA）+ 地點連結
    await expect(
      freshPage.getByRole('heading', { name: '時間/地點' }),
      '深連結首屏應渲染「時間/地點」區塊'
    ).toBeVisible();
    // exact:true 只命中可見的「加入行事曆」CTA，避開 sr-only 的「活動時間，點擊加入行事曆」
    await expect(
      freshPage.getByText('加入行事曆', { exact: true }),
      '「時間/地點」應有日期列（含「加入行事曆」CTA），代表日期已渲染'
    ).toBeVisible();
    const locationLink = freshPage
      .locator('#main-content a[href*="/venues/"], #main-content a[href*="google.com/maps"]')
      .first();
    await expect(locationLink, '「時間/地點」應有地點連結（場地頁或 Google 地圖）').toBeVisible();
    expect((await locationLink.textContent())?.trim(), '地點文字不應為空').toBeTruthy();

    // 藝人名
    const artist = freshPage
      .locator('#main-content a[href^="/map/"]')
      .filter({ hasNotText: '生日應援地圖' })
      .first();
    await expect(artist, '深連結首屏應渲染藝人名稱').toBeVisible();
    const artistName = (await artist.textContent())?.trim() ?? '';
    expect(artistName, '藝人名稱文字不應為空').toBeTruthy();

    // <title> 同時含活動名與藝人名，且不等於首頁泛用標題
    const pageTitle = await freshPage.title();
    expect(
      pageTitle,
      `活動頁 <title> 應包含活動名「${eventName}」，實際：「${pageTitle}」`
    ).toContain(eventName);
    expect(
      pageTitle,
      `活動頁 <title> 應包含藝人名「${artistName}」，實際：「${pageTitle}」`
    ).toContain(artistName);
    expect(
      pageTitle,
      `活動頁 <title> 不應等於首頁泛用標題，實際：「${pageTitle}」（相同代表這頁沒設定專屬 title）`
    ).not.toBe(HOME_GENERIC_TITLE);
  } finally {
    await freshContext.close();
  }
});

// ── C-5 主辦社群連結（選填）─────────────────────────────────
// @scenario C-5 partial: 社群連結為選填；此活動若無 IG/Threads，測試不失敗但於報告標註「無社群連結」。
test('C-5 主辦社群連結：IG / Threads（若存在）href 格式正確、開新分頁、rel 含 noopener（不點出去）', async ({
  page,
}, testInfo) => {
  await gotoFirstEvent(page);

  const ig = page.locator('#main-content a[href*="instagram.com"]');
  const threads = page.locator('#main-content a[href*="threads.net"]');
  const igCount = await ig.count();
  const threadsCount = await threads.count();

  if (igCount === 0 && threadsCount === 0) {
    testInfo.annotations.push({
      type: 'C-5 note',
      description: '此活動無社群連結（IG 與 Threads 皆無）；C-5 為選填，故不失敗。',
    });
    return;
  }

  if (igCount > 0) {
    const first = ig.first();
    await expect(
      first,
      'IG 連結 href 應為 https://www.instagram.com/{handle} 格式'
    ).toHaveAttribute('href', /^https:\/\/www\.instagram\.com\/.+/);
    await expect(first, 'IG 連結應以新分頁開啟(target=_blank)').toHaveAttribute('target', '_blank');
    await expect(first, 'IG 連結 rel 應含 noopener').toHaveAttribute('rel', /noopener/);
  }
  if (threadsCount > 0) {
    const first = threads.first();
    await expect(
      first,
      'Threads 連結 href 應為 https://www.threads.net/@{handle} 格式'
    ).toHaveAttribute('href', /^https:\/\/www\.threads\.net\/@.+/);
    await expect(first, 'Threads 連結應以新分頁開啟(target=_blank)').toHaveAttribute(
      'target',
      '_blank'
    );
    await expect(first, 'Threads 連結 rel 應含 noopener').toHaveAttribute('rel', /noopener/);
  }
});

// ── C-7 未登入點收藏 → 登入 dialog ──────────────────────────
// @scenario C-7
test('C-7 未登入點收藏：點「收藏此活動」應出現 aria-label="登入" 的 dialog（不能靜默失敗）', async ({
  page,
}) => {
  await gotoFirstEvent(page);

  // 桌機收藏按鈕（DesktopFavoriteButton，≥640px 顯示）
  const favBtn = page.getByRole('button', { name: '收藏此活動' });
  await expect(favBtn, '未登入活動詳情應顯示「收藏此活動」按鈕，但找不到').toBeVisible();

  const loginDialog = page.getByRole('dialog', { name: '登入' });
  await expect(loginDialog, '點收藏前不應已存在登入 dialog').toBeHidden();

  await favBtn.click();
  await expect(
    loginDialog,
    '未登入點「收藏此活動」應彈出「登入」dialog；若沒有任何反應即為靜默失敗（這正是本條要抓的）'
  ).toBeVisible({ timeout: 10_000 });

  // 不完成登入，關閉 dialog
  await loginDialog.getByRole('button', { name: '關閉登入視窗' }).click();
  await expect(loginDialog, '點關閉後登入 dialog 應消失').toBeHidden();
});

// ── C-9 breadcrumb ──────────────────────────────────────────
// @scenario C-9
test('C-9 breadcrumb：首項「首頁」→ /、第二項含「生日應援地圖」→ /map/、末項為當前活動名且非連結', async ({
  page,
}) => {
  await gotoFirstEvent(page);

  const bc = page.getByRole('navigation', { name: 'breadcrumb' });
  await expect(bc, '活動詳情應有 breadcrumb 導覽，但找不到').toBeVisible();

  await expect(
    bc.getByRole('link', { name: '首頁' }),
    'breadcrumb 首項「首頁」href 應為 /'
  ).toHaveAttribute('href', '/');

  const mapCrumb = bc.getByRole('link', { name: /生日應援地圖/ });
  await expect(mapCrumb, 'breadcrumb 第二項應為「[藝人] 生日應援地圖」連結').toBeVisible();
  await expect(mapCrumb, 'breadcrumb 第二項 href 應以 /map/ 開頭').toHaveAttribute(
    'href',
    /^\/map\//
  );

  const eventName = (await eventTitleHeading(page).textContent())?.trim() ?? '';
  const current = bc.locator('[aria-current="page"]');
  await expect(current, 'breadcrumb 末項應標記 aria-current="page"').toBeVisible();
  expect((await current.textContent())?.trim(), 'breadcrumb 末項文字應為當前活動名稱').toBe(
    eventName
  );
  await expect(current, 'breadcrumb 末項應為純文字、不是連結（不得有 href）').not.toHaveAttribute(
    'href',
    /.*/
  );
});
