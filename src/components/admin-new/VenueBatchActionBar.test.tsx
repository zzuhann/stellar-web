import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import VenueBatchActionBar, { getSelectionKind } from './VenueBatchActionBar';
import type { Venue } from '@/types';

afterEach(cleanup);

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeVenue(status: Venue['status']): Venue {
  return {
    id: `venue-${status}-${Math.random()}`,
    name: 'Test Venue',
    address: '台北市測試路1號',
    region: '台北市',
    lat: 25.0,
    lng: 121.5,
    nearestMrt: null,
    mrtWalkMinutes: null,
    capacityRange: null,
    eventCount: 0,
    coverPhoto: null,
    status,
  };
}

const noop = () => {};

// ─── getSelectionKind (pure unit tests) ───────────────────────────────────────

describe('getSelectionKind', () => {
  it('空陣列 → mixed', () => {
    expect(getSelectionKind([])).toBe('mixed');
  });

  it('全 pending → all-pending', () => {
    expect(getSelectionKind([makeVenue('pending'), makeVenue('pending')])).toBe('all-pending');
  });

  it('全 active → all-active', () => {
    expect(getSelectionKind([makeVenue('active'), makeVenue('active')])).toBe('all-active');
  });

  it('全 inactive → all-inactive', () => {
    expect(getSelectionKind([makeVenue('inactive')])).toBe('all-inactive');
  });

  it('全 rejected → all-rejected', () => {
    expect(getSelectionKind([makeVenue('rejected'), makeVenue('rejected')])).toBe('all-rejected');
  });

  it('pending + active 混合 → mixed', () => {
    expect(getSelectionKind([makeVenue('pending'), makeVenue('active')])).toBe('mixed');
  });

  it('pending + inactive + active 混合 → mixed', () => {
    expect(
      getSelectionKind([makeVenue('pending'), makeVenue('inactive'), makeVenue('active')])
    ).toBe('mixed');
  });
});

// ─── VenueBatchActionBar (component tests) ────────────────────────────────────

describe('VenueBatchActionBar', () => {
  it('selectedVenues 為空 → render null', () => {
    const { container } = render(
      <VenueBatchActionBar
        selectedVenues={[]}
        onClearSelection={noop}
        onBatchAction={noop}
        isLoading={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('全 pending → 顯示「審核通過」和「拒絕」按鈕', () => {
    render(
      <VenueBatchActionBar
        selectedVenues={[makeVenue('pending'), makeVenue('pending')]}
        onClearSelection={noop}
        onBatchAction={noop}
        isLoading={false}
      />
    );
    expect(screen.getByRole('button', { name: '批次審核通過' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '批次拒絕' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '批次下架' })).toBeNull();
    expect(screen.queryByRole('button', { name: '批次上架' })).toBeNull();
  });

  it('全 active → 只顯示「批次下架」按鈕', () => {
    render(
      <VenueBatchActionBar
        selectedVenues={[makeVenue('active')]}
        onClearSelection={noop}
        onBatchAction={noop}
        isLoading={false}
      />
    );
    expect(screen.getByRole('button', { name: '批次下架' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '批次審核通過' })).toBeNull();
    expect(screen.queryByRole('button', { name: '批次上架' })).toBeNull();
  });

  it('全 inactive → 只顯示「批次上架」按鈕', () => {
    render(
      <VenueBatchActionBar
        selectedVenues={[makeVenue('inactive')]}
        onClearSelection={noop}
        onBatchAction={noop}
        isLoading={false}
      />
    );
    expect(screen.getByRole('button', { name: '批次上架' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '批次下架' })).toBeNull();
    expect(screen.queryByRole('button', { name: '批次審核通過' })).toBeNull();
  });

  it('全 rejected → 顯示 hint 文字，不顯示任何 action 按鈕', () => {
    render(
      <VenueBatchActionBar
        selectedVenues={[makeVenue('rejected')]}
        onClearSelection={noop}
        onBatchAction={noop}
        isLoading={false}
      />
    );
    expect(screen.getByText('已拒絕的場地無法進行批次操作')).toBeTruthy();
    expect(screen.queryByRole('button', { name: '批次審核通過' })).toBeNull();
    expect(screen.queryByRole('button', { name: '批次拒絕' })).toBeNull();
    expect(screen.queryByRole('button', { name: '批次下架' })).toBeNull();
    expect(screen.queryByRole('button', { name: '批次上架' })).toBeNull();
  });

  it('混合 status → 顯示 hint 文字，不顯示任何 action 按鈕', () => {
    render(
      <VenueBatchActionBar
        selectedVenues={[makeVenue('pending'), makeVenue('active')]}
        onClearSelection={noop}
        onBatchAction={noop}
        isLoading={false}
      />
    );
    expect(screen.getByText('請勾選相同狀態的場地才能執行批次操作')).toBeTruthy();
    expect(screen.queryByRole('button', { name: '批次審核通過' })).toBeNull();
    expect(screen.queryByRole('button', { name: '批次下架' })).toBeNull();
    expect(screen.queryByRole('button', { name: '批次上架' })).toBeNull();
  });

  it('isLoading=true 時，所有 action 按鈕 disabled', () => {
    // Test with all-pending (most action buttons)
    render(
      <VenueBatchActionBar
        selectedVenues={[makeVenue('pending')]}
        onClearSelection={noop}
        onBatchAction={noop}
        isLoading={true}
      />
    );
    const approveBtn = screen.getByRole('button', { name: '批次審核通過' });
    const rejectBtn = screen.getByRole('button', { name: '批次拒絕' });
    expect((approveBtn as HTMLButtonElement).disabled).toBe(true);
    expect((rejectBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('isLoading=true + all-active → 批次下架按鈕 disabled', () => {
    render(
      <VenueBatchActionBar
        selectedVenues={[makeVenue('active')]}
        onClearSelection={noop}
        onBatchAction={noop}
        isLoading={true}
      />
    );
    const btn = screen.getByRole('button', { name: '批次下架' });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it('isLoading=true + all-inactive → 批次上架按鈕 disabled', () => {
    render(
      <VenueBatchActionBar
        selectedVenues={[makeVenue('inactive')]}
        onClearSelection={noop}
        onBatchAction={noop}
        isLoading={true}
      />
    );
    const btn = screen.getByRole('button', { name: '批次上架' });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });
});
