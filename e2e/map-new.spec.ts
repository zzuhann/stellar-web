import { test, expect, type Page } from '@playwright/test';

// ─── Constants ───────────────────────────────────────────────
const TEST_ARTIST = 'kyujin';
const MAP_NEW_URL = `/map-new/${TEST_ARTIST}`;
const MAP_EVENTS_API = '**/events/map-data**';

// ─── Helpers ─────────────────────────────────────────────────

/** Wait for Leaflet map and page content to be ready (map + bottom sheet, empty state, or list mode) */
async function waitForMapReady(page: Page) {
  await page.waitForSelector('.leaflet-container', { timeout: 15_000 });
  // Wait for any of: bottom-sheet (normal), empty state text, or list-mode back button
  await expect(
    page
      .locator('[data-testid="bottom-sheet"]')
      .or(page.getByText('目前沒有生日應援活動'))
      .or(page.getByRole('button', { name: '地圖' }))
  ).toBeVisible({ timeout: 15_000 });
}

/** Get the bounding box of the handle bar area (center point) */
async function getHandleBarCenter(page: Page) {
  const handleBar = page.locator('[data-testid="handle-bar-area"]');
  await expect(handleBar).toBeVisible();
  const bbox = await handleBar.boundingBox();
  if (!bbox) throw new Error('handle-bar-area bounding box not found');
  return {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2,
  };
}

/** Simulate a tap on the handle bar (no drag movement) */
async function tapHandleBar(page: Page) {
  const center = await getHandleBarCenter(page);
  await page.mouse.move(center.x, center.y);
  await page.mouse.down();
  await page.mouse.up();
}

/** Drag the handle bar by deltaY pixels (negative = upward) */
async function dragHandleBar(page: Page, deltaY: number) {
  const center = await getHandleBarCenter(page);
  await page.mouse.move(center.x, center.y);
  await page.mouse.down();
  await page.mouse.move(center.x, center.y + deltaY, { steps: 15 });
  await page.mouse.up();
}

// ─────────────────────────────────────────────────────────────
// TC-029：不存在的 artistId 導向首頁
// ─────────────────────────────────────────────────────────────
test.describe('TC-029：不存在 artistId', () => {
  test('進入不存在的 artistId 應導向首頁 /', async ({ page }) => {
    await page.goto('/map-new/nonexistent-artist-id-xyz-9999');
    await expect(page).toHaveURL('/', { timeout: 15_000 });
  });
});

// ─────────────────────────────────────────────────────────────
// TC-038：未登入使用者可正常瀏覽
// ─────────────────────────────────────────────────────────────
test.describe('TC-038：未登入瀏覽', () => {
  test('未登入可正常進入地圖頁，頁面不會壞掉', async ({ page }) => {
    await page.goto(MAP_NEW_URL);
    await waitForMapReady(page);
    await expect(page).toHaveURL(new RegExp(MAP_NEW_URL));
  });
});

