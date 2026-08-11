import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * G-1 跨裝置 RWD — document 層級橫向溢出檢查。桌機 project、用 setViewportSize 切寬度即可（不需真 WebKit）。
 *
 * 站上有多個「刻意橫向捲動」的區塊（熱門輪播、藝人列、探索場地、場地紀錄列）——那是設計如此，
 * 所以只檢查 document 層級的溢出（documentElement.scrollWidth <= innerWidth + 1），不遞迴子元素。
 *
 * 跑完會產出 e2e/reports/responsive-findings.md（各路由 × 各寬度的結果 + 截圖路徑），方便貼給工程師 / 設計師。
 */

const WIDTHS = [360, 390, 768, 1440];
const ARTIFACTS = path.resolve('e2e/reports/responsive-artifacts');
const REPORT = path.resolve('e2e/reports/responsive-findings.md');

async function resolveRoutes(page: Page) {
  await page.goto('/');
  const venue = await page.locator('a[href^="/venues/"]').first().getAttribute('href');
  const event = await page.locator('a[href^="/event/"]').first().getAttribute('href');
  const map = await page.locator('a[href^="/map/"]').first().getAttribute('href');
  return [
    { label: '首頁', url: '/' },
    { label: '場地列表', url: '/venues' },
    { label: '場地詳情', url: venue ?? '/venues' },
    { label: '活動詳情', url: event ?? '/' },
    { label: '藝人地圖', url: map ?? '/' },
  ];
}

// @scenario G-1
test('G-1 五個主要路由 × 四個寬度：document 層級不應有非預期的橫向溢出', async ({ page }) => {
  // 20 組（5 路由 × 4 寬度）× goto+截圖，遠超預設 30s；放寬到 3 分鐘讓它跑完並寫出報告。
  test.setTimeout(180_000);
  fs.mkdirSync(ARTIFACTS, { recursive: true });
  const routes = await resolveRoutes(page);

  const rows: {
    route: string;
    url: string;
    width: number;
    scrollW: number;
    innerW: number;
    overflow: boolean;
    shot: string;
  }[] = [];
  const offenders: string[] = [];

  for (const r of routes) {
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto(r.url, { waitUntil: 'load' });
      await page.waitForTimeout(700); // 等版面穩定（字體 / 圖片回流）
      const { scrollW, innerW } = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        innerW: window.innerWidth,
      }));
      const overflow = scrollW > innerW + 1; // 容許 1px 誤差
      const shot = path.join(ARTIFACTS, `${r.label}__${w}.png`);
      await page.screenshot({ path: shot });
      rows.push({ route: r.label, url: r.url, width: w, scrollW, innerW, overflow, shot });
      if (overflow)
        offenders.push(
          `${r.label}（${r.url}）@ ${w}px：scrollWidth=${scrollW} > innerWidth=${innerW}（超出 ${scrollW - innerW}px）`
        );
    }
  }

  // 產出 markdown 報告
  const md = [
    '# STELLAR RWD — 橫向溢出檢查（G-1）',
    '',
    `產生時間：${new Date().toLocaleString('sv-SE')}｜環境：${process.env.BASE_URL || 'http://localhost:3000'}`,
    '',
    '判準：`document.documentElement.scrollWidth <= window.innerWidth + 1`（容許 1px）。刻意橫向捲動的區塊（輪播 / 頭像列 / 場地列）不列入——只看 document 層級。',
    '',
    '| 路由 | 寬度 | scrollWidth | innerWidth | 結果 | 截圖 |',
    '| --- | ---: | ---: | ---: | --- | --- |',
    ...rows.map(
      (x) =>
        `| ${x.route} | ${x.width} | ${x.scrollW} | ${x.innerW} | ${x.overflow ? '🔴 溢出' : '✅'} | ${path.relative(path.dirname(REPORT), x.shot)} |`
    ),
  ].join('\n');
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, md + '\n', 'utf-8');
  console.log(`\n📄 RWD 報告已產生：${REPORT}`);

  expect(
    offenders,
    `以下路由 / 寬度出現非預期的整頁橫向溢出（截圖在 e2e/reports/responsive-artifacts/）：\n${offenders.join('\n') || '(無)'}`
  ).toEqual([]);
});
