import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { sendGAEvent } from '@next/third-parties/google';
import { usersApi } from '@/lib/api';
import toast from '@/lib/toast';
import { useFavoriteToggle } from './useFavoriteToggle';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@next/third-parties/google', () => ({ sendGAEvent: vi.fn() }));
vi.mock('@/lib/firebase', () => ({ auth: { currentUser: { uid: 'user-1' } } }));
vi.mock('@/lib/api', () => ({
  usersApi: { favorites: { add: vi.fn(), remove: vi.fn() } },
}));
vi.mock('@/lib/toast', () => ({
  default: { dismiss: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

function renderToggle() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return renderHook(() => useFavoriteToggle(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('useFavoriteToggle GA tracking', () => {
  beforeEach(() => {
    vi.mocked(usersApi.favorites.add).mockReset();
    vi.mocked(usersApi.favorites.remove).mockReset();
  });

  it('API 成功才送 add_to_favorite，user_id 取 Firebase 目前登入者（涵蓋登入後自動收藏路徑）', async () => {
    vi.mocked(usersApi.favorites.add).mockResolvedValue(undefined as never);
    const { result } = renderToggle();

    result.current.mutate({ eventId: 'evt-1', isFavorited: false });

    await waitFor(() =>
      expect(sendGAEvent).toHaveBeenCalledWith('event', 'add_to_favorite', {
        event_page: '/event/[id]',
        user_id: 'user-1',
        content_id: 'evt-1',
      })
    );
  });

  it('取消收藏成功送 remove_from_favorite', async () => {
    vi.mocked(usersApi.favorites.remove).mockResolvedValue(undefined as never);
    const { result } = renderToggle();

    result.current.mutate({ eventId: 'evt-1', isFavorited: true });

    await waitFor(() =>
      expect(sendGAEvent).toHaveBeenCalledWith(
        'event',
        'remove_from_favorite',
        expect.objectContaining({ content_id: 'evt-1' })
      )
    );
  });

  it('API 失敗時不送任何收藏事件', async () => {
    vi.mocked(usersApi.favorites.add).mockRejectedValue(new Error('network'));
    const { result } = renderToggle();

    result.current.mutate({ eventId: 'evt-1', isFavorited: false });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(sendGAEvent).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});

it('成功通知提供查看，點擊前往清單', async () => {
  vi.mocked(usersApi.favorites.add).mockResolvedValue(undefined as never);
  const { result } = renderToggle();
  result.current.mutate({ eventId: 'evt-1', isFavorited: false });
  await waitFor(() =>
    expect(toast.success).toHaveBeenCalledWith(
      '已加入「我想去」',
      expect.objectContaining({ action: expect.objectContaining({ label: '查看' }) })
    )
  );
  const options = vi.mocked(toast.success).mock.calls[0][1];
  if (options?.action && typeof options.action === 'object' && 'onClick' in options.action) {
    options.action.onClick({} as React.MouseEvent<HTMLButtonElement>);
  }
  expect(push).toHaveBeenCalledWith('/my-favorite');
});

it('移除通知不提供查看', async () => {
  vi.mocked(usersApi.favorites.remove).mockResolvedValue(undefined as never);
  const { result } = renderToggle();
  result.current.mutate({ eventId: 'evt-1', isFavorited: true });
  await waitFor(() => expect(toast.success).toHaveBeenCalledWith('已從「我想去」移除'));
});
