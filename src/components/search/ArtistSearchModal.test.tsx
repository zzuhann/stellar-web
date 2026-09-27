import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRef, useState } from 'react';
import ArtistSearchModal from './ArtistSearchModal';

const push = vi.fn();
const toggleAuthModal = vi.fn();
let mockPathname = '/';
let mockUser: { uid: string } | null = { uid: 'user-1' };

const sendGAEvent = vi.fn();
const searchResults: Array<{ id: string; stageName: string }> = [];
let searchLoading = false;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => mockPathname,
}));

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: (...args: unknown[]) => sendGAEvent(...args),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: mockUser, toggleAuthModal }),
}));

vi.mock('@/hooks/useArtistSearch', () => ({
  useArtistSearch: () => ({ data: searchResults, isLoading: searchLoading }),
}));

// Debounce adds real timers noise unrelated to what these tests verify; pass value through.
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: <T,>(value: T) => value,
}));

vi.mock('@/hooks/useScrollLock', () => ({
  useScrollLock: () => {},
}));

vi.mock('../ArtistCard/ArtistCardLink', () => ({
  default: ({
    artist,
    onBeforeNavigate,
  }: {
    artist: { id: string; stageName: string };
    onBeforeNavigate?: () => void;
  }) => (
    <button type="button" onClick={onBeforeNavigate}>
      {artist.stageName}
    </button>
  ),
}));

