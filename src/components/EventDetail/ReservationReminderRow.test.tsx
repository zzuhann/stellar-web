import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ReservationReminderRow from './ReservationReminderRow';
import type { FirebaseTimestamp } from '@/types';

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}));

const toFirebaseTimestamp = (date: Date): FirebaseTimestamp => ({
  _seconds: Math.floor(date.getTime() / 1000),
  _nanoseconds: 0,
});

const defaultProps = {
  eventTitle: '生日應援',
  locationText: '某咖啡廳 台北市信義區',
  eventSlugOrId: 'event-1',
  eventId: 'event-1',
};

describe('ReservationReminderRow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('預約開始時間在未來 -> 顯示「提醒我預約」連結', () => {
    const futureStartAt = toFirebaseTimestamp(new Date(2026, 0, 10, 12, 0, 0));

    render(<ReservationReminderRow startAt={futureStartAt} {...defaultProps} />);

    expect(screen.getByText('提醒我預約')).toBeTruthy();
    expect(screen.getByRole('link')).toBeTruthy();
  });

  it('預約開始時間已過去 -> 不顯示「提醒我預約」連結，只顯示純文字時間', () => {
    const pastStartAt = toFirebaseTimestamp(new Date(2025, 11, 1, 12, 0, 0));

    render(<ReservationReminderRow startAt={pastStartAt} {...defaultProps} />);

    expect(screen.queryByText('提醒我預約')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
