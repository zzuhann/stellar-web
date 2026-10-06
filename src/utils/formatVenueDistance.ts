/**
 * Formats a raw Haversine distance (meters) into the three-tier display string defined
 * by requirements.md:
 * - < 100m            → "100 公尺內" (independent threshold, not a rounding side-effect)
 * - 100m – 999m        → "約 N 公尺" (rounded to the nearest 100m)
 * - ≥ 1000m            → "N.N 公里" (rounded to 1 decimal place)
 *
 * The 100m-rounding step can itself roll a sub-1000m distance up to 1000 (e.g. 950–999m
 * → 1000m) — that case must render as "1.0 公里", never "約 1000 公尺".
 */
export function formatVenueDistance(meters: number): string {
  if (meters < 100) return '100 公尺內';

  const roundedToHundred = Math.round(meters / 100) * 100;
  if (meters < 1000 && roundedToHundred < 1000) {
    return `約 ${roundedToHundred} 公尺`;
  }

  const km = Math.round(meters / 100) / 10;
  return `${km.toFixed(1)} 公里`;
}
