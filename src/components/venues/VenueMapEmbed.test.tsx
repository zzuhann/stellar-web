import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import VenueMapEmbed from './VenueMapEmbed';

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe('VenueMapEmbed', () => {
  it('有 placeId 時顯示 lazy-loaded 場地地圖', () => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY', 'test-key');

    render(<VenueMapEmbed placeId="place id/1" venueName="測試場地" />);

    const map = screen.getByTitle('測試場地的 Google 地圖');
    expect(map.getAttribute('src')).toBe(
      'https://www.google.com/maps/embed/v1/place?key=test-key&q=place_id%3Aplace%20id%2F1'
    );
    expect(map.getAttribute('loading')).toBe('lazy');
  });

  it.each([
    ['', 'test-key'],
    ['place-1', ''],
  ])('placeId 或 API key 缺少時不顯示地圖', (placeId, apiKey) => {
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_MAPS_EMBED_API_KEY', apiKey);

    render(<VenueMapEmbed placeId={placeId} venueName="測試場地" />);

    expect(screen.queryByTitle('測試場地的 Google 地圖')).toBeNull();
  });
});