describe('ArtistSearchModal', () => {
  beforeEach(() => {
    mockPathname = '/';
    mockUser = { uid: 'user-1' };
    searchResults.length = 0;
    searchLoading = false;
    push.mockClear();
    toggleAuthModal.mockClear();
    sendGAEvent.mockClear();
  });

  afterEach(cleanup);

  it('focuses the search input when opened (TC-001/002/003/006)', () => {
    render(<ArtistSearchModal isOpen={true} onClose={vi.fn()} entryPoint="header" />);
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: '搜尋藝人' }));
  });

  it('fires search_artist with entryPoint and the real pathname, not a hardcoded "/" (TC-020/024)', () => {
    mockPathname = '/map/some-artist';
    render(<ArtistSearchModal isOpen={true} onClose={vi.fn()} entryPoint="header" />);

    expect(sendGAEvent).toHaveBeenCalledWith(
      'event',
      'search_artist',
      expect.objectContaining({ event_page: '/map/some-artist', entry_point: 'header' })
    );
  });

  it('fires search_artist with entryPoint=top_artists when opened from the pill (TC-021)', () => {
    render(<ArtistSearchModal isOpen={true} onClose={vi.fn()} entryPoint="top_artists" />);
    expect(sendGAEvent).toHaveBeenCalledWith(
      'event',
      'search_artist',
      expect.objectContaining({ entry_point: 'top_artists' })
    );
  });

  it('fires search_artist with entryPoint=search_section when opened from SearchSection (TC-022)', () => {
    render(<ArtistSearchModal isOpen={true} onClose={vi.fn()} entryPoint="search_section" />);
    expect(sendGAEvent).toHaveBeenCalledWith(
      'event',
      'search_artist',
      expect.objectContaining({ entry_point: 'search_section' })
    );
  });

  it('clicking a result card fires click_artist with matching entryPoint/pathname and closes the modal (TC-004/018/023/024)', async () => {
    mockPathname = '/map/old-artist';
    searchResults.push({ id: 'artist-2', stageName: '新藝人' });
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ArtistSearchModal isOpen={true} onClose={onClose} entryPoint="top_artists" />);
    await user.type(screen.getByRole('textbox', { name: '搜尋藝人' }), '新藝人');
    await user.click(screen.getByRole('button', { name: '新藝人' }));

    expect(sendGAEvent).toHaveBeenCalledWith(
      'event',
      'click_artist',
      expect.objectContaining({
        event_page: '/map/old-artist',
        entry_point: 'top_artists',
        content_id: 'artist-2',
      })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('works normally when opened on a non-home page: search and result click keep the real pathname as event_page (TC-016)', async () => {
    mockPathname = '/map/xxx';
    searchResults.push({ id: 'new-artist', stageName: '新藝人' });
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ArtistSearchModal isOpen={true} onClose={onClose} entryPoint="header" />);

    expect(sendGAEvent).toHaveBeenCalledWith(
      'event',
      'search_artist',
      expect.objectContaining({ event_page: '/map/xxx', entry_point: 'header' })
    );

    await user.type(screen.getByRole('textbox', { name: '搜尋藝人' }), '新藝人');
    await user.click(screen.getByRole('button', { name: '新藝人' }));

    expect(sendGAEvent).toHaveBeenCalledWith(
      'event',
      'click_artist',
      expect.objectContaining({
        event_page: '/map/xxx',
        entry_point: 'header',
        content_id: 'new-artist',
      })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('pressing Escape closes the modal regardless of which element has focus (TC-011)', async () => {
    searchResults.push({ id: 'artist-3', stageName: '找得到的藝人' });
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ArtistSearchModal isOpen={true} onClose={onClose} entryPoint="header" />);
    await user.type(screen.getByRole('textbox', { name: '搜尋藝人' }), '找得到的藝人');
    // Move focus onto the result card (not the input) before pressing Escape
    screen.getByRole('button', { name: '找得到的藝人' }).focus();
    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('clicking the overlay closes the modal and returns focus to the trigger (TC-012)', async () => {
    const triggerButton = document.createElement('button');
    document.body.appendChild(triggerButton);
    const triggerRef = createRef<HTMLButtonElement>();
    (triggerRef as { current: HTMLButtonElement }).current = triggerButton;

    const onClose = vi.fn();
    const user = userEvent.setup();
    // useFocusTrap only returns focus when isActive flips true->false, so isOpen must be
    // real state here (a static prop would never let that transition happen).
    function Wrapper() {
      const [isOpen, setIsOpen] = useState(true);
      return (
        <ArtistSearchModal
          isOpen={isOpen}
          onClose={() => {
            onClose();
            setIsOpen(false);
          }}
          entryPoint="header"
          triggerRef={triggerRef}
        />
      );
    }
    render(<Wrapper />);

    await user.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(document.activeElement).toBe(triggerButton));

    document.body.removeChild(triggerButton);
  });

  it('clicking the close (X) button closes the modal (TC-013)', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ArtistSearchModal isOpen={true} onClose={onClose} entryPoint="header" />);

    await user.click(screen.getByRole('button', { name: '關閉搜尋' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('clears the input whenever isOpen flips to false, however it closed (route-change close, TC-019)', () => {
    const { rerender } = render(
      <ArtistSearchModal isOpen={true} onClose={vi.fn()} entryPoint="header" />
    );
    const input = screen.getByRole('textbox', { name: '搜尋藝人' }) as HTMLInputElement;
    input.value = '不會保留';

    rerender(<ArtistSearchModal isOpen={false} onClose={vi.fn()} entryPoint="header" />);
    rerender(<ArtistSearchModal isOpen={true} onClose={vi.fn()} entryPoint="header" />);

    expect((screen.getByRole('textbox', { name: '搜尋藝人' }) as HTMLInputElement).value).toBe('');
  });

  it('未登入點「新增藝人」CTA：先關閉搜尋 modal 再開啟登入流程，避免被搜尋 modal 蓋住 (TC-015 known bug fix)', async () => {
    mockUser = null;
    searchResults.push({ id: 'artist-4', stageName: '任一藝人' });
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ArtistSearchModal isOpen={true} onClose={onClose} entryPoint="header" />);
    await user.type(screen.getByRole('textbox', { name: '搜尋藝人' }), '任一藝人');
    await user.click(screen.getByText(/點擊前往新增藝人/));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(toggleAuthModal).toHaveBeenCalledWith('/submit-artist');
  });

  it('已登入點「新增藝人」CTA：關閉搜尋 modal 並導向 /submit-artist (TC-005/027)', async () => {
    mockUser = { uid: 'user-1' };
    searchResults.push({ id: 'artist-5', stageName: '任一藝人' });
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ArtistSearchModal isOpen={true} onClose={onClose} entryPoint="header" />);
    await user.type(screen.getByRole('textbox', { name: '搜尋藝人' }), '任一藝人');
    await user.click(screen.getByText(/點擊前往新增藝人/));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/submit-artist');
  });

  it('未登入搜不到結果時點 CTA 一樣先關閉 modal 再開登入流程 (TC-026)', async () => {
    mockUser = null;
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<ArtistSearchModal isOpen={true} onClose={onClose} entryPoint="header" />);
    await user.type(screen.getByRole('textbox', { name: '搜尋藝人' }), '查無此人');
    await user.click(screen.getByText(/點擊前往新增藝人/));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(toggleAuthModal).toHaveBeenCalledWith('/submit-artist');
  });

  it('顯示既有的空狀態／載入中／結果文案，樣式不變 (TC-025)', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ArtistSearchModal isOpen={true} onClose={vi.fn()} entryPoint="header" />
    );
    expect(screen.getByText('搜尋藝人')).toBeTruthy();

    await user.type(screen.getByRole('textbox', { name: '搜尋藝人' }), 'abc');

    searchLoading = true;
    rerender(<ArtistSearchModal isOpen={true} onClose={vi.fn()} entryPoint="header" />);
    expect(screen.getByText('搜尋中...')).toBeTruthy();

    searchLoading = false;
    rerender(<ArtistSearchModal isOpen={true} onClose={vi.fn()} entryPoint="header" />);
    expect(screen.getByText('找不到該藝人')).toBeTruthy();
  });
});
