import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { venueApi } from '@/lib/api';
import VenueForm from './VenueForm';
import VenueReselectPlace from './VenueReselectPlace';
import {
  CURRENT_PLACE,
  NEW_PLACE_ID,
  apiError,
  makeEvents,
  makePreview,
  makeResult,
  renderWithClient,
} from './venuePlaceReselect.fixtures';

vi.mock('@/lib/api', () => ({
  venueApi: { previewPlaceReselect: vi.fn(), applyPlaceReselect: vi.fn() },
  placesApi: {
    getDetails: async () => ({ name: '新店家咖啡', geometry: { location: { lat: 25, lng: 121 } } }),
  },
}));
vi.mock('@/lib/revalidate', () => ({ revalidatePublicPages: vi.fn() }));
vi.mock('next/link', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@/components/images/ImageUpload', () => ({ default: () => null }));
vi.mock('@/components/images/MultiImageUpload', () => ({ default: () => null }));
vi.mock('@/components/forms/PlaceAutocomplete', () => ({
  default: ({
    onPlaceSelect,
    api,
  }: {
    api: { getDetails: (id: string) => Promise<unknown> };
    onPlaceSelect: (p: {
      place_id: string;
      address: string;
      coordinates: { lat: number; lng: number };
      name: string;
      city: string;
    }) => void;
  }) => (
    <div>
      <input aria-label="搜尋地點" />
      <button
        type="button"
        onClick={async () => {
          await api.getDetails('ChIJnewPlace0001');
          onPlaceSelect({
            place_id: 'ChIJnewPlace0001',
            address: '台北市大安區新地址 2 號',
            coordinates: { lat: 25.033, lng: 121.543 },
            name: '新店家咖啡',
            city: '台北',
          });
        }}
      >
        模擬選擇地點
      </button>
    </div>
  ),
}));

const previewMock = vi.mocked(venueApi.previewPlaceReselect);
const applyMock = vi.mocked(venueApi.applyPlaceReselect);

afterEach(cleanup);
beforeEach(() => {
  previewMock.mockResolvedValue(makePreview());
});

function renderPlace(place: Partial<typeof CURRENT_PLACE & { placeId: string }> = {}) {
  const onAddressSync = vi.fn();
  const utils = renderWithClient(
    <VenueReselectPlace
      venueId="v1"
      venueName="測試咖啡"
      place={{ ...CURRENT_PLACE, ...place } as never}
      formAddress={CURRENT_PLACE.address}
      onAddressSync={onAddressSync}
    />
  );
  return { ...utils, onAddressSync };
}

async function selectPlace() {
  fireEvent.click(screen.getByRole('button', { name: '重新選擇地點' }));
  fireEvent.click(screen.getByRole('button', { name: '模擬選擇地點' }));
  await screen.findByRole('region', { name: '新地點預覽' });
}

describe('F1 地點區塊顯示狀態', () => {
  it.each([
    ['ChIJabc12345', '店家', null],
    ['Ejabc12345', '地址型', '活動需選到完全相同的地址才會自動連上'],
    ['Ekabc12345', '地址型', '活動需選到完全相同的地址才會自動連上'],
    ['', '未設定', '活動無法自動連上此場地'],
    ['Xyz9abc12345', '其他（Xyz9…）', null],
  ])('placeId %j 顯示類型 %s', (placeId, badge, note) => {
    renderPlace({ placeId });

    expect(screen.getByText(badge)).toBeTruthy();
    if (note) expect(screen.getByText(note)).toBeTruthy();
    expect(screen.queryByText('座標缺失')).toBeNull();
    if (placeId.startsWith('ChIJ')) {
      expect(screen.queryByText('地址型')).toBeNull();
      expect(screen.queryByText('未設定')).toBeNull();
    }
  });

  it.each([
    ['0, 0', 0, 0],
    ['缺值', undefined, undefined],
  ])('座標 %s 顯示座標缺失與說明', (_name, lat, lng) => {
    renderPlace({ lat, lng } as never);

    expect(screen.getByText('座標缺失')).toBeTruthy();
    expect(screen.getByText('距離排序會排在最後')).toBeTruthy();
  });

  it('正常座標顯示 lat, lng', () => {
    renderPlace();
    expect(screen.getByText('25.04, 121.56')).toBeTruthy();
  });

  it('地址為空顯示（未填）', () => {
    renderPlace({ address: '' });
    expect(screen.getByText('（未填）')).toBeTruthy();
  });
});

describe('F2 展開、收合與清除', () => {
  it('展開後焦點在輸入框，取消後清除預覽且不寫入', async () => {
    renderPlace();
    const toggle = screen.getByRole('button', { name: '重新選擇地點' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(toggle);

    const input = screen.getByLabelText('搜尋地點');
    expect(document.activeElement).toBe(input);
    const expanded = screen.getByRole('button', { name: '取消重新選擇' });
    expect(expanded.getAttribute('aria-expanded')).toBe('true');
    const controls = expanded.getAttribute('aria-controls');
    expect(controls && document.getElementById(controls)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '模擬選擇地點' }));
    await screen.findByRole('button', { name: '套用新地點' });

    fireEvent.click(screen.getByRole('button', { name: '取消重新選擇' }));

    expect(screen.queryByLabelText('搜尋地點')).toBeNull();
    expect(screen.queryByRole('button', { name: '套用新地點' })).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('button', { name: '重新選擇地點' }).getAttribute('aria-expanded')).toBe(
      'false'
    );
    expect(applyMock).not.toHaveBeenCalled();
  });
});

