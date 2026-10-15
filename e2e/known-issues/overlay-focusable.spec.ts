import { test, expect } from '@playwright/test';

/**
 * [KNOWN ISSUE] 關閉狀態的 overlay，內部元件仍在 Tab 序列裡（可被鍵盤聚焦）。
 *
 * 正式站觀察（2026-07-21）：
 *   全站三個 overlay（手機選單抽屜 MobileMenu、登入 modal AuthModal、搜尋藝人 sheet）在「關閉」狀態下，
 *   是用 transform 移出畫面、而非 display:none / 卸載。外層雖有 aria-hidden="true"，
 *   但內部的 button / a / input 其 offsetParent 仍不為 null，代表它們還在 Tab 序列裡。
 * 後果：
 *   鍵盤使用者會 Tab 到「看不見」的元素；讀屏軟體行為不一致。
 * 正確行為：
 *   overlay 關閉時，其內部所有可聚焦元素都不應可被聚焦（例如改用 display:none、卸載、或加 inert / tabindex=-1）。
 * 變綠 = 工程師已讓關閉的 overlay 退出 Tab 序列。
 */

const FOCUSABLE = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

test.describe('[KNOWN ISSUE] 關閉狀態 overlay 的鍵盤可聚焦性', () => {
  // @scenario none known-issue: 關閉的 overlay 內部不應有任何仍可聚焦（offsetParent !== null）的元素。
  test('[KNOWN ISSUE] 首頁：所有「關閉狀態」的 overlay，其內部可聚焦元素都應退出版面（offsetParent 應為 null）', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('link', { name: 'STELLAR' }).first(),
      '首頁 header 應載入'
    ).toBeVisible();

    const report = await page.evaluate((sel) => {
      const containers = Array.from(
        document.querySelectorAll<HTMLElement>('[role="dialog"], [aria-modal="true"]')
      );
      // 「關閉狀態」判定：外層 aria-hidden="true"（本站關閉的 overlay 會這樣標）
      const closed = containers.filter((c) => c.getAttribute('aria-hidden') === 'true');
      const offenders: { container: string; tag: string; label: string }[] = [];
      for (const c of closed) {
        const containerName =
          c.getAttribute('aria-label') ||
          c.getAttribute('aria-labelledby') ||
          String(c.className).slice(0, 40) ||
          '(unnamed dialog)';
        for (const el of Array.from(c.querySelectorAll<HTMLElement>(sel))) {
          // offsetParent !== null → 元素仍在版面內 → 仍可被 Tab 聚焦（bug）
          if (el.offsetParent !== null) {
            offenders.push({
              container: containerName,
              tag: el.tagName.toLowerCase(),
              label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30),
            });
          }
        }
      }
      return { totalContainers: containers.length, closedContainers: closed.length, offenders };
    }, FOCUSABLE);

    // 保護：至少要偵測到「關閉狀態」的 overlay，否則是選擇器沒抓到（假綠），不是產品沒問題
    expect(
      report.closedContainers,
      `首頁應存在關閉狀態的 overlay 容器（aria-hidden=true 的 dialog）可供檢測；偵測到 ${report.totalContainers} 個 dialog、其中關閉的 ${report.closedContainers} 個。若為 0，是測試選擇器失效需修測試，不是產品沒問題`
    ).toBeGreaterThan(0);

    expect(
      report.offenders,
      `關閉狀態的 overlay 內不應有仍可聚焦的元素（offsetParent 應為 null）。目前仍可被 Tab 聚焦的元素：\n` +
        report.offenders
          .map((o, i) => `  ${i + 1}. [${o.container}] <${o.tag}> "${o.label}"`)
          .join('\n')
    ).toEqual([]);
  });

  // @scenario none known-issue: 連續 Tab 過程中，焦點不應落在視窗可視範圍外的元素。
  test('[KNOWN ISSUE] 首頁：從頂端連續按 Tab 30 次，焦點都不應落在視窗可視範圍外', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('link', { name: 'STELLAR' }).first(),
      '首頁 header 應載入'
    ).toBeVisible();

    const vp = page.viewportSize() ?? { width: 1280, height: 720 };

    // 讓焦點回到最頂端（清掉任何既有焦點，再從頭 Tab）
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

    type Step = {
      step: number;
      tag: string;
      label: string;
      x: number;
      y: number;
      w: number;
      h: number;
    };
    const trail: Step[] = [];
    for (let i = 1; i <= 30; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30),
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height),
        };
      });
      trail.push({ step: i, ...(info ?? { tag: '(none)', label: '', x: 0, y: 0, w: 0, h: 0 }) });
    }

    // 「落在可視範圍外」＝ 元素整個矩形完全在視窗之外（右/下超出，或左/上完全看不到）
    const offscreen = trail.filter((t) => {
      if (t.tag === '(none)') return false;
      const rightOut = t.x >= vp.width;
      const bottomOut = t.y >= vp.height;
      const leftOut = t.x + t.w <= 0;
      const topOut = t.y + t.h <= 0;
      return rightOut || bottomOut || leftOut || topOut;
    });

    expect(
      offscreen,
      `連續 Tab 時，焦點不應落在視窗可視範圍(${vp.width}x${vp.height})外的元素。實際落在畫面外的步驟：\n` +
        offscreen
          .map(
            (t) =>
              `  第 ${t.step} 次 Tab → <${t.tag}> "${t.label}" @ (x=${t.x}, y=${t.y}, w=${t.w}, h=${t.h})`
          )
          .join('\n')
    ).toEqual([]);
  });
});
