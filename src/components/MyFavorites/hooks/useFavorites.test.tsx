import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usersApi } from '@/lib/api';
import { useFavorites } from './useFavorites';
import type { FavoritesResponse } from '@/types';
vi.mock('@/lib/api', () => ({ usersApi: { favorites: { getAll: vi.fn() } } }));
const page = (id: string, page: number): FavoritesResponse => ({
  favorites: [{ event: { id } } as FavoritesResponse['favorites'][number]],
  pagination: { page, totalPages: 2, total: 101, limit: 100 },
});
function setup(uid: string | undefined = 'user-1') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderHook(({ userId }) => useFavorites(userId), {
    initialProps: { userId: uid },
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
}
beforeEach(() => {
  vi.mocked(usersApi.favorites.getAll).mockReset();
});
describe('complete favorites query', () => {
  it('讀齊後頁的活動', async () => {
    vi.mocked(usersApi.favorites.getAll)
      .mockResolvedValueOnce(page('first', 1))
      .mockResolvedValueOnce(page('last', 2));
    const { result } = setup();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.map((item) => item.event.id)).toEqual(['first', 'last']);
    expect(usersApi.favorites.getAll).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2, limit: 100 })
    );
  });
  it('後頁失敗不顯示半份清單', async () => {
    vi.mocked(usersApi.favorites.getAll)
      .mockResolvedValueOnce(page('first', 1))
      .mockRejectedValueOnce(new Error('network'));
    const { result } = setup();
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
  it('未登入不查詢，切換帳號不顯示前一人的資料', async () => {
    const { result, rerender } = setup('');
    expect(usersApi.favorites.getAll).not.toHaveBeenCalled();
    vi.mocked(usersApi.favorites.getAll).mockResolvedValue({
      ...page('private', 1),
      pagination: { page: 1, totalPages: 1, total: 1, limit: 100 },
    });
    rerender({ userId: 'user-1' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    vi.mocked(usersApi.favorites.getAll).mockImplementation(() => new Promise(() => {}));
    rerender({ userId: 'user-2' });
    expect(result.current.data).toBeUndefined();
  });
});
