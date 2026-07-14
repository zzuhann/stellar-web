#!/usr/bin/env node
// 高解析度截取活動詳情頁卡片（Swiper 到時間/地點）或地圖頁活動分布總覽，取代「手機截圖→裁切→傳電腦」流程。
// 用法：node scripts/capture-card.mjs <event 或 map 網址...>（可一次傳多個網址，種類可混合）
// 輸出資料夾預設 ~/Downloads，可用 CAPTURE_OUT_DIR 環境變數覆蓋。

import { chromium } from 'playwright';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';

const urls = process.argv.slice(2);
if (urls.length === 0) {
  console.error('用法：node scripts/capture-card.mjs <event 網址...>');
  process.exit(1);
}

const outDir = process.env.CAPTURE_OUT_DIR ?? path.join(os.homedir(), 'Downloads');
fs.mkdirSync(outDir, { recursive: true });

const slugOf = (url) => url.split('/').filter(Boolean).pop();

const browser = await chromium.launch({ headless: true });

for (const url of urls) {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3, // 高 DPI，避免 Mac 螢幕截圖那種糊感
  });

  const isMap = url.includes('/map/');

  if (isMap) {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // 等地圖圖磚、大頭貼 marker 載入
    const file = path.join(outDir, `${slugOf(url)}-map.png`);
    await page.screenshot({ path: file }); // 地圖頁沒有全站 header、底部抽屜預設就是偷看狀態，直接截 viewport 就是想要的畫面
    console.log(`已存到 ${file}`);
    await page.close();
    continue;
  }

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // 等圖片輪播載入
  await page.addStyleTag({
    content: `
      header { display: none !important; }
      nav[aria-label="breadcrumb"] { display: none !important; }
    `,
  }); // 藏掉全站 header 跟麵包屑，只留卡片本身
  await page.waitForTimeout(100); // 等 reflow

  const detailHeading = page.locator('h3:has-text("詳細說明")');
  const detailBox = (await detailHeading.count()) > 0 ? await detailHeading.boundingBox() : null;
  const BOTTOM_BAR_BUFFER = 50; // 底部固定列會蓋住視窗底部，多留一點高度避免蓋到地址
  const targetHeight = detailBox ? Math.ceil(detailBox.y) + BOTTOM_BAR_BUFFER : 900; // 沒有詳細說明就退回固定高度

  await page.setViewportSize({ width: 390, height: targetHeight });
  const file = path.join(outDir, `${slugOf(url)}.png`);
  await page.screenshot({ path: file }); // viewport 高度=內容高度，底部固定列自然貼齊視窗底部
  console.log(`已存到 ${file}`);
  await page.close();
}

await browser.close();
