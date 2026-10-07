import { describe, expect, it } from 'vitest';
import { redactCoordsFromQueryString, redactCoordsFromUrl } from './privacyRedaction';

// 對應 Codex 第一輪 code review P1：venueApi.getVenues 送出的 lat/lng 會被 Sentry 的
// breadcrumb/span 原封不動帶走。這份遮蔽邏輯獨立於後端 stellar/src/utils/privacyRedaction.ts
// （同一套規則，各自維護，不跨 repo 共用），用於 src/lib/sentryRedaction.ts。
describe('redactCoordsFromUrl', () => {
  it('遮蔽 lat/lng 值，其餘參數（如 region）維持原樣', () => {
    const result = redactCoordsFromUrl(
      'https://api.stellar-zone.com/venues?sort=distance&lat=25.033&lng=121.564&region=台北'
    );
    expect(result).toContain('lat=REDACTED');
    expect(result).toContain('lng=REDACTED');
    expect(result).not.toContain('25.033');
    expect(result).not.toContain('121.564');
    expect(result).toContain('region=');
    expect(result).toContain('sort=distance');
    expect(result).toContain('https://api.stellar-zone.com');
  });

  it('不含 lat/lng 的 URL 不受影響，無多餘替換痕跡', () => {
    const original = `/venues?sort=composite&region=${encodeURIComponent('台北')}`;
    const result = redactCoordsFromUrl(original);
    expect(result).toBe(original);
  });

  it('沒有 query string 的 URL 原樣返回', () => {
    expect(redactCoordsFromUrl('/venues')).toBe('/venues');
  });

  it('不含座標的畸形 query（如 lat=%）不丟例外', () => {
    const malformed = '/venues?sort=composite&region=台北&lat=%';
    expect(() => redactCoordsFromUrl(malformed)).not.toThrow();
  });

  it.each([
    ['大寫 LAT/LNG', '/venues?LAT=25.033&LNG=121.564'],
    ['混合大小寫 Lat/Lng', '/venues?Lat=25.033&Lng=121.564'],
    ['percent-encoded key（%4Cat＝Lat）', '/venues?%4Cat=25.033&lng=121.564'],
  ])('%s 也會被遮蔽', (_label, url) => {
    const result = redactCoordsFromUrl(url);
    expect(result).not.toContain('25.033');
    expect(result).not.toContain('121.564');
    expect(result.toLowerCase()).toContain('redacted');
  });

  it('無法解析的 URL（如畸形的 scheme）時，fail closed 捨棄整段 query，不輸出原始座標', () => {
    const malformed = 'http://[::1/venues?lat=25.033&lng=121.564';
    const result = redactCoordsFromUrl(malformed);
    expect(result).not.toContain('25.033');
    expect(result).not.toContain('121.564');
    expect(result).not.toContain('?');
  });
});

describe('redactCoordsFromQueryString', () => {
  it('遮蔽帶開頭 ? 的 query string，保留其他參數與開頭 ?', () => {
    const result = redactCoordsFromQueryString('?lat=25.033&lng=121.564&region=台北');
    expect(result.startsWith('?')).toBe(true);
    expect(result).toContain('lat=REDACTED');
    expect(result).toContain('lng=REDACTED');
    expect(result).not.toContain('25.033');
    expect(result).toContain('region=');
  });

  it('遮蔽不帶開頭 ? 的 query string，輸出也不帶開頭 ?', () => {
    const result = redactCoordsFromQueryString('lat=25.033&lng=121.564');
    expect(result.startsWith('?')).toBe(false);
    expect(result).not.toContain('25.033');
  });

  it('不含座標的 query string 維持原參數不變', () => {
    const encoded = `?region=${encodeURIComponent('台北')}&sort=composite`;
    expect(redactCoordsFromQueryString(encoded)).toBe(encoded);
  });

  it('大小寫不分：?LAT=... 也會被遮蔽', () => {
    const result = redactCoordsFromQueryString('?LAT=25.033&LNG=121.564');
    expect(result).not.toContain('25.033');
    expect(result.toLowerCase()).toContain('redacted');
  });

  it('空字串輸入回傳空字串', () => {
    expect(redactCoordsFromQueryString('')).toBe('');
  });
});
