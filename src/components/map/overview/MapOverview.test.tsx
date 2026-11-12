import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MapEvent } from '@/types';
import { formatEventDateShort } from '@/utils';
import { useHeaderTitleStore } from '@/store/useHeaderTitleStore';
import { MAP_EMPTY_TITLE } from '../constants';
import MapOverview from './MapOverview';
import { artistA, e1, e2, e3, makeEvent } from './testFixtures';

const getMapData = vi.fn();
const getArtistById = vi.fn();
vi.mock('@/lib/api', () => ({
  artistsApi: { getById: (...args: unknown[]) => getArtistById(...args) },
  eventsApi: { getMapData: (...args: unknown[]) => getMapData(...args) },
}));

const sendGAEvent = vi.fn();
vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: (...args: unknown[]) => sendGAEvent(...args),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: { uid: 'user-1' } }),
}));

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    prefetch: _prefetch,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    prefetch?: boolean;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const mapPageRendered = vi.fn();
vi.mock('@/components/map/MapPage', () => ({
  default: () => {
    mapPageRendered();
    return null;
  },
}));

// Literal on purpose: proves the component reads the same cache entry the server prefetches
const MAP_KEY = ['map-data', { status: 'all', search: '', artistId: 'a1' }];

function makeClient(events: MapEvent[], updatedAt = Date.now()) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(['artist', 'rm'], artistA);
  client.setQueryData(MAP_KEY, { events, total: events.length }, { updatedAt });
  return client;
}

function renderOverview(events: MapEvent[], client = makeClient(events)) {
  return render(
    <QueryClientProvider client={client}>
      <MapOverview artistId="rm" />
    </QueryClientProvider>
  );
}

const cardLinks = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="/event/"]'));

beforeEach(() => {
  getMapData.mockResolvedValue({ events: [], total: 0 });
  useHeaderTitleStore.setState({ title: null, eyebrow: null });
});
afterEach(cleanup);

describe('MapOverview cards and count', () => {
  // TC-001
  it('keeps the API order without sorting by itself', () => {
    const { container } = renderOverview([e2, e1]);
    expect(cardLinks(container).map((a) => a.getAttribute('href'))).toEqual([
      '/event/e-2',
      '/event/e-1',
    ]);
  });

  // TC-002
  it('counts events, not venues', () => {
    renderOverview([e1, e2, e3]);
    expect(screen.getByText('3 間生咖')).toBeTruthy();
    expect(screen.queryByText('2 間生咖')).toBeNull();
  });

  // TC-003
  it('shows poster, title, venue and short date but no artist name or ongoing badge', () => {
    const { container } = renderOverview([e1]);
    const card = cardLinks(container)[0];
    expect(screen.getByAltText('甲').getAttribute('src')).toBe(e1.mainImage);
    expect(within(card).getByText('甲')).toBeTruthy();
    expect(within(card).getByText('S1')).toBeTruthy();
    expect(
      within(card).getByText(formatEventDateShort(e1.datetime.start, e1.datetime.end))
    ).toBeTruthy();
    expect(within(card).queryByText('RM')).toBeNull();
    expect(within(card).queryByText('進行中')).toBeNull();
  });

  // TC-004
  it('links the whole card to the event page as a single anchor', () => {
    const { container } = renderOverview([e1]);
    const card = cardLinks(container)[0];
    expect(card.getAttribute('href')).toBe('/event/e-1');
    expect(card.querySelectorAll('a')).toHaveLength(0);
  });
});

describe('MapOverview semantics', () => {
  // TC-007
  it('renders no h1 for both populated and empty states', () => {
    renderOverview([e1]);
    expect(screen.queryAllByRole('heading', { level: 1 })).toHaveLength(0);
    cleanup();
    renderOverview([]);
    expect(screen.queryAllByRole('heading', { level: 1 })).toHaveLength(0);
  });

  // TC-008
  it('shows the shared empty state and keeps the switch when there are no events', () => {
    renderOverview([]);
    expect(screen.getByText(MAP_EMPTY_TITLE)).toBeTruthy();
    expect(screen.queryByText(/間生咖/)).toBeNull();
    expect(screen.getByRole('navigation', { name: '切換檢視' })).toBeTruthy();
  });
});

