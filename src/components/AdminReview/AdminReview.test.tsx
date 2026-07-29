import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Artist } from '@/types';
import AdminReview from './index';
import useAdminReview from './hook/useAdminReview';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams('tab=artists'),
  usePathname: () => '/admin-new/review',
}));
vi.mock('@/components/admin-new/AdminSidebar', () => ({ default: () => null }));
vi.mock('@/lib/firebase', () => ({ auth: { currentUser: null } }));
vi.mock('./hook/useAdminReview');

const artist = {
  id: 'artist-1',
  stageName: 'ONE',
  status: 'pending',
  createdAt: '2026-07-12T00:00:00.000Z',
} as Artist;

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('AdminReview', () => {
  it('標記已存在不開 dialog，直接送出固定拒絕原因', async () => {
    const user = userEvent.setup();
    const mutate = vi.fn();
    vi.mocked(useAdminReview).mockReturnValue({
      artists: { data: [artist], isLoading: false, isError: false },
      events: { data: [], isLoading: false, isError: false },
      artistMutation: { isPending: false, mutate },
      editArtistMutation: { isPending: false, mutate: vi.fn() },
      eventMutation: { isPending: false, mutate: vi.fn() },
    } as unknown as ReturnType<typeof useAdminReview>);

    render(<AdminReview />);
    await user.click(screen.getByRole('button', { name: '已存在' }));

    expect(mutate).toHaveBeenCalledWith(
      [{ artistId: 'artist-1', status: 'exists', reason: '藝人已存在' }],
      { onSuccess: expect.any(Function) }
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('切換不同藝人開啟設定團名 dialog 時，不殘留前一位藝人的團名', async () => {
    const user = userEvent.setup();
    const artistA = { ...artist, id: 'artist-a', stageName: 'A', groupNames: ['GroupA'] } as Artist;
    const artistB = { ...artist, id: 'artist-b', stageName: 'B', groupNames: ['GroupB'] } as Artist;
    vi.mocked(useAdminReview).mockReturnValue({
      artists: { data: [artistA, artistB], isLoading: false, isError: false },
      events: { data: [], isLoading: false, isError: false },
      artistMutation: { isPending: false, mutate: vi.fn() },
      editArtistMutation: { isPending: false, mutate: vi.fn() },
      eventMutation: { isPending: false, mutate: vi.fn() },
    } as unknown as ReturnType<typeof useAdminReview>);

    render(<AdminReview />);

    // 開啟藝人 A 的設定團名 dialog，確認顯示 A 自己的團名
    await user.click(screen.getAllByRole('button', { name: '通過' })[0]);
    expect((screen.getByLabelText('團名 1') as HTMLInputElement).value).toBe('GroupA');

    // 未改動內容直接關閉（不會觸發 dirty 離開確認）
    await user.click(screen.getByRole('button', { name: '取消' }));
    expect(screen.queryByRole('dialog')).toBeNull();

    // 改開藝人 B 的設定團名 dialog，應顯示 B 自己的團名，不能殘留 A 的
    await user.click(screen.getAllByRole('button', { name: '通過' })[1]);
    expect((screen.getByLabelText('團名 1') as HTMLInputElement).value).toBe('GroupB');
    expect(screen.queryByDisplayValue('GroupA')).toBeNull();
  });

  it('切換待審生咖會更新 URL', async () => {
    const user = userEvent.setup();
    vi.mocked(useAdminReview).mockReturnValue({
      artists: { data: [], isLoading: false, isError: false },
      events: { data: [], isLoading: false, isError: false },
      artistMutation: { isPending: false, mutate: vi.fn() },
      editArtistMutation: { isPending: false, mutate: vi.fn() },
      eventMutation: { isPending: false, mutate: vi.fn() },
    } as unknown as ReturnType<typeof useAdminReview>);

    render(<AdminReview />);
    await user.click(screen.getByRole('tab', { name: '待審生咖' }));
    expect(replace).toHaveBeenCalledWith('?tab=events', { scroll: false });
  });
});