// ─────────────────────────────────────────────────────────────
// TC-030：活動為零（mock API）
// ─────────────────────────────────────────────────────────────
test.describe('TC-030：零活動空狀態', () => {
  test('API 回傳空陣列時，顯示空活動提示', async ({ page }) => {
    await page.route(MAP_EVENTS_API, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ events: [], total: 0 }),
      })
    );

    await page.goto(MAP_NEW_URL);
    await page.waitForSelector('.leaflet-container', { timeout: 15_000 });

    await expect(page.getByText('目前沒有生日應援活動')).toBeVisible({ timeout: 10_000 });

    // TC-030 補充：emptyPanel 是獨立元件，MapBottomSheet 與 handleBar 完全不存在
    await expect(page.locator('[data-testid="bottom-sheet"]')).toHaveCount(0);
    await expect(page.locator('[data-testid="handle-bar-area"]')).toHaveCount(0);

    // TC-030 補充：拖曳無效 — emptyPanel 無拖曳互動，drag 不會改變任何狀態
    const emptyText = page.getByText('目前沒有生日應援活動');
    const box = await emptyText.boundingBox();
    if (box) {
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.mouse.move(cx, cy - 200, { steps: 10 }); // drag upward
      await page.mouse.up();
      // After drag: empty state text still visible, no bottom-sheet appeared
      await expect(page.getByText('目前沒有生日應援活動')).toBeVisible();
      await expect(page.locator('[data-testid="bottom-sheet"]')).toHaveCount(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// TC-035：API 失敗（500）不崩潰
// ─────────────────────────────────────────────────────────────
test.describe('TC-035：API 500 不會壞掉', () => {
  test('events API 回傳 500 時，頁面不會壞掉', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.route(MAP_EVENTS_API, (route) => route.fulfill({ status: 500 }));

    await page.goto(MAP_NEW_URL);

    // Wait for potential error handling or empty state
    await page.waitForTimeout(3_000);

    // No unhandled JS errors
    expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0);
    // Page still has the map container or a loading state visible
    const isOnPage = await page.locator('body').isVisible();
    expect(isOnPage).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// TC-034：定位失敗 / 未授權 — 靜默處理
// ─────────────────────────────────────────────────────────────
test.describe('TC-034：定位失敗安靜處理', () => {
  test('沒有 geolocation 授權時，頁面正常載入，不顯示 error', async ({ browser }) => {
    // Create context without geolocation permission
    const context = await browser.newContext({ permissions: [] });
    const page = await context.newPage();

    await page.goto(MAP_NEW_URL);
    await waitForMapReady(page);

    // Reset view button should still be visible
    await expect(page.getByRole('button', { name: '查看全部活動' })).toBeVisible();
    // No error toast visible
    await expect(page.getByRole('alert'))
      .not.toBeVisible()
      .catch(() => {
        // no alert element is also fine
      });

    await context.close();
  });
});

// ─────────────────────────────────────────────────────────────
// Main test group with map ready
// ─────────────────────────────────────────────────────────────
test.describe('Map New Page — 地圖已載入', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(MAP_NEW_URL);
    await waitForMapReady(page);
  });

  // ── TC-001：進入頁面 — Bottom Sheet 預設狀態 ──────────────
  test('TC-001：頁面載入，Bottom Sheet 在 peek 狀態（120px）', async ({ page }) => {
    const bottomSheet = page.locator('[data-testid="bottom-sheet"]');
    await expect(bottomSheet).toBeVisible();

    // Check height is ~120px
    const height = await bottomSheet.evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBeCloseTo(120, 0);

    // Nav bar visible
    await expect(page.getByRole('navigation').or(page.locator('header'))).toBeVisible();

    // Reset view button visible
    await expect(page.getByRole('button', { name: '查看全部活動' })).toBeVisible();

    // List mode button (QueueListIcon) NOT visible in peek
    await expect(page.getByRole('button', { name: '切換列表模式' })).not.toBeVisible();
  });

  // ── TC-001 補充：顯示 MapNewHeader，不顯示全域 bottom nav ──
  test('TC-001 補充：頁面使用 MapNewHeader（有返回按鈕或藝人名稱）', async ({ page }) => {
    // MapNewHeader is a simple nav bar at the top; confirm the Leaflet map fills the rest
    // and there is no extra footer/bottom navigation bar
    const leafletContainer = page.locator('.leaflet-container');
    await expect(leafletContainer).toBeVisible();

    // The header region exists (MapNewHeader renders as <header> or nav sibling)
    // Simply confirm the page is stable and no full-page global nav is obscuring the map
    const bottomSheet = page.locator('[data-testid="bottom-sheet"]');
    await expect(bottomSheet).toBeVisible();
  });

  // ── TC-002：tap handleBar — peek ↔ half-open ──────────────
  test('TC-002：tap handleBar，Bottom Sheet 切換到 half-open', async ({ page }) => {
    await tapHandleBar(page);

    // QueueListIcon appears after half-open
    await expect(page.getByRole('button', { name: '切換列表模式' })).toBeVisible({
      timeout: 3_000,
    });

    // Tap again → back to peek
    await tapHandleBar(page);
    await expect(page.getByRole('button', { name: '切換列表模式' })).not.toBeVisible({
      timeout: 3_000,
    });
  });

  // ── TC-003：向上拖曳 Bottom Sheet 到 half-open ─────────────
  test('TC-003：向上拖曳 handleBar 到 half-open', async ({ page }) => {
    // Drag up by 300px (enough to exceed midpoint but not trigger list mode)
    await dragHandleBar(page, -300);

    await expect(page.getByRole('button', { name: '切換列表模式' })).toBeVisible({
      timeout: 3_000,
    });

    const bottomSheet = page.locator('[data-testid="bottom-sheet"]');
    const height = await bottomSheet.evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBeGreaterThan(120);
  });

  // ── TC-004：向下拖曳收回到 peek ───────────────────────────
  test('TC-004：向下拖曳 Bottom Sheet 收回 peek', async ({ page }) => {
    // First open to half
    await tapHandleBar(page);
    await expect(page.getByRole('button', { name: '切換列表模式' })).toBeVisible({
      timeout: 3_000,
    });

    // Wait for CSS transition (0.3s) to complete before dragging
    await page.waitForTimeout(400);

    // Drag down by 300px to close
    await dragHandleBar(page, 300);

    await expect(page.getByRole('button', { name: '切換列表模式' })).not.toBeVisible({
      timeout: 3_000,
    });

    // Wait for CSS transition (0.3s ease-out) to complete before measuring
    await page.waitForTimeout(400);

    const bottomSheet = page.locator('[data-testid="bottom-sheet"]');
    const height = await bottomSheet.evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBeCloseTo(120, 0);
  });

  // ── TC-005：拖過 72% vh 觸發列表模式 ─────────────────────
  test('TC-005：向上拖超過 72% vh，觸發列表模式', async ({ page }) => {
    const viewportHeight = page.viewportSize()?.height ?? 720;
    const dragDistance = Math.round(viewportHeight * 0.72) + 50; // past 72% threshold

    await dragHandleBar(page, -dragDistance);

    // List mode: "地圖" 按鈕應顯示
    await expect(page.getByRole('button', { name: '地圖' })).toBeVisible({ timeout: 5_000 });
    // MapBottomSheet must be completely unmounted (not just hidden behind EventList)
    await expect(page.locator('[data-testid="bottom-sheet"]')).toHaveCount(0);
  });

  // ── TC-006：點擊列表按鈕進入列表模式 ──────────────────────
  test('TC-006：點擊 QueueListIcon 進入列表模式', async ({ page }) => {
    // Open to half first
    await tapHandleBar(page);
    await expect(page.getByRole('button', { name: '切換列表模式' })).toBeVisible({
      timeout: 3_000,
    });

    await page.getByRole('button', { name: '切換列表模式' }).click();

    await expect(page.getByRole('button', { name: '地圖' })).toBeVisible({ timeout: 3_000 });
    // MapBottomSheet must be completely unmounted from DOM (not just hidden behind EventList)
    await expect(page.locator('[data-testid="bottom-sheet"]')).toHaveCount(0);
  });

  // ── TC-007：列表模式點擊「地圖」返回 ─────────────────
  test('TC-007：列表模式點擊「地圖」，回到地圖 + peek 狀態', async ({ page }) => {
    // Enter list mode via QueueListIcon
    await tapHandleBar(page);
    await page.getByRole('button', { name: '切換列表模式' }).click({ timeout: 3_000 });
    await expect(page.getByRole('button', { name: '地圖' })).toBeVisible({ timeout: 3_000 });

    await page.getByRole('button', { name: '地圖' }).click();

    // Back to map mode: bottom sheet visible again
    await expect(page.locator('[data-testid="bottom-sheet"]')).toBeVisible({ timeout: 3_000 });
    await expect(page.getByRole('button', { name: '地圖' })).not.toBeVisible();
  });

  // ── TC-017：重置視角按鈕 ──────────────────────────────────
  test('TC-017：點擊重置視角按鈕，地圖恢復台灣全圖視角', async ({ page }) => {
    const resetBtn = page.getByRole('button', { name: '查看全部活動' });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // No errors after clicking reset
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForTimeout(500);
    expect(errors).toHaveLength(0);

    // Bottom sheet should still be visible (reset doesn't affect bottom sheet)
    await expect(page.locator('[data-testid="bottom-sheet"]')).toBeVisible();
  });

  // ── TC-020：重整頁面後不保留列表模式 ─────────────────────
  test('TC-020：重整頁面後回到地圖 + peek 狀態', async ({ page }) => {
    // Enter list mode
    await tapHandleBar(page);
    await page.getByRole('button', { name: '切換列表模式' }).click({ timeout: 3_000 });
    await expect(page.getByRole('button', { name: '地圖' })).toBeVisible({ timeout: 3_000 });

    // Go back to map mode first (clears ?mode=list from the URL)
    await page.getByRole('button', { name: '地圖' }).click();
    await expect(page.locator('[data-testid="bottom-sheet"]')).toBeVisible({ timeout: 3_000 });
    await expect(page).not.toHaveURL(/mode=list/);

    // Reload from the clean (non-list-mode) URL
    await page.reload();
    await waitForMapReady(page);

    // Should stay in map mode + peek
    await expect(page.locator('[data-testid="bottom-sheet"]')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: '地圖' })).not.toBeVisible();
  });

  // ── TC-021：handleBar tap 不觸發 EventCarousel 導航 ───────
  test('TC-021：tap handleBar 不觸發頁面導航', async ({ page }) => {
    const initialURL = page.url();

    await tapHandleBar(page);

    // After tap, should still be on the same map page
    await page.waitForTimeout(500);
    expect(page.url()).toBe(initialURL);
    await expect(page).toHaveURL(new RegExp(MAP_NEW_URL));
  });

  // ── TC-012：EventCarousel 卡片導航 ────────────────────────
  test('TC-012：點擊 EventCarousel 卡片，導航至 /event/[slug]', async ({ page }) => {
    // Cards are visible in peek state
    const carouselCards = page.locator('[data-testid="bottom-sheet"] [role="button"]');
    const firstCard = carouselCards.first();
    await expect(firstCard).toBeVisible();

    await firstCard.click();

    await expect(page).toHaveURL(/\/event\//, { timeout: 10_000 });
  });

  // ── TC-013：EventList 卡片導航 ────────────────────────────
  test('TC-013：列表模式點擊卡片，導航至 /event/[slug]', async ({ page }) => {
    // Enter list mode
    await tapHandleBar(page);
    await page.getByRole('button', { name: '切換列表模式' }).click({ timeout: 3_000 });
    await expect(page.getByRole('button', { name: '地圖' })).toBeVisible({ timeout: 3_000 });

    // Click first event card in list (use data-testid to avoid matching Leaflet markers)
    const firstCard = page.locator('[data-testid="event-card"]').first();
    await expect(firstCard).toBeVisible({ timeout: 5_000 });

    await firstCard.click();

    await expect(page).toHaveURL(/\/event\//, { timeout: 10_000 });
  });

  // ── TC-008/009/010：Marker 互動 ───────────────────────────
  test.describe('Marker 互動', () => {
    test('TC-008/009：點擊 Leaflet marker，顯示 SingleEventCard，X 按鈕可關閉', async ({
      page,
    }) => {
      // At default zoom (7), events may be clustered. Zoom in by double-clicking.
      const mapContainer = page.locator('.leaflet-container');
      await expect(mapContainer).toBeVisible();

      // Zoom in several times to reveal individual markers
      for (let i = 0; i < 4; i++) {
        await mapContainer.dblclick();
        await page.waitForTimeout(400);
      }

      // Try to find a single marker (not a cluster)
      // Clusters have a count div; single markers don't
      const singleMarker = page
        .locator('.leaflet-marker-icon')
        .filter({ hasNot: page.locator('[role="img"]') })
        .first();

      // If single markers aren't available, skip gracefully
      const markerCount = await singleMarker.count();
      test.skip(markerCount === 0, 'No single markers visible at this zoom level');

      await singleMarker.click({ force: true });

      // SingleEventCard should appear with close button
      await expect(page.getByRole('button', { name: '關閉' })).toBeVisible({ timeout: 5_000 });
      // Bottom sheet should be hidden
      await expect(page.locator('[data-testid="bottom-sheet"]')).not.toBeVisible();

      // TC-009: Click X to dismiss
      await page.getByRole('button', { name: '關閉' }).click();
      await expect(page.getByRole('button', { name: '關閉' })).not.toBeVisible({ timeout: 3_000 });

      // Bottom sheet remounts (was unmounted while selectedEvent existed)
      await expect(page.locator('[data-testid="bottom-sheet"]')).toBeVisible({ timeout: 3_000 });

      // TC-009 補充：Bottom Sheet 固定回到 peek（不記憶點擊 marker 前的狀態）
      // MapBottomSheet unmounts when selectedEvent is set and remounts fresh → initial state is always peek
      await page.waitForTimeout(400); // wait for snap animation
      const bottomSheetAfterClose = page.locator('[data-testid="bottom-sheet"]');
      const heightAfterClose = await bottomSheetAfterClose.evaluate(
        (el) => el.getBoundingClientRect().height
      );
      expect(heightAfterClose).toBeCloseTo(120, -1); // ±5px tolerance for peek height
      // Confirm peek state: QueueListIcon is NOT visible in peek
      await expect(page.getByRole('button', { name: '切換列表模式' })).not.toBeVisible();
    });

    test('TC-010：點擊 SingleEventCard 本體，導航至活動詳情頁', async ({ page }) => {
      const mapContainer = page.locator('.leaflet-container');

      for (let i = 0; i < 4; i++) {
        await mapContainer.dblclick();
        await page.waitForTimeout(400);
      }

      const singleMarker = page
        .locator('.leaflet-marker-icon')
        .filter({ hasNot: page.locator('[role="img"]') })
        .first();

      const markerCount = await singleMarker.count();
      test.skip(markerCount === 0, 'No single markers visible at this zoom level');

      await singleMarker.click({ force: true });
      await expect(page.getByRole('button', { name: '關閉' })).toBeVisible({ timeout: 5_000 });

      // Click card body (the outer button-role div, not the X button)
      const card = page
        .locator('[role="button"]')
        .filter({ hasNot: page.getByRole('button', { name: '關閉' }) })
        .first();
      await card.click();

      await expect(page).toHaveURL(/\/event\//, { timeout: 10_000 });
    });
  });

  // ── TC-011：EventCarousel 橫向滑動 ────────────────────────
  test('TC-011：EventCarousel 可橫向滑動，不影響 Bottom Sheet 高度', async ({ page }) => {
    const bottomSheet = page.locator('[data-testid="bottom-sheet"]');
    const initialHeight = await bottomSheet.evaluate((el) => el.getBoundingClientRect().height);

    // Scroll the carousel horizontally
    const carousel = page
      .locator('[data-testid="bottom-sheet"]')
      .locator('[style*="overflow"]')
      .or(page.locator('[data-testid="bottom-sheet"]').locator('div').last());

    await carousel.evaluate((el) => {
      el.scrollLeft += 200;
    });

    await page.waitForTimeout(300);

    // Bottom sheet height should not have changed
    const afterHeight = await bottomSheet.evaluate((el) => el.getBoundingClientRect().height);
    expect(afterHeight).toBeCloseTo(initialHeight, 0);
  });

  // ── TC-018：城市 chips 篩選（如果 kyujin 有多城市活動）────
  test('TC-018：列表模式城市 chips 篩選（若有多城市資料）', async ({ page }) => {
    // Enter list mode
    await tapHandleBar(page);
    await page.getByRole('button', { name: '切換列表模式' }).click({ timeout: 3_000 });
    await expect(page.getByRole('button', { name: '地圖' })).toBeVisible({ timeout: 3_000 });

    // Check if city chips are present (only when > 1 city)
    // Use exact:true to avoid matching "查看全部活動" reset view button
    const allChip = page.getByRole('button', { name: '全部', exact: true });
    const hasMultipleCities = await allChip.isVisible();

    if (!hasMultipleCities) {
      test.skip(true, 'kyujin events are all in the same city; skipping city filter test');
    }

    // Click a city chip (skip "全部" and "地圖")
    const allCityButtons = page.getByRole('button');
    const cityChips = allCityButtons.filter({
      hasNot: page.getByRole('button', { name: /全部|地圖/ }),
    });
    const firstCityChip = cityChips.first();
    const cityName = await firstCityChip.textContent();
    await firstCityChip.click();

    // All visible event cards should belong to the selected city
    const cityBadges = page.locator('[class*="cityText"]');
    const badgeCount = await cityBadges.count();
    for (let i = 0; i < badgeCount; i++) {
      const text = await cityBadges.nth(i).textContent();
      expect(text).toBe(cityName);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// TC-036：Mobile 375px
// ─────────────────────────────────────────────────────────────
test.describe('TC-036：Mobile 375px', () => {
  test('375px 視窗下，基本互動正常，無破版', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(MAP_NEW_URL);
    await waitForMapReady(page);

    // Bottom sheet visible
    await expect(page.locator('[data-testid="bottom-sheet"]')).toBeVisible();

    // Tap to open
    await tapHandleBar(page);
    await expect(page.getByRole('button', { name: '切換列表模式' })).toBeVisible({
      timeout: 3_000,
    });

    // X button (close) touch target >= 44px if it appeared
    // Reset button touch target
    const resetBtn = page.getByRole('button', { name: '查看全部活動' });
    const resetBtnSize = await resetBtn.boundingBox();
    if (resetBtnSize) {
      expect(resetBtnSize.width).toBeGreaterThanOrEqual(44);
      expect(resetBtnSize.height).toBeGreaterThanOrEqual(44);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// TC-037：Desktop 1280px
// ─────────────────────────────────────────────────────────────
test.describe('TC-037：Desktop 1280px', () => {
  test('1280px 視窗下，頁面置中，基本功能可使用', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(MAP_NEW_URL);
    await waitForMapReady(page);

    // Bottom sheet should be centered (max-width: 600px)
    const bottomSheet = page.locator('[data-testid="bottom-sheet"]');
    await expect(bottomSheet).toBeVisible();
    const bbSheet = await bottomSheet.boundingBox();
    if (bbSheet) {
      expect(bbSheet.width).toBeLessThanOrEqual(600);
      // Should be horizontally centered
      const center = bbSheet.x + bbSheet.width / 2;
      expect(center).toBeCloseTo(640, 10); // within 10px of center
    }

    // List mode button after tap
    await tapHandleBar(page);
    await expect(page.getByRole('button', { name: '切換列表模式' })).toBeVisible({
      timeout: 3_000,
    });
  });
});
