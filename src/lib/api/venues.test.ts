import { describe, expect, it, vi } from 'vitest';
import api from './client';
import { venueApi, venueSubmissionApi } from './venues';

vi.mock('./client', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

describe('venueSubmissionApi', () => {
  it('使用專用公開端點投稿及搜尋地點', async () => {
    vi.mocked(api.post)
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: { predictions: [{ place_id: 'place-1' }] } });
    vi.mocked(api.get).mockResolvedValueOnce({ data: { name: '測試場地' } });

    await venueSubmissionApi.create({ name: '測試場地', address: '測試地址', region: '台北' });
    const predictions = await venueSubmissionApi.autocomplete('測試');
    const details = await venueSubmissionApi.getPlaceDetails('place-1');

    expect(api.post).toHaveBeenNthCalledWith(1, '/venue-submissions', {
      name: '測試場地',
      address: '測試地址',
      region: '台北',
    });
    expect(api.post).toHaveBeenNthCalledWith(2, '/venue-submissions/places/autocomplete', {
      input: '測試',
    });
    expect(api.get).toHaveBeenCalledWith('/venue-submissions/places/place-1');
    expect(predictions).toEqual([{ place_id: 'place-1' }]);
    expect(details).toEqual({ name: '測試場地' });
  });
});

describe('venueApi', () => {
  it('送出首頁 random 10 查詢參數', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { venues: [] } });

    await venueApi.getVenues({ sort: 'random', limit: 10 });

    expect(api.get).toHaveBeenCalledWith('/venues?sort=random&limit=10');
  });

  it('送出 search 與 page 查詢參數', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { venues: [] } });

    await venueApi.getVenues({ search: 'ABC Mart', page: 2, limit: 20 });

    expect(api.get).toHaveBeenCalledWith('/venues?search=ABC+Mart&page=2&limit=20');
  });

  it('未帶 search 時不附加 search 參數', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { venues: [] } });

    await venueApi.getVenues({ search: '', page: 1 });

    expect(api.get).toHaveBeenCalledWith('/venues?page=1');
  });

  it('sort 為 composite 時原樣送出（Phase 2.8：後端新預設，型別已支援）', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { venues: [] } });

    await venueApi.getVenues({ sort: 'composite', page: 1, limit: 20 });

    expect(api.get).toHaveBeenCalledWith('/venues?sort=composite&page=1&limit=20');
  });

  it('sort 為 undefined 時不附加 sort 參數（Phase 2.8：VenuesClient 選擇綜合排序時的既有慣例）', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { venues: [] } });

    await venueApi.getVenues({ sort: undefined, page: 1, limit: 20 });

    expect(api.get).toHaveBeenCalledWith('/venues?page=1&limit=20');
  });
});
