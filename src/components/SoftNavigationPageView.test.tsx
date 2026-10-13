import { render } from '@testing-library/react';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendGAEvent } from '@next/third-parties/google';
import SoftNavigationPageView from './SoftNavigationPageView';

let currentPathname = '/';
vi.mock('next/navigation', () => ({ usePathname: () => currentPathname }));
vi.mock('@next/third-parties/google', () => ({ sendGAEvent: vi.fn() }));

const pageViewCalls = () =>
  vi.mocked(sendGAEvent).mock.calls.filter(([, name]) => name === 'page_view');

describe('SoftNavigationPageView', () => {
  beforeEach(() => {
    currentPathname = '/';
  });

  it('初次載入不送（硬載入由 gtag 原生 page_view 負責），StrictMode 下也一樣', () => {
    render(
      <StrictMode>
        <SoftNavigationPageView />
      </StrictMode>
    );
    expect(pageViewCalls()).toHaveLength(0);
  });

  it('站內換頁（pathname 改變）送一次 page_view', () => {
    const { rerender } = render(<SoftNavigationPageView />);
    currentPathname = '/map/artist-a';
    rerender(<SoftNavigationPageView />);

    expect(pageViewCalls()).toHaveLength(1);
    expect(pageViewCalls()[0][2]).toEqual({ page_location: window.location.href });
  });

  it('pathname 沒變（只改 query string，如篩選、翻頁、切 tab）不送', () => {
    const { rerender } = render(<SoftNavigationPageView />);
    rerender(<SoftNavigationPageView />);
    rerender(<SoftNavigationPageView />);

    expect(pageViewCalls()).toHaveLength(0);
  });
});
