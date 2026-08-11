import type { Locator } from '@playwright/test';

/**
 * 取某個具名區塊（role="region" / role="list"）裡的第一張卡片連結。
 *
 * 沿用專案既有的 role + aria-label 慣例當作區塊錨點，卡片一律是區塊內的第一個
 * <a>（getByRole('link').first()）。只抓「第一筆」、不寫死 slug / id / 店名 / 順序以外的資料。
 *
 * @example
 *   firstCard(page.getByRole('region', { name: '場地列表' }))
 *   firstCard(page.getByRole('list', { name: '隨機推薦場地' }))
 */
export function firstCard(scope: Locator): Locator {
  return scope.getByRole('link').first();
}
