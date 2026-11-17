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
    // Native focus scrolling alone can reveal the row; Swiper must also have moved to page 2
    await expect(
      section.locator('.swiper-slide-active').getByRole('link', { name: /預約活動 5/ })
    ).toBeVisible();
  });
}
