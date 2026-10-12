import { AxiosError } from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { vi } from 'vitest';
import type { VenuePlaceReselectPreview, VenuePlaceReselectResult } from '@/types';

export const NEW_PLACE_ID = 'ChIJnewPlace0001';

export const CURRENT_PLACE = {
  placeId: 'ChIJoldPlace0001',
  address: '台北市中山區舊地址 1 號',
  lat: 25.04,
  lng: 121.56,
};

export function makeEvents(count: number) {
  return Array.from({ length: count }, (_, i) => ({ id: `e${i + 1}`, title: `活動 ${i + 1}` }));
}

export function makePreview(
  overrides: Partial<Omit<VenuePlaceReselectPreview, 'google' | 'address'>> & {
    google?: Partial<VenuePlaceReselectPreview['google']>;
    address?: Partial<VenuePlaceReselectPreview['address']>;
  } = {}
): VenuePlaceReselectPreview {
  const { google, address, ...rest } = overrides;
  const linkableEvents = rest.linkableEvents ?? makeEvents(3);
  return {
    placeId: NEW_PLACE_ID,
    unchanged: false,
    linkableEvents,
    linkableEventCount: linkableEvents.length,
    ...rest,
    google: {
      formattedAddress: '台北市大安區新地址 2 號',
      lat: 25.033,
      lng: 121.543,
      isAddressType: false,
      ...google,
    },
    address: {
      current: CURRENT_PLACE.address,
      google: '台北市大安區新地址 2 號',
      sameAfterNormalize: true,
      choiceRequired: false,
      ...address,
    },
  };
}

export function makeResult(
  overrides: Partial<VenuePlaceReselectResult> = {}
): VenuePlaceReselectResult {
  return {
    venueId: 'v1',
    placeId: NEW_PLACE_ID,
    lat: 25.033,
    lng: 121.543,
    address: '台北市中山區舊地址 1 號',
    linkedEvents: makeEvents(3),
    linkedCount: 3,
    ...overrides,
  };
}

export function apiError(status: number, data: Record<string, unknown> = {}) {
  return new AxiosError('request failed', 'ERR_BAD_RESPONSE', undefined, undefined, {
    status,
    statusText: '',
    headers: {},
    config: {} as never,
    data,
  });
}

export function renderWithClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  const result = render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  return { ...result, queryClient, invalidateSpy };
}
