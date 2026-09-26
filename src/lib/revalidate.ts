// 任何會改變公開可見資料（已核准活動/藝人、上架中場地）的 mutation，成功後呼叫這個函式
// 清掉全部公開頁的 ISR 快取。決策見 specs/_decisions/isr-cache-invalidation.md：
// 清全部而非精準列路徑，避免新功能漏清；fire-and-forget，失敗不能讓 mutation 失敗。
export function revalidatePublicPages(): void {
  fetch('/api/revalidate', { method: 'POST' }).catch(() => {
    // 清快取失敗不影響 mutation 本身，靜默吞掉即可
  });
}