describe('MapOverview edge cases', () => {
  // TC-009
  it('falls back to the event id when slug is null or empty', () => {
    const nullSlug = makeEvent({ ...e2, id: 'ev-2', slug: null });
    const emptySlug = makeEvent({ ...e3, id: 'ev-3', slug: '' });
    const { container } = renderOverview([nullSlug, emptySlug]);
    expect(cardLinks(container).map((a) => a.getAttribute('href'))).toEqual([
      '/event/ev-2',
      '/event/ev-3',
    ]);
    expect(container.innerHTML).not.toMatch(/\/event\/(null|undefined)/);
  });

  // TC-010
  it('renders a placeholder instead of an empty-src image when mainImage is empty', () => {
    const noImage = makeEvent({ ...e2, mainImage: '' });
    const { container } = renderOverview([noImage]);
    expect(container.querySelector('img[src=""]')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    const card = cardLinks(container)[0];
    expect(within(card).getByText('乙')).toBeTruthy();
    expect(within(card).getByText('S2')).toBeTruthy();
  });

  // TC-013 (jsdom has no Panda stylesheet, so assert on atomic class names)
  it('does not truncate the date while title and venue are ellipsized', () => {
    renderOverview([e3]);
    const date = screen.getByText('10/10 - 12/31');
    expect(date.className).not.toContain('tov_ellipsis');
    expect(date.className).not.toContain('white-space_nowrap');
    // Positive control: the same class check does detect truncation on the title
    expect(screen.getByText('丙').className).toContain('tov_ellipsis');
  });

  // TC-014
  it('drops events that ended after the ISR HTML was built once the client refetches', async () => {
    let resolve!: (v: { events: MapEvent[]; total: number }) => void;
    getMapData.mockReturnValue(new Promise((r) => (resolve = r)));
    const staleClient = makeClient([e1, e2, e3], Date.now() - 10 * 60 * 1000);
    const { container } = renderOverview([], staleClient);

    // Refetching: stale cards stay on screen, no skeleton or blank flash
    expect(cardLinks(container)).toHaveLength(3);
    expect(screen.getByText('3 間生咖')).toBeTruthy();

    resolve({ events: [e1, e3], total: 2 });
    await waitFor(() => expect(screen.getByText('2 間生咖')).toBeTruthy());
    expect(screen.queryByAltText('乙')).toBeNull();
    expect(getMapData).toHaveBeenCalledTimes(1);
  });

  // TC-015
  it('does not request geolocation, lock body scroll, touch map sessionStorage or mount MapPage', () => {
    const getCurrentPosition = vi.fn();
    const watchPosition = vi.fn();
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition, watchPosition },
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const getItem = vi.spyOn(Storage.prototype, 'getItem');

    renderOverview([e1]);

    expect(getCurrentPosition).not.toHaveBeenCalled();
    expect(watchPosition).not.toHaveBeenCalled();
    expect(document.body.style.overflow).not.toBe('hidden');
    const mapKeyCalls = [...setItem.mock.calls, ...getItem.mock.calls].filter(([key]) =>
      String(key).includes('stellar_map_state')
    );
    expect(mapKeyCalls).toHaveLength(0);
    expect(mapPageRendered).not.toHaveBeenCalled();
    setItem.mockRestore();
    getItem.mockRestore();
  });
});

describe('MapOverview data source', () => {
  // TC-022 (c)
  it('reads the server-prefetched map-data entry without fetching again', () => {
    const { container } = renderOverview([e1, e2]);
    expect(cardLinks(container)).toHaveLength(2);
    expect(getMapData).not.toHaveBeenCalled();
  });

  // TC-024
  it('puts card links in the server-rendered HTML', () => {
    const html = renderToString(
      <QueryClientProvider client={makeClient([e1, e2, e3])}>
        <MapOverview artistId="rm" />
      </QueryClientProvider>
    );
    ['/event/e-1', '/event/e-2', '/event/e-3'].forEach((href) =>
      expect(html).toContain(`href="${href}"`)
    );
  });
});

describe('MapOverview tracking and header', () => {
  // TC-027
  it('sends click_event_detail with overview-specific params', () => {
    const { container } = renderOverview([e1]);
    fireEvent.click(cardLinks(container)[0]);
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'click_event_detail', {
      event_page: '/map/[artistId]/overview',
      user_id: 'user-1',
      content_id: 'ev-1',
      artist_id: 'a1',
      ui_source: 'overview_grid',
    });
  });

  // TC-029
  it('sets the header title to the artist name and clears it on unmount', () => {
    const { unmount } = renderOverview([e1]);
    expect(useHeaderTitleStore.getState().eyebrow).toBe('RM');
    expect(useHeaderTitleStore.getState().title).toBeTruthy();
    unmount();
    expect(useHeaderTitleStore.getState().title).toBeNull();
    expect(useHeaderTitleStore.getState().eyebrow).toBeNull();
  });
});
