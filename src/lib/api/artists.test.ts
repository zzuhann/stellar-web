import { describe, it, expect, vi } from 'vitest';
import { artistsApi } from './artists';
import api from './client';

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('artistsApi.getById', () => {
  it('createdAt 為 Firestore Timestamp 序列化物件時，應轉換為對應的 ISO 字串', async () => {
    const seconds = 1777669329;
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        id: 'artist-1',
        status: 'approved',
        createdBy: 'user-1',
        createdAt: { _seconds: seconds, _nanoseconds: 0 },
        updatedAt: { _seconds: seconds, _nanoseconds: 0 },
      },
    });

    const result = await artistsApi.getById('artist-1');

    expect(result.createdAt).toBe(new Date(seconds * 1000).toISOString());
    expect(result.updatedAt).toBe(new Date(seconds * 1000).toISOString());
  });

  it('createdAt 缺失時，應 fallback 為合法的 ISO 字串', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        id: 'artist-2',
        status: 'approved',
        createdBy: 'user-1',
        createdAt: undefined,
        updatedAt: undefined,
      },
    });

    const result = await artistsApi.getById('artist-2');

    expect(() => new Date(result.createdAt)).not.toThrow();
    expect(new Date(result.createdAt).toISOString()).toBe(result.createdAt);
    expect(new Date(result.updatedAt).toISOString()).toBe(result.updatedAt);
  });
});
