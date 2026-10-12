import { describe, expect, it, vi } from 'vitest';
import api from './client';
import { venueApi } from './venues';

vi.mock('./client', () => ({
  default: { post: vi.fn() },
}));

describe('venueApi place reselect', () => {
  it('preview 只送 placeId 到 admin 端點', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { placeId: 'p' } });

    const result = await venueApi.previewPlaceReselect('v1', 'ChIJabcdefghij');

    expect(api.post).toHaveBeenCalledWith('/venues/admin/v1/place-reselect/preview', {
      placeId: 'ChIJabcdefghij',
    });
    expect(result).toEqual({ placeId: 'p' });
  });

  it('apply 送出 placeId 與 addressChoice，回傳寫入結果', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { linkedCount: 2 } });

    const result = await venueApi.applyPlaceReselect('v1', {
      placeId: 'ChIJabcdefghij',
      addressChoice: 'google',
    });

    expect(api.post).toHaveBeenCalledWith('/venues/admin/v1/place-reselect', {
      placeId: 'ChIJabcdefghij',
      addressChoice: 'google',
    });
    expect(result).toEqual({ linkedCount: 2 });
  });
});
