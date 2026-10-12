import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { venueApi } from '@/lib/api';
import VenueReselectPlace from './VenueReselectPlace';
import { CURRENT_PLACE, makePreview, renderWithClient } from './venuePlaceReselect.fixtures';

vi.mock('@/lib/api', () => ({
  venueApi: { previewPlaceReselect: vi.fn(), applyPlaceReselect: vi.fn() },
  placesApi: {},
}));
vi.mock('@/lib/revalidate', () => ({ revalidatePublicPages: vi.fn() }));
vi.mock('@/lib/toast', () => ({
  default: { warning: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

const previewMock = vi.mocked(venueApi.previewPlaceReselect);

beforeAll(() => {
  // Headless UI Combobox needs ResizeObserver, which jsdom lacks
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

afterEach(cleanup);

const prediction = (id: string, name: string) => ({
  place_id: id,
  description: name,
  structured_formatting: { main_text: name, secondary_text: '台北' },
});

function details(name: string) {
  return {
    name,
    formatted_address: `${name} 地址`,
    city: '台北',
    geometry: { location: { lat: 25.03, lng: 121.54 } },
  };
}

// Real PlaceAutocomplete (shared component); only its API layer is faked
function setup(getDetails: ReturnType<typeof vi.fn>) {
  const placeApi = {
    autocomplete: vi.fn(async (input: string) =>
      input.startsWith('B')
        ? [prediction('ChIJplaceBBBBBB', 'B店')]
        : [prediction('ChIJplaceAAAAAA', 'A店')]
    ),
    getDetails,
  };
  renderWithClient(
    <VenueReselectPlace
      venueId="v1"
      venueName="測試咖啡"
      place={CURRENT_PLACE}
      formAddress={CURRENT_PLACE.address}
      onAddressSync={vi.fn()}
      placeApi={placeApi as never}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: '重新選擇地點' }));
  return placeApi;
}

async function pick(user: ReturnType<typeof userEvent.setup>, query: string, option: string) {
  const input = screen.getByRole('combobox');
  await user.clear(input);
  await user.type(input, query);
  await user.click(
    await screen.findByRole('option', { name: new RegExp(option) }, { timeout: 4000 })
  );
}

describe('重新選擇流程的 PlaceAutocomplete 失敗處理', () => {
  it('已預覽 A 再選 B 而 B 的 details 失敗：舊預覽失效、不可套用，並可重試', async () => {
    const getDetails = vi
      .fn()
      .mockResolvedValueOnce(details('A店'))
      .mockRejectedValueOnce(new Error('details failed'))
      .mockResolvedValueOnce(details('B店'));
    previewMock.mockImplementation(async (_id, placeId) =>
      makePreview({ placeId, google: { formattedAddress: `${placeId} 地址` } })
    );
    const user = userEvent.setup();
    setup(getDetails);

    await pick(user, 'AA', 'A店');
    await screen.findByRole('button', { name: '套用新地點' });

    await pick(user, 'BB', 'B店');

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('無法取得這個地點的座標');
    expect(screen.queryByRole('button', { name: '套用新地點' })).toBeNull();
    expect(screen.queryByRole('region', { name: '新地點預覽' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '重試' }));

    await screen.findByRole('button', { name: '套用新地點' });
    expect(previewMock).toHaveBeenLastCalledWith('v1', 'ChIJplaceBBBBBB');
    expect(screen.queryByRole('alert')).toBeNull();
  }, 15000);

  it('第一次選擇就缺座標：顯示 inline 錯誤與重試', async () => {
    const noCoords = { ...details('A店'), geometry: { location: { lat: 0, lng: 0 } } };
    const getDetails = vi.fn().mockResolvedValueOnce(noCoords);
    const user = userEvent.setup();
    setup(getDetails);

    await pick(user, 'AA', 'A店');

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('無法取得這個地點的座標');
    expect(screen.getByRole('button', { name: '重試' })).toBeTruthy();
    expect(previewMock).not.toHaveBeenCalled();
  }, 15000);

  it('已預覽後繼續輸入文字：舊預覽立即作廢', async () => {
    const getDetails = vi.fn().mockResolvedValue(details('A店'));
    previewMock.mockResolvedValue(makePreview());
    const user = userEvent.setup();
    setup(getDetails);

    await pick(user, 'AA', 'A店');
    await screen.findByRole('button', { name: '套用新地點' });

    await user.type(screen.getByRole('combobox'), 'x');

    await waitFor(() => expect(screen.queryByRole('button', { name: '套用新地點' })).toBeNull());
  }, 15000);
});
