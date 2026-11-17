import { test, expect } from './fixtures';
import type { Page } from './fixtures';

const ts = (iso: string) => ({
  _seconds: Math.floor(new Date(iso).getTime() / 1000),
  _nanoseconds: 0,
});

const makeEvents = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: `e${i + 1}`,
    slug: `slug-e${i + 1}`,
    title: `預約活動 ${i + 1}`,
    datetime: {
      start: ts('2099-01-01T00:00:00Z'),
      end: ts('2099-01-10T00:00:00Z'),
    },
    artists: [{ id: 'a1', name: '藝人甲' }],
    reservation: { url: 'https://example.com/reserve' },
  }));

async function mockReservations(page: Page, count: number) {
  await page.route('**/events/reservations', (route) =>
    route.fulfill({ json: { events: makeEvents(count), total: count } })
  );
}

// TC-017: Tab 到非目前頁的列時，Swiper 要自動換頁、焦點留在可視範圍內
for (const viewport of [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile 375px', width: 375, height: 812 },
]) {
  test(`TC-017 keyboard focus on a row of page 2 switches the page (${viewport.name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await mockReservations(page, 8);
    await page.goto('/');

    const section = page.getByRole('region', { name: '預約中・即將開放' });
    await expect(section.getByRole('link', { name: /預約活動 1/ })).toBeVisible();

    // 從第 1 頁最後一列（第 4 列）再 Tab 一次，焦點會落到第 2 頁第 1 列
    await section.getByRole('link', { name: /預約活動 4/ }).focus();
    await page.keyboard.press('Tab');

    const fifth = section.getByRole('link', { name: /預約活動 5/ });
    await expect(fifth).toBeFocused();
    await expect(fifth).toBeInViewport({ ratio: 0.99 });
    // The last page sits flush left and must not add an extra dot
    await expect(section.locator('.swiper-pagination-bullet')).toHaveCount(2);
    // Native focus scrolling alone can reveal the row; Swiper must also have moved to page 2
    await expect(
      section.locator('.swiper-slide-active').getByRole('link', { name: /預約活動 5/ })
    ).toBeVisible();
  });
}

test('TC-017 pages are narrower than the container so the next page peeks 32px (375px)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockReservations(page, 8);
  await page.goto('/');

  const section = page.getByRole('region', { name: '預約中・即將開放' });
  await expect(section.getByRole('link', { name: /預約活動 1/ })).toBeVisible();

  const box = async (selector: string) =>
    section.locator(selector).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, width: r.width };
    });
  const swiper = await box('.swiper');
  const first = await section
    .locator('.swiper-slide')
    .nth(0)
    .evaluate((el) => el.getBoundingClientRect().width);
  const secondLeft = await section
    .locator('.swiper-slide')
    .nth(1)
    .evaluate((el) => el.getBoundingClientRect().left);

  expect(first).toBeCloseTo(swiper.width - 32, 0);
  // second page starts inside the container, leaving about 32px of it visible
  expect(swiper.left + swiper.width - secondLeft).toBeGreaterThan(20);
  expect(swiper.left + swiper.width - secondLeft).toBeLessThanOrEqual(32);

  await section.locator('.swiper-pagination-bullet').nth(1).click();
  await expect(section.locator('.swiper-slide-active')).toContainText('預約活動 5');
  await page.waitForTimeout(500);
  const lastLeft = await section
    .locator('.swiper-slide')
    .nth(1)
    .evaluate((el) => el.getBoundingClientRect().left);
  const prevRight = await section
    .locator('.swiper-slide')
    .nth(0)
    .evaluate((el) => el.getBoundingClientRect().right);
  expect(Math.abs(lastLeft - swiper.left)).toBeLessThan(2);
  expect(prevRight).toBeLessThanOrEqual(swiper.left + 1);
  console.log(
    'MEASURE',
    JSON.stringify({
      container: swiper.width,
      firstSlide: first,
      peek: swiper.left + swiper.width - secondLeft,
      lastLeft,
      containerLeft: swiper.left,
    })
  );
});

test('loading skeleton reserves the pagination height so 5+ rows do not jump', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => (release = resolve));
  await page.route('**/events/reservations', async (route) => {
    await gate;
    await route.fulfill({ json: { events: makeEvents(8), total: 8 } });
  });
  await page.goto('/');

  const section = page.getByRole('region', { name: '預約中・即將開放' });
  await expect(section.getByTestId('reservation-skeleton-row').first()).toBeVisible();
  const loading = (await section.boundingBox())!.height;
  release();
  await expect(section.getByRole('link', { name: /預約活動 1/ })).toBeVisible();
  const loaded = (await section.boundingBox())!.height;
  console.log('HEIGHT', loading, loaded);
  expect(Math.abs(loaded - loading)).toBeLessThanOrEqual(3);
});
