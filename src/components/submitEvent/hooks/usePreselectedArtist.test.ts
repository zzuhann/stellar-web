import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import usePreselectedArtist from './usePreselectedArtist';
import { useArtist } from '@/hooks/useArtist';
import type { Artist } from '@/types';

vi.mock('@/hooks/useArtist', () => ({ useArtist: vi.fn() }));

const useArtistMock = vi.mocked(useArtist);

const buildArtist = (overrides: Partial<Artist> = {}): Artist =>
  ({ id: 'artist-1', stageName: 'ALPHA', status: 'approved', ...overrides }) as Artist;

function mockQuery(state: { data?: Artist; isSuccess?: boolean; isError?: boolean }) {
  useArtistMock.mockReturnValue({
    data: state.data,
    isSuccess: state.isSuccess ?? false,
    isError: state.isError ?? false,
  } as ReturnType<typeof useArtist>);
}

beforeEach(() => {
  mockQuery({});
});

describe('usePreselectedArtist', () => {
  it('TC-005 approved 藝人載入完成後套用一次預選', () => {
    const onPreselect = vi.fn();
    const artist = buildArtist();
    mockQuery({});
    const { rerender } = renderHook(() =>
      usePreselectedArtist({ artistId: 'artist-1', onPreselect })
    );
    expect(onPreselect).not.toHaveBeenCalled();

    mockQuery({ data: artist, isSuccess: true });
    rerender();
    rerender();

    expect(onPreselect).toHaveBeenCalledTimes(1);
    expect(onPreselect).toHaveBeenCalledWith(artist);
  });

  it('TC-011 藝人非 approved（pending / rejected / exists）靜默忽略', () => {
    for (const status of ['pending', 'rejected', 'exists'] as const) {
      const onPreselect = vi.fn();
      mockQuery({ data: buildArtist({ status }), isSuccess: true });
      renderHook(() => usePreselectedArtist({ artistId: 'artist-1', onPreselect }));
      expect(onPreselect).not.toHaveBeenCalled();
    }
  });

  it('TC-011 / TC-012 藝人不存在或查詢失敗（網路錯誤 / 500）靜默忽略，不丟例外', () => {
    const onPreselect = vi.fn();
    mockQuery({ isError: true });

    expect(() =>
      renderHook(() => usePreselectedArtist({ artistId: 'artist-1', onPreselect }))
    ).not.toThrow();
    expect(onPreselect).not.toHaveBeenCalled();
  });

  it('TC-018 artistId 為空字串或未提供：不預選', () => {
    const onPreselect = vi.fn();
    mockQuery({});

    renderHook(() => usePreselectedArtist({ artistId: '', onPreselect }));
    renderHook(() => usePreselectedArtist({ artistId: undefined, onPreselect }));

    expect(useArtistMock).toHaveBeenCalledWith('');
    expect(onPreselect).not.toHaveBeenCalled();
  });

  it('TC-016 載入完成前使用者已手動變更選擇：查詢成功也放棄預選', () => {
    const onPreselect = vi.fn();
    mockQuery({});
    const { result, rerender } = renderHook(() =>
      usePreselectedArtist({ artistId: 'artist-1', onPreselect })
    );

    act(() => result.current.markUserChanged());
    mockQuery({ data: buildArtist(), isSuccess: true });
    rerender();

    expect(onPreselect).not.toHaveBeenCalled();
  });

  it('TC-016 載入完成前使用者已手動變更選擇：查詢失敗也維持放棄', () => {
    const onPreselect = vi.fn();
    mockQuery({});
    const { result, rerender } = renderHook(() =>
      usePreselectedArtist({ artistId: 'artist-1', onPreselect })
    );

    act(() => result.current.markUserChanged());
    mockQuery({ isError: true });
    rerender();

    expect(onPreselect).not.toHaveBeenCalled();
  });

  it('TC-017 預選套用後使用者的變更不會讓預選再次套用', () => {
    const onPreselect = vi.fn();
    mockQuery({ data: buildArtist(), isSuccess: true });
    const { result, rerender } = renderHook(() =>
      usePreselectedArtist({ artistId: 'artist-1', onPreselect })
    );
    expect(onPreselect).toHaveBeenCalledTimes(1);

    act(() => result.current.markUserChanged());
    rerender();

    expect(onPreselect).toHaveBeenCalledTimes(1);
  });
});
