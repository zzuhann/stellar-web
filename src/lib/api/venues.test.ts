import { describe, expect, it, vi } from 'vitest';
import api from './client';
import { venueSubmissionApi } from './venues';

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
