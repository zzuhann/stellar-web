import { render, screen, act, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import BirthdayHat from './index';

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

describe('BirthdayHat', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('今天是生日 -> 顯示帽子圖片', async () => {
    vi.setSystemTime(new Date(2025, 3, 17, 10, 0, 0)); // April 17

    await act(async () => {
      render(<BirthdayHat birthday="2001-04-17" className="hat" />);
    });

    expect(screen.getByAltText('今日壽星')).toBeTruthy();
  });

  it('今天不是生日 -> 不顯示帽子', async () => {
    vi.setSystemTime(new Date(2025, 3, 16, 10, 0, 0)); // April 16

    await act(async () => {
      render(<BirthdayHat birthday="2001-04-17" className="hat" />);
    });

    expect(screen.queryByAltText('今日壽星')).toBeNull();
  });

  it('birthday 為空字串 -> 不顯示帽子', async () => {
    vi.setSystemTime(new Date(2025, 3, 17, 10, 0, 0));

    await act(async () => {
      render(<BirthdayHat birthday="" className="hat" />);
    });

    expect(screen.queryByAltText('今日壽星')).toBeNull();
  });
});
