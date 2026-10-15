import { test, expect } from '@playwright/test';
import { firstCard } from '../helpers/cards';
import { expectImageLoaded } from '../helpers/images';

/**
 * 場地詳情頁 /venues/[id]。
 *
 * ── 外部連結測試慣例 ──
 * Google Maps / IG / Threads 是第三方網站，regression 只驗「href 格式 + target=_blank + rel 含 noopener」，
 * 不實際點出去、不對第三方發 request，避免測試依賴他人網站的可用性。
 *
 * ── PINNED 範例場地 ──
 * 用「Stan Cafe」做精確斷言（同時具備 地址 / IG 社群 / IG 聯繫管道）。
 * 另有一組不綁定特定場地的 dynamic 測試，資料變動也不會壞。
 */

// PINNED 資料：2026-07-21 於正式站確認存在且完整（Stan Cafe，IG stancafe0808，Google Maps 連結正常）。
// 此場地若下架或大改資料，下方 PINNED 測試需更新（換一個 id，或改預期值）。
const PINNED = {
  id: 'rGOOz9KTz3AikBkvDB8W',
  name: 'Stan Cafe',
  instagramUrl: 'https://www.instagram.com/stancafe0808',
};

test.describe('場地詳情 — PINNED 範例（Stan Cafe）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/venues/${PINNED.id}`);
    await expect(
      page.getByRole('heading', { name: PINNED.name, exact: true }),
      `PINNED 場地「${PINNED.name}」詳情頁標題應出現；若此處失敗，很可能是該場地已下架，需更新 PINNED 常數`
    ).toBeVisible({ timeout: 15_000 });
  });

  // @scenario E-1
  test('場地詳情：主圖應非破圖，且基本資訊區應顯示「容納人數」與「生日應援紀錄」', async ({
    page,
  }) => {
    await expectImageLoaded(page.locator('img[alt*="場地照片"]').first(), '場地主圖');

    const info = page.getByRole('region', { name: '基本資訊' });
    await expect(info, '場地詳情應有「基本資訊」區塊，但找不到').toBeVisible();
    // 用 exact 避免撞到相關場地卡片裡的同名文字（卡片會顯示「生日應援紀錄 N」）
    await expect(
      page.getByText('容納人數', { exact: true }),
      '場地詳情應顯示「容納人數」統計，但找不到'
    ).toBeVisible();
    await expect(
      page.getByText('生日應援紀錄', { exact: true }),
      '場地詳情應顯示「生日應援紀錄」統計，但找不到'
    ).toBeVisible();
  });

  // @scenario E-3
  test('場地詳情：地址應提供 Google Maps 外部連結（新分頁開啟、rel 含 noopener）', async ({
    page,
  }) => {
    const mapLink = page
      .getByRole('region', { name: '基本資訊' })
      .locator('a[href*="google.com/maps"]');
    await expect(mapLink, '基本資訊區應有指向 Google Maps 的地址連結，但找不到').toBeVisible();
    await expect(
      mapLink,
      'Google Maps 連結 href 應為 https://www.google.com/maps/search 格式'
    ).toHaveAttribute('href', /^https:\/\/www\.google\.com\/maps\/search/);
    await expect(mapLink, 'Google Maps 連結應以新分頁開啟(target=_blank)').toHaveAttribute(
      'target',
      '_blank'
    );
    await expect(mapLink, 'Google Maps 連結的 rel 應含 noopener（安全性）').toHaveAttribute(
      'rel',
      /noopener/
    );
  });

  // @scenario E-4
  test('場地詳情：社群連結（此例為 IG）應指向正確外部帳號並以新分頁開啟', async ({ page }) => {
    const socialLink = page
      .getByRole('region', { name: '基本資訊' })
      .locator('a[href*="instagram.com"], a[href*="threads"]');
    await expect(socialLink, '基本資訊區應有社群連結(IG / Threads)，但找不到').toBeVisible();
    await expect(
      socialLink,
      `PINNED 場地(${PINNED.name})的社群連結 href 應為 ${PINNED.instagramUrl}`
    ).toHaveAttribute('href', PINNED.instagramUrl);
    await expect(socialLink, '社群連結應以新分頁開啟(target=_blank)').toHaveAttribute(
      'target',
      '_blank'
    );
  });

  // @scenario E-5
  test('場地詳情：「聯繫這個場地」應依場地偏好導向正確外部管道（此例為 IG）', async ({ page }) => {
    const contact = page.getByRole('region', { name: '聯繫這個場地' }).getByRole('link');
    await expect(contact, '應有「聯繫這個場地」區塊的聯繫連結，但找不到').toBeVisible();
    await expect(
      contact,
      `PINNED 場地 preferredContact=instagram，聯繫連結應導向 ${PINNED.instagramUrl}`
    ).toHaveAttribute('href', PINNED.instagramUrl);
    await expect(contact, '聯繫連結應以新分頁開啟(target=_blank)').toHaveAttribute(
      'target',
      '_blank'
    );
  });

  // @scenario E-10
  test('場地詳情：頂部 breadcrumb「全部場地」應返回場地列表 /venues', async ({ page }) => {
    await page
      .getByRole('navigation', { name: 'breadcrumb' })
      .getByRole('link', { name: '全部場地' })
      .click();
    await expect(page, '點 breadcrumb「全部場地」後應回到 /venues').toHaveURL(/\/venues$/);
  });

  // @scenario E-10
  test('場地詳情：底部返回場地列表的連結應導向 /venues', async ({ page }) => {
    // 底部返回連結文案會依「是否有相關場地」而不同：
    //   有相關場地 → RelatedVenuesStrip 的「查看全部」；無相關場地 → fallback 的「查看全部場地」。
    // 兩者都是 href="/venues"，用「查看全部」前綴一次涵蓋，並排除 breadcrumb 的「全部場地」。
    const bottomLink = page
      .locator('a[href="/venues"]')
      .filter({ hasText: /查看全部/ })
      .first();
    await expect(
      bottomLink,
      '場地詳情底部應有一個返回場地列表的連結（查看全部 / 查看全部場地），但找不到'
    ).toBeVisible();
    await bottomLink.click();
    await expect(page, '點底部返回連結後應回到 /venues').toHaveURL(/\/venues$/);
  });
});

