import { render, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendGAEvent } from '@next/third-parties/google';
import SoftNavigationPageView from './SoftNavigationPageView';

let currentPathname = '/';
vi.mock('next/navigation', () => ({ usePathname: () => currentPathname }));
vi.mock('@next/third-parties/google', () => ({ sendGAEvent: vi.fn() }));

const pageViewCalls = () =>
  vi.mocked(sendGAEvent).mock.calls.filter(([, name]) => name === 'page_view');

// Simulates Next's router: URL changes via history, then the pathname hook reflects it
function navigate(path: string) {
  window.history.pushState(null, '', path);
  currentPathname = new URL(path, window.location.origin).pathname;
}

const flushFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

describe('SoftNavigationPageView', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    currentPathname = '/';
    document.title = '首頁';
  });

  it('初次載入不送（硬載入由 gtag 原生 page_view 負責），StrictMode 下也一樣', async () => {
    render(
      <StrictMode>
        <SoftNavigationPageView />
      </StrictMode>
    );
    await flushFrame();
    expect(pageViewCalls()).toHaveLength(0);
  });

  it('站內換頁送一次 page_view，帶新網址、新標題，referrer 是前一頁', async () => {
    const { rerender } = render(<SoftNavigationPageView />);
    navigate('/map/artist-a');
    rerender(<SoftNavigationPageView />);
    document.title = '藝人地圖'; // Next swaps the title after the route commits

    await waitFor(() => expect(pageViewCalls()).toHaveLength(1));
    expect(pageViewCalls()[0][2]).toEqual({
      page_location: `${window.location.origin}/map/artist-a`,
      page_title: '藝人地圖',
      page_referrer: `${window.location.origin}/`,
    });
  });

  it('只改 query string（篩選、翻頁、切 tab）不送', async () => {
    navigate('/venues');
    const { rerender } = render(<SoftNavigationPageView />);
    navigate('/venues?region=台北');
    rerender(<SoftNavigationPageView />);
    navigate('/venues?region=台北&page=2');
    rerender(<SoftNavigationPageView />);

    await flushFrame();
    expect(pageViewCalls()).toHaveLength(0);
  });
});
