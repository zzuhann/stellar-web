import { expect, type Locator } from '@playwright/test';

/**
 * 斷言圖片實際載入成功（naturalWidth > 0），亦即「非破圖」。
 *
 * naturalWidth 只有在瀏覽器真的把圖片解碼載入後才會 > 0；破圖 / 404 / 尚未載入時為 0。
 * 失敗訊息會帶上呼叫端給的 label，方便工程師直接看懂是哪張圖破了。
 *
 * @param img   指向 <img> 的 Locator
 * @param label 這張圖在畫面上的角色（會出現在失敗訊息裡）
 */
export async function expectImageLoaded(img: Locator, label = '圖片'): Promise<void> {
  await expect(img, `${label} 應該可見，但目前找不到或不可見`).toBeVisible();
  await expect
    .poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth), {
      timeout: 10_000,
      message: `${label} 的 naturalWidth 應該 > 0（代表圖片實際載入成功、非破圖），但讀到 0`,
    })
    .toBeGreaterThan(0);
}