test.describe('場地詳情 — dynamic（不綁定特定場地）', () => {
  // @scenario E-3, E-4, E-5
  test('場地詳情（動態）：從列表點第一張卡進詳情，地址 / 社群 / 聯繫的外部連結格式與 target 應正確', async ({
    page,
  }) => {
    await page.goto('/venues');
    const card = firstCard(page.getByRole('region', { name: '場地列表' }));
    await expect(card, '場地列表應至少有一張卡片，但找不到').toBeVisible({ timeout: 15_000 });
    await card.click();
    await expect(page, '點卡片後應進入 /venues/[id]').toHaveURL(/\/venues\/.+/);

    // 地址一定存在 → 一定要能導去 Google Maps 且開新分頁
    const mapLink = page
      .getByRole('region', { name: '基本資訊' })
      .locator('a[href*="google.com/maps"]');
    await expect(mapLink, '每個場地都有地址，應能導去 Google Maps，但找不到地圖連結').toBeVisible({
      timeout: 15_000,
    });
    await expect(mapLink, 'Google Maps 連結應以新分頁開啟(target=_blank)').toHaveAttribute(
      'target',
      '_blank'
    );

    // 社群連結為選填：若存在，必須是外部連結且開新分頁（不驗特定帳號）
    const socialLink = page
      .getByRole('region', { name: '基本資訊' })
      .locator('a[href*="instagram.com"], a[href*="threads"]');
    if (await socialLink.count()) {
      await expect(
        socialLink.first(),
        '社群連結(選填)存在時，href 應為 http(s) 外部連結'
      ).toHaveAttribute('href', /^https?:\/\//);
      await expect(socialLink.first(), '社群連結應以新分頁開啟(target=_blank)').toHaveAttribute(
        'target',
        '_blank'
      );
    }

    // 聯繫管道為選填：若存在，必須是外部連結且開新分頁
    const contact = page.getByRole('region', { name: '聯繫這個場地' }).getByRole('link');
    if (await contact.count()) {
      await expect(
        contact.first(),
        '聯繫管道(選填)存在時，href 應為 http(s) 外部連結'
      ).toHaveAttribute('href', /^https?:\/\//);
      await expect(contact.first(), '聯繫連結應以新分頁開啟(target=_blank)').toHaveAttribute(
        'target',
        '_blank'
      );
    }
  });
});
