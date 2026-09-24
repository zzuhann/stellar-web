import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import WeekEventCard from './WeekEventCard';
import type { EventListItem } from '@/types';

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}));

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

afterEach(cleanup);

// GET /events 現在回傳 ISO 8601 字串（跟 /events/map-data 一致），不再是 FirebaseTimestamp
const baseEvent: EventListItem = {
  id: 'event-1',
  artists: [],
  title: '測試生咖活動',
  description: '',
  location: {
    name: '測試店家',
    address: '台北市測試路 1 號',
    coordinates: { lat: 25, lng: 121 },
  },
  datetime: {
    start: '2026-05-02T16:00:00.000Z', // Taipei 2026/5/3
    end: '2026-05-09T15:59:59.000Z', // Taipei 2026/5/9
  },
  socialMedia: {},
  status: 'approved',
  createdBy: 'user-1',
  createdAt: { _seconds: 0, _nanoseconds: 0 },
  updatedAt: { _seconds: 0, _nanoseconds: 0 },
};

describe('WeekEventCard', () => {
  it('datetime 為 ISO 字串時，正確渲染日期範圍而非 Invalid Date', () => {
    render(<WeekEventCard event={baseEvent} />);

    expect(screen.getByText('5/3 - 5/9')).toBeTruthy();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });

  // 部署順序依賴新前端能相容舊後端（仍回傳 Timestamp 格式）的過渡期，鎖住這個相容性保證。
  // EventListItem.datetime 型別已宣告為 string，但過渡期間實際 runtime 資料可能仍是舊格式，故此處刻意 cast 來模擬。
  it('datetime 為舊格式 FirebaseTimestamp 物件時，仍正確渲染日期範圍而非 Invalid Date', () => {
    const legacyTimestampEvent = {
      ...baseEvent,
      datetime: {
        // 與 baseEvent 同一組日期（Taipei 2026/5/3 - 2026/5/9）的 _seconds 等價值
        start: { _seconds: 1777737600, _nanoseconds: 0 },
        end: { _seconds: 1778342399, _nanoseconds: 0 },
      },
    } as unknown as EventListItem;

    render(<WeekEventCard event={legacyTimestampEvent} />);

    expect(screen.getByText('5/3 - 5/9')).toBeTruthy();
    expect(screen.queryByText(/Invalid Date/i)).toBeNull();
  });
});
