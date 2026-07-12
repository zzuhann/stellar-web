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

    expect(mutate).toHaveBeenCalledWith([
      { artistId: 'artist-1', status: 'exists', reason: '藝人已存在' },
    ]);
    expect(screen.queryByRole('dialog')).toBeNull();
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