describe('F3 預覽成功各結果', () => {
  it('一般店家顯示卡片資訊與兩個動作', async () => {
    previewMock.mockResolvedValue(makePreview());
    renderPlace();
    await selectPlace();

    expect(previewMock).toHaveBeenCalledWith('v1', NEW_PLACE_ID);
    const card = within(screen.getByRole('region', { name: '新地點預覽' }));
    expect(card.getByText('新店家咖啡')).toBeTruthy();
    expect(card.getByText('台北市大安區新地址 2 號')).toBeTruthy();
    expect(card.getByText('25.033, 121.543')).toBeTruthy();
    expect(card.getByText('店家')).toBeTruthy();
    expect(card.getByText('將連上 3 場活動')).toBeTruthy();
    expect(card.queryByText('與目前相同')).toBeNull();
    expect(screen.getByRole('button', { name: '套用新地點' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '重新搜尋' })).toBeTruthy();
  });

  it('地址型顯示 amber 提醒', async () => {
    previewMock.mockResolvedValue(makePreview({ google: { isAddressType: true } }));
    renderPlace();
    await selectPlace();

    const card = within(screen.getByRole('region', { name: '新地點預覽' }));
    expect(card.getByText('地址型')).toBeTruthy();
    expect(
      card.getByText('這是地址不是店家：活動要選到完全相同的地址（包含樓層寫法）才會自動連上')
    ).toBeTruthy();
  });

  it('Google 地址為空時卡片顯示（Google 未提供）', async () => {
    previewMock.mockResolvedValue(
      makePreview({ google: { formattedAddress: '' }, address: { google: '' } })
    );
    renderPlace();
    await selectPlace();

    const card = within(screen.getByRole('region', { name: '新地點預覽' }));
    expect(card.getByText('（Google 未提供）')).toBeTruthy();
  });

  it.each([
    [2, '地點相同，套用後會更新座標，並補連 2 場活動', '更新座標並補連'],
    [0, '地點相同，套用後會以 Google 資料更新座標，沒有可補連的活動', '更新座標'],
  ])('unchanged N=%i 顯示相同標籤、摘要與 CTA', async (n, summary, cta) => {
    previewMock.mockResolvedValue(makePreview({ unchanged: true, linkableEvents: makeEvents(n) }));
    renderPlace();
    await selectPlace();

    const card = within(screen.getByRole('region', { name: '新地點預覽' }));
    expect(card.getByText('與目前相同')).toBeTruthy();
    expect(card.getByText(summary)).toBeTruthy();
    const button = screen.getByRole('button', { name: cta }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    expect(screen.queryByRole('button', { name: '套用新地點' })).toBeNull();
  });
});

describe('F4 預覽錯誤各狀態', () => {
  it.each([
    [
      '409 被占用',
      apiError(409, {
        code: 'PLACE_ID_IN_USE',
        details: { venue: { id: 'v9', name: '別間咖啡' } },
      }),
      '這個地點已被『別間咖啡』使用，無法套用。',
      false,
    ],
    [
      '422 查詢失敗',
      apiError(422, { code: 'PLACE_LOOKUP_FAILED' }),
      '無法取得這個地點的座標，請重新搜尋或選擇其他地點。',
      true,
    ],
    [
      '422 無座標',
      apiError(422, { code: 'PLACE_NO_COORDINATES' }),
      '無法取得這個地點的座標，請重新搜尋或選擇其他地點。',
      true,
    ],
    [
      '422 候選過多',
      apiError(422, { code: 'TOO_MANY_LINKABLE_EVENTS', details: { linkableEventCount: 523 } }),
      '符合條件的活動共 523 場，超過單次上限 400 場，無法套用。請聯繫工程師處理。',
      false,
    ],
    ['500', apiError(500), '檢查失敗，請稍後再試。', true],
    ['429', apiError(429), '操作太頻繁，請稍候幾秒再試。', true],
    ['503', apiError(503), '服務暫時無法使用，請稍後再試。', true],
  ])('%s', async (_name, error, message, canRetry) => {
    previewMock.mockRejectedValue(error);
    renderPlace();
    fireEvent.click(screen.getByRole('button', { name: '重新選擇地點' }));
    fireEvent.click(screen.getByRole('button', { name: '模擬選擇地點' }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain(message);
    expect(screen.queryByRole('button', { name: /套用新地點|更新座標/ })).toBeNull();

    const retry = screen.queryByRole('button', { name: '重試' });
    expect(Boolean(retry)).toBe(canRetry);
    if (retry) {
      fireEvent.click(retry);
      await waitFor(() => expect(previewMock).toHaveBeenCalledTimes(2));
      expect(previewMock).toHaveBeenLastCalledWith('v1', NEW_PLACE_ID);
    }
  });

  it('409 連結另開分頁到該場地編輯頁', async () => {
    previewMock.mockRejectedValue(
      apiError(409, { code: 'PLACE_ID_IN_USE', details: { venue: { id: 'v9', name: '別間咖啡' } } })
    );
    renderPlace();
    fireEvent.click(screen.getByRole('button', { name: '重新選擇地點' }));
    fireEvent.click(screen.getByRole('button', { name: '模擬選擇地點' }));

    const link = await screen.findByRole('link', { name: /前往該場地/ });
    expect(link.getAttribute('href')).toBe('/admin-new/venues/v9/edit');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});

describe('F8 寫入成功後回饋', () => {
  function renderEditForm() {
    return renderWithClient(
      <VenueForm
        mode="edit"
        initialValues={{
          name: '測試咖啡',
          address: CURRENT_PLACE.address,
          region: '台北',
          nearestMrt: '',
          mrtWalkMinutes: '',
          capacityRange: '',
          description: '',
          coverPhoto: '',
          otherPhotos: [],
          hostTags: [],
          threads: '',
          instagram: '',
          line: '',
          preferredContact: '',
          contactUrl: '',
        }}
        onSubmit={vi.fn()}
        isSubmitting={false}
        submitError={null}
        status="active"
        onStatusChange={vi.fn()}
        isStatusChanging={false}
        onDeleteClick={vi.fn()}
        canDelete={false}
        place={{ venueId: 'v1', ...CURRENT_PLACE }}
      />
    );
  }

  it.each([
    [3, '已更新地點。新連上 3 場活動。', false],
    [2, '已更新地點。新連上 2 場活動。', true],
  ])('linkedCount=%i：橫幅、收合、invalidate、地址同步', async (linkedCount, text, mismatch) => {
    previewMock.mockResolvedValue(makePreview({ linkableEvents: makeEvents(3) }));
    applyMock.mockResolvedValue(
      makeResult({
        linkedCount,
        linkedEvents: makeEvents(linkedCount),
        address: 'Google 新地址 9 號',
      })
    );
    const { invalidateSpy } = renderEditForm();
    await screen.findByRole('button', { name: '重新選擇地點' });
    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '未儲存的新名稱' } });

    await selectPlace();
    fireEvent.click(screen.getByRole('button', { name: '套用新地點' }));
    fireEvent.click(await screen.findByRole('button', { name: '確認套用' }));

    const status = await screen.findByRole('status');
    await waitFor(() => expect(status.textContent).toContain(text));
    expect(status.textContent?.includes('（預覽時為 3 場，期間資料有變動）')).toBe(mismatch);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(screen.queryByRole('region', { name: '新地點預覽' })).toBeNull();
    expect(screen.getByRole('button', { name: '重新選擇地點' }).getAttribute('aria-expanded')).toBe(
      'false'
    );

    const keys = invalidateSpy.mock.calls.map((c) => JSON.stringify(c[0]?.queryKey));
    expect(keys).toContain(JSON.stringify(['venue-detail', 'v1']));
    expect(keys).toContain(JSON.stringify(['admin-venues']));
    expect((screen.getByLabelText(/地址/) as HTMLInputElement).value).toBe('Google 新地址 9 號');
    expect((screen.getByLabelText(/場地名稱/) as HTMLInputElement).value).toBe('未儲存的新名稱');
  });
});
