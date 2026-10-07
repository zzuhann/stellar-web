import { describe, expect, it } from 'vitest';
import { haversineDistanceMeters, isMissingVenueCoords, roundCoordinate } from './geo';

// qa.md 情境 14：Haversine 計算
describe('haversineDistanceMeters', () => {
  it('同一點距離為 0', () => {
    expect(
      haversineDistanceMeters({ lat: 25.033, lng: 121.5654 }, { lat: 25.033, lng: 121.5654 })
    ).toBe(0);
  });

  it('台北101 到台北車站約 5146.2m，落在 5140–5155 公尺區間', () => {
    const distance = haversineDistanceMeters(
      { lat: 25.033, lng: 121.5654 },
      { lat: 25.0478, lng: 121.517 }
    );
    expect(distance).toBeGreaterThanOrEqual(5140);
    expect(distance).toBeLessThanOrEqual(5155);
  });

  it('對稱：a→b 與 b→a 距離相同', () => {
    const a = { lat: 25.033, lng: 121.5654 };
    const b = { lat: 25.0478, lng: 121.517 };
    expect(haversineDistanceMeters(a, b)).toBe(haversineDistanceMeters(b, a));
  });

  it('跨 180 度經線不產生 NaN 或負數（經度 179 到 -179 應為小距離）', () => {
    const distance = haversineDistanceMeters({ lat: 0, lng: 179 }, { lat: 0, lng: -179 });
    expect(Number.isNaN(distance)).toBe(false);
    expect(distance).toBeGreaterThanOrEqual(0);
    // 2 度經差在赤道約 222km，不應被誤算成繞地球一圈的距離（約 20000km+）
    expect(distance).toBeLessThan(300000);
  });
});

// qa.md 情境 15：isMissingVenueCoords 與後端邏輯逐項對齊
describe('isMissingVenueCoords', () => {
  it('undefined/null 視為缺值', () => {
    expect(isMissingVenueCoords(undefined, undefined)).toBe(true);
    expect(isMissingVenueCoords(null, null)).toBe(true);
    expect(isMissingVenueCoords(null, 121.5)).toBe(true);
    expect(isMissingVenueCoords(25, undefined)).toBe(true);
  });

  it('NaN/Infinity 視為缺值', () => {
    expect(isMissingVenueCoords(NaN, 121.5)).toBe(true);
    expect(isMissingVenueCoords(25, Infinity)).toBe(true);
  });

  it('lat=0, lng=0 視為缺值（null island 佔位座標）', () => {
    expect(isMissingVenueCoords(0, 0)).toBe(true);
  });

  it('只有一個為 0 時視為有效座標，不視為缺值', () => {
    expect(isMissingVenueCoords(0, 121.5)).toBe(false);
    expect(isMissingVenueCoords(25, 0)).toBe(false);
  });

  it('合法座標視為有效', () => {
    expect(isMissingVenueCoords(25.033, 121.5654)).toBe(false);
  });
});

// qa.md 情境 16：座標四捨五入至小數第 3 位
describe('roundCoordinate', () => {
  it('四捨五入到小數第 3 位', () => {
    expect(roundCoordinate(25.0330123)).toBe(25.033);
    expect(roundCoordinate(121.56449)).toBe(121.564);
    expect(roundCoordinate(121.5645)).toBe(121.565); // half-up
  });

  it('已是 3 位小數或更少位數時維持原值', () => {
    expect(roundCoordinate(25.03)).toBe(25.03);
    expect(roundCoordinate(25)).toBe(25);
  });
});
