/**
 * Formats a raw Haversine distance (meters) into the card's full display string
 * (2026-10 文案裁定：「距離你」前綴併入可見文字本身，取代先前的 sr-only-only 前綴，
 * 見 VenueCard.tsx 的 distanceInfo 渲染——不再需要額外的視覺隱藏節點)：
 * - < 100m            → "距離你 100 公尺內" (independent threshold, not a rounding
 *                        side-effect; note the space before "100", unlike the other
 *                        two tiers where "你" is immediately followed by "約")
 * - 100m – 999m        → "距離你約 N 公尺" (rounded to the nearest 100m)
 * - ≥ 1000m            → "距離你約 N 公里": km1 = meters rounded to 1 decimal km;
 *                        km1 < 10 → 1 decimal, ".0" dropped ("1 公里", "1.3 公里");
 *                        km1 ≥ 10 → whole km ("11 公里"; 9950m → km1 10.0 → "10 公里")
 *
 * The 100m-rounding step can itself roll a sub-1000m distance up to 1000 (e.g. 950–999m
 * → 1000m) — that case must render as "距離你約 1 公里", never "距離你約 1000 公尺".
 */
export function formatVenueDistance(meters: number): string {
  if (meters < 100) return '距離你 100 公尺內';

  const roundedToHundred = Math.round(meters / 100) * 100;
  if (meters < 1000 && roundedToHundred < 1000) {
    return `距離你約 ${roundedToHundred} 公尺`;
  }

  const km1 = Math.round(meters / 100) / 10;
  if (km1 >= 10) return `距離你約 ${Math.round(meters / 1000)} 公里`;
  return `距離你約 ${km1} 公里`;
}
