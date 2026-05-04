import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useMapPageData from './useMapPageData';
import { useArtist } from '@/hooks/useArtist';
import { useMapData } from '@/hooks/useMapData';
import type { Artist } from '@/types';
import type { UseQueryResult } from '@tanstack/react-query';

vi.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
}));

vi.mock('@/hooks/useArtist');
vi.mock('@/hooks/useMapData');

const mockArtist = (overrides: Partial<Artist> = {}): Artist => ({
  id: 'firestore-id-123',
  slug: 'bts',
  stageName: 'BTS',
  status: 'approved',
  createdBy: 'user1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

const artistLoading = {
  data: undefined,
  isLoading: true,
  isPending: true,
  isError: false,
  error: null,
} as unknown as UseQueryResult<Artist, Error>;

const artistLoaded = (artist: Artist) =>
  ({
    data: artist,
    isLoading: false,
    isPending: false,
    isError: false,
    error: null,
  }) as unknown as UseQueryResult<Artist, Error>;

const mapDataIdle = {
  data: undefined,
  isLoading: false,
} as unknown as ReturnType<typeof useMapData>;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useMapData).mockReturnValue(mapDataIdle);
});

describe('useMapPageData', () => {
  describe('沒有指定 artistId', () => {
    it('map data 查詢應立刻啟用', () => {
      vi.mocked(useArtist).mockReturnValue(artistLoading);

      renderHook(() => useMapPageData({}));

      expect(vi.mocked(useMapData)).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: true })
      );
    });

    it('artistId 不傳給 map data', () => {
      vi.mocked(useArtist).mockReturnValue(artistLoading);

      renderHook(() => useMapPageData({}));

      expect(vi.mocked(useMapData)).toHaveBeenCalledWith(
        expect.objectContaining({ artistId: undefined })
      );
    });
  });

  describe('有 artistId 且 artist 還在載入', () => {
    it('map data 查詢應暫停（enabled: false）', () => {
      vi.mocked(useArtist).mockReturnValue(artistLoading);

      renderHook(() => useMapPageData({ propsArtistId: 'bts' }));

      expect(vi.mocked(useMapData)).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false })
      );
    });
  });

  describe('有 artistId 且 artist 載入完成', () => {
    it('map data 查詢應使用 artist.id（Firestore ID），而非 slug', () => {
      vi.mocked(useArtist).mockReturnValue(artistLoaded(mockArtist()));

      renderHook(() => useMapPageData({ propsArtistId: 'bts' }));

      expect(vi.mocked(useMapData)).toHaveBeenCalledWith(
        expect.objectContaining({
          artistId: 'firestore-id-123',
          enabled: true,
        })
      );
    });

    it('即使 propsArtistId 傳的是 Firestore ID，map data 仍使用解析後的 artist.id', () => {
      vi.mocked(useArtist).mockReturnValue(artistLoaded(mockArtist()));

      renderHook(() => useMapPageData({ propsArtistId: 'firestore-id-123' }));

      expect(vi.mocked(useMapData)).toHaveBeenCalledWith(
        expect.objectContaining({
          artistId: 'firestore-id-123',
          enabled: true,
        })
      );
    });

    it('artist 沒有 slug 時（舊資料），map data 仍使用 artist.id', () => {
      vi.mocked(useArtist).mockReturnValue(artistLoaded(mockArtist({ slug: undefined })));

      renderHook(() => useMapPageData({ propsArtistId: 'firestore-id-123' }));

      expect(vi.mocked(useMapData)).toHaveBeenCalledWith(
        expect.objectContaining({
          artistId: 'firestore-id-123',
          enabled: true,
        })
      );
    });
  });

  describe('回傳值', () => {
    it('回傳 artistData', () => {
      const artist = mockArtist();
      vi.mocked(useArtist).mockReturnValue(artistLoaded(artist));

      const { result } = renderHook(() => useMapPageData({ propsArtistId: 'bts' }));

      expect(result.current.artistData).toEqual(artist);
    });

    it('mapEvents 預設為空陣列', () => {
      vi.mocked(useArtist).mockReturnValue(artistLoading);

      const { result } = renderHook(() => useMapPageData({ propsArtistId: 'bts' }));

      expect(result.current.mapEvents).toEqual([]);
    });
  });
});
