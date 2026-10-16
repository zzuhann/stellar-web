import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { venueApi } from '@/lib/api';
import {
  apiError,
  makePreview,
  makeResult,
  renderWithClient,
} from '@/components/admin-new/venuePlaceReselect.fixtures';
import VenueEditPage from './page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'v1' }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('next/link', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@/hooks/useAuthToken', () => ({ useAuthToken: () => ({ token: 't' }) }));
vi.mock('@/lib/revalidate', () => ({ revalidatePublicPages: vi.fn() }));
vi.mock('@/lib/api', () => ({
  venueApi: {
    getAdminVenueById: vi.fn(),
    previewPlaceReselect: vi.fn(),
    applyPlaceReselect: vi.fn(),
    updateVenue: vi.fn(),
  },
  placesApi: {
    getDetails: async () => ({ name: '新店家咖啡', geometry: { location: { lat: 25, lng: 121 } } }),
  },
  handleApiError: vi.fn(() => 'error'),
}));
vi.mock('@/components/images/ImageUpload', () => ({ default: () => null }));
vi.mock('@/components/images/MultiImageUpload', () => ({ default: () => null }));
vi.mock('@/components/forms/PlaceAutocomplete', () => ({
  default: ({
    onPlaceSelect,
    api,
  }: {
    onPlaceSelect: (p: unknown) => void;
    api: { getDetails: (id: string) => Promise<unknown> };
  }) => (
    <button
      type="button"
      onClick={async () => {
        await api.getDetails('ChIJnewPlace0001');
        onPlaceSelect({
          place_id: 'ChIJnewPlace0001',
          address: 'x',
          coordinates: { lat: 25, lng: 121 },
          name: '新店家咖啡',
          city: '台北',
        });
      }}
    >
      模擬選擇地點
    </button>
  ),
}));

afterEach(cleanup);

const venue = {
  id: 'v1',
  name: '測試咖啡',
  address: '台北市中山區舊地址 1 號',
  region: '台北',
  lat: 25.04,
  lng: 121.56,
  placeId: 'ChIJoldPlace0001',
  nearestMrt: null,
  mrtWalkMinutes: null,
  capacityRange: null,
  eventCount: 0,
  coverPhoto: null,
  description: '',
  otherPhotos: [],
  hostTags: [],
  status: 'active',
  events: [],
};

describe('VenueEditPage 載入失敗處理', () => {
  it('初次載入失敗仍顯示整頁錯誤', async () => {
    vi.mocked(venueApi.getAdminVenueById).mockRejectedValue(apiError(500));
    renderWithClient(<VenueEditPage />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('載入場地資料失敗');
    expect(screen.queryByLabelText(/場地名稱/)).toBeNull();
  });

  it('套用成功後 refetch 失敗：表單、未儲存修改與成功橫幅都保留', async () => {
    vi.mocked(venueApi.getAdminVenueById)
      .mockResolvedValueOnce(venue as never)
      .mockRejectedValue(apiError(500));
    vi.mocked(venueApi.previewPlaceReselect).mockResolvedValue(makePreview());
    vi.mocked(venueApi.applyPlaceReselect).mockResolvedValue(makeResult());
    renderWithClient(<VenueEditPage />);

    const name = await screen.findByLabelText(/場地名稱/);
    fireEvent.change(name, { target: { value: '未儲存的新名稱' } });
    fireEvent.click(await screen.findByRole('button', { name: '重新選擇地點' }));
    fireEvent.click(screen.getByRole('button', { name: '模擬選擇地點' }));
    fireEvent.click(await screen.findByRole('button', { name: '套用新地點' }));
    fireEvent.click(await screen.findByRole('button', { name: '確認套用' }));

    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('已更新地點。新連上 3 場活動。')
    );
    await waitFor(() => expect(venueApi.getAdminVenueById).toHaveBeenCalledTimes(2));
    expect(await screen.findByText(/重新整理資料失敗/)).toBeTruthy();
    expect((screen.getByLabelText(/場地名稱/) as HTMLInputElement).value).toBe('未儲存的新名稱');
    expect(screen.getByRole('status').textContent).toContain('已更新地點。新連上 3 場活動。');
  });
});

describe('VenueEditPage 預約表單網址（TC-099）', () => {
  async function renderPage(bookingFormUrl: string | null | undefined) {
    vi.mocked(venueApi.getAdminVenueById).mockResolvedValue({
      ...venue,
      bookingFormUrl,
    } as never);
    vi.mocked(venueApi.updateVenue).mockResolvedValue({} as never);
    renderWithClient(<VenueEditPage />);
    return (await screen.findByLabelText('預約表單網址')) as HTMLInputElement;
  }

  async function saveWithNewName() {
    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '更新名稱' } });
    fireEvent.click(screen.getByRole('button', { name: '儲存變更' }));
    await waitFor(() => expect(venueApi.updateVenue).toHaveBeenCalledTimes(1));
    return vi.mocked(venueApi.updateVenue).mock.calls[0][1];
  }

  afterEach(() => vi.mocked(venueApi.updateVenue).mockReset());

  it('TC-099 a：預填 admin 詳情的值，只改店名時送原值', async () => {
    const input = await renderPage('https://forms.gle/x');
    expect(input.value).toBe('https://forms.gle/x');
    expect(await saveWithNewName()).toHaveProperty('bookingFormUrl', 'https://forms.gle/x');
  });

  it('TC-099 b：清空後存檔送 null', async () => {
    const input = await renderPage('https://forms.gle/x');
    fireEvent.change(input, { target: { value: '' } });
    expect(await saveWithNewName()).toHaveProperty('bookingFormUrl', null);
  });

  it.each([null, undefined])(
    'TC-099 c：舊場地 bookingFormUrl 為 %s，只改店名時送 null',
    async (value) => {
      const input = await renderPage(value);
      expect(input.value).toBe('');
      expect(await saveWithNewName()).toHaveProperty('bookingFormUrl', null);
    }
  );
});
