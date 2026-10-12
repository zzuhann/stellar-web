import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { venueApi } from '@/lib/api';
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
vi.mock('@/components/forms/PlaceAutocomplete', () => ({
  default: ({
    onPlaceSelect,
    api,
  }: {
    onPlaceSelect: (p: unknown) => void;
    api: { getDetails: (id: string) => Promise<unknown> };
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

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
beforeEach(() => {
  previewMock.mockResolvedValue(makePreview());
});

async function openDialog(options: { formAddress?: string } = {}) {
  const utils = renderWithClient(
    <VenueReselectPlace
      venueId="v1"
      venueName="測試咖啡"
      place={CURRENT_PLACE}
      formAddress={options.formAddress ?? CURRENT_PLACE.address}
      onAddressSync={vi.fn()}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: '重新選擇地點' }));
  fireEvent.click(screen.getByRole('button', { name: '模擬選擇地點' }));
  const apply = await screen.findByRole('button', {
    name: /^(套用新地點|更新座標並補連|更新座標)$/,
  });
  fireEvent.click(apply);
  const dialog = await screen.findByRole('alertdialog');
  return { ...utils, dialog, applyButton: apply };
}

const choicePreview = () =>
  makePreview({
    address: {
      current: '台北市中山區舊地址 1 號',
      google: '台北市大安區新地址 2 號',
      sameAfterNormalize: false,
      choiceRequired: true,
    },
  });

describe('F5 確認彈窗內容', () => {
  it('N>=1：標題、活動名單與保留說明', async () => {
    previewMock.mockResolvedValue(makePreview({ linkableEvents: makeEvents(3) }));
    const { dialog } = await openDialog();
    const d = within(dialog);

    expect(d.getByRole('heading', { name: '確認套用新地點？' })).toBeTruthy();
    expect(d.getByText('將新連上 3 場活動')).toBeTruthy();
    expect(d.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      '活動 1',
      '活動 2',
      '活動 3',
    ]);
    expect(d.getByText(/已連到其他場地的活動不會被改動/)).toBeTruthy();
    expect(d.queryByText(/僅顯示前 100 筆/)).toBeNull();
  });

  it('N=0：顯示無可連活動且仍可確認', async () => {
    previewMock.mockResolvedValue(makePreview({ linkableEvents: [] }));
    const { dialog } = await openDialog();
    const d = within(dialog);

    expect(d.getByText(/沒有可新連上的活動/)).toBeTruthy();
    expect((d.getByRole('button', { name: '確認套用' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it.each([2, 0])('unchanged（N=%i）：標題與 placeId 不變摘要', async (n) => {
    previewMock.mockResolvedValue(makePreview({ unchanged: true, linkableEvents: makeEvents(n) }));
    const { dialog } = await openDialog();
    const d = within(dialog);

    expect(d.getByRole('heading', { name: '確認更新座標並補連活動？' })).toBeTruthy();
    expect(dialog.textContent).toContain('placeId 不變');
  });

  it('地址型：顯示固定提醒且無需勾選即可確認', async () => {
    previewMock.mockResolvedValue(makePreview({ google: { isAddressType: true } }));
    const { dialog } = await openDialog();
    const d = within(dialog);

    expect(
      d.getByText('這是地址不是店家：活動要選到完全相同的地址（包含樓層寫法）才會自動連上')
    ).toBeTruthy();
    expect(d.queryByRole('checkbox')).toBeNull();
    expect((d.getByRole('button', { name: '確認套用' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('名單截斷時顯示前 100 筆與總數', async () => {
    previewMock.mockResolvedValue(
      makePreview({ linkableEvents: makeEvents(100), linkableEventCount: 150 })
    );
    const { dialog } = await openDialog();
    const d = within(dialog);

    expect(d.getByText('僅顯示前 100 筆，共 150 場')).toBeTruthy();
    expect(d.getByText('將新連上 150 場活動')).toBeTruthy();
    expect(d.getAllByRole('listitem')).toHaveLength(100);
  });

  it('表單地址有未儲存修改時提示會被覆蓋', async () => {
    const { dialog } = await openDialog({ formAddress: '使用者改到一半的地址' });
    expect(dialog.textContent).toContain('表單中未儲存的地址修改會被覆蓋');
  });
});

describe('F6 地址選擇', () => {
  it('(a) 地址相同：沒有 fieldset／radio，確認不帶 addressChoice', async () => {
    applyMock.mockResolvedValue(makeResult());
    const { dialog } = await openDialog();
    const d = within(dialog);

    expect(d.queryByRole('group')).toBeNull();
    expect(d.queryByRole('radio')).toBeNull();
    fireEvent.click(d.getByRole('button', { name: '確認套用' }));

    await waitFor(() => expect(applyMock).toHaveBeenCalledTimes(1));
    const body = applyMock.mock.calls[0][1];
    expect(body.placeId).toBe(NEW_PLACE_ID);
    expect(body).not.toHaveProperty('addressChoice');
  });

  it('(b) 需選擇：預設未選且確認停用，選後只送 enum', async () => {
    previewMock.mockResolvedValue(choicePreview());
    applyMock.mockResolvedValue(makeResult());
    const { dialog } = await openDialog();
    const d = within(dialog);

    expect(d.getByRole('group', { name: '要保留哪一個地址？（必選）' })).toBeTruthy();
    const existing = d.getByRole('radio', { name: /店家填的/ }) as HTMLInputElement;
    const google = d.getByRole('radio', { name: /Google 的/ }) as HTMLInputElement;
    expect(existing.checked).toBe(false);
    expect(google.checked).toBe(false);
    expect(existing.parentElement?.textContent).toContain('台北市中山區舊地址 1 號');
    expect(google.parentElement?.textContent).toContain('台北市大安區新地址 2 號');
    const confirm = d.getByRole('button', { name: '確認套用' }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    expect(d.getByText('請先選擇要保留的地址')).toBeTruthy();

    fireEvent.click(existing);
    expect(confirm.disabled).toBe(false);
    fireEvent.click(confirm);

    await waitFor(() => expect(applyMock).toHaveBeenCalledTimes(1));
    expect(applyMock.mock.calls[0][1]).toEqual({
      placeId: NEW_PLACE_ID,
      addressChoice: 'existing',
    });
  });

  it('(b) 選 Google 的送出 google', async () => {
    previewMock.mockResolvedValue(choicePreview());
    applyMock.mockResolvedValue(makeResult());
    const { dialog } = await openDialog();
    const d = within(dialog);

    fireEvent.click(d.getByRole('radio', { name: /Google 的/ }));
    fireEvent.click(d.getByRole('button', { name: '確認套用' }));

    await waitFor(() => expect(applyMock).toHaveBeenCalledTimes(1));
    expect(applyMock.mock.calls[0][1]).toEqual({ placeId: NEW_PLACE_ID, addressChoice: 'google' });
  });

  it('(b) 方向鍵切換 radio，Tab 離開群組', async () => {
    // jsdom has no CSS.escape, which user-event needs to walk a radio group
    vi.stubGlobal('CSS', { escape: (value: string) => value });
    previewMock.mockResolvedValue(choicePreview());
    const user = userEvent.setup();
    const { dialog } = await openDialog();
    const d = within(dialog);
    const existing = d.getByRole('radio', { name: /店家填的/ }) as HTMLInputElement;
    const google = d.getByRole('radio', { name: /Google 的/ }) as HTMLInputElement;

    await user.click(existing);
    await user.keyboard('{ArrowDown}');
    expect(google.checked).toBe(true);
    expect(document.activeElement).toBe(google);

    await user.tab();
    expect(document.activeElement?.getAttribute('type')).not.toBe('radio');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('(c) 現有地址為空：無 radio，摘要提示採用 Google 地址，不帶 addressChoice', async () => {
    previewMock.mockResolvedValue(
      makePreview({
        google: { formattedAddress: 'Google 的新地址' },
        address: { current: '', google: 'Google 的新地址', choiceRequired: false },
      })
    );
    applyMock.mockResolvedValue(makeResult());
    const { dialog } = await openDialog();
    const d = within(dialog);

    expect(d.queryByRole('radio')).toBeNull();
    expect(dialog.textContent).toContain('地址原為空，將使用 Google 地址：Google 的新地址');
    fireEvent.click(d.getByRole('button', { name: '確認套用' }));

    await waitFor(() => expect(applyMock).toHaveBeenCalledTimes(1));
    expect(applyMock.mock.calls[0][1]).not.toHaveProperty('addressChoice');
  });
});

describe('F6 補充：Google 沒有提供地址', () => {
  it.each([
    ['現有地址非空', '台北市中山區舊地址 1 號', 'Google 沒有提供地址，將保留目前地址'],
    ['現有地址也為空', '', '地址維持空白'],
  ])('%s：無 radio、顯示說明、不帶 addressChoice', async (_name, current, text) => {
    previewMock.mockResolvedValue(
      makePreview({
        google: { formattedAddress: '  ' },
        address: { current, google: '', sameAfterNormalize: false, choiceRequired: false },
      })
    );
    applyMock.mockResolvedValue(makeResult());
    const { dialog } = await openDialog();
    const d = within(dialog);

    expect(d.queryByRole('radio')).toBeNull();
    expect(dialog.textContent).toContain(text);
    expect(dialog.textContent).not.toContain('地址原為空，將使用 Google 地址');
    fireEvent.click(d.getByRole('button', { name: '確認套用' }));

    await waitFor(() => expect(applyMock).toHaveBeenCalledTimes(1));
    expect(applyMock.mock.calls[0][1]).not.toHaveProperty('addressChoice');
  });
});

describe('F7 取消不寫入', () => {
  const closers: Array<[string, (dialog: HTMLElement) => Promise<void> | void]> = [
    [
      '取消鈕',
      (dialog) => void fireEvent.click(within(dialog).getByRole('button', { name: '取消' })),
    ],
    ['X', (dialog) => void fireEvent.click(within(dialog).getByRole('button', { name: '關閉' }))],
    [
      '點遮罩',
      async (dialog) => {
        await userEvent.click(dialog.lastElementChild as HTMLElement);
      },
    ],
    ['Esc', async () => void (await userEvent.keyboard('{Escape}'))],
  ];

  it.each(closers)('%s 關閉彈窗、不寫入、焦點回到套用鈕', async (_name, close) => {
    const { dialog, applyButton } = await openDialog();

    await close(dialog);

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(applyMock).not.toHaveBeenCalled();
    expect(screen.getByRole('region', { name: '新地點預覽' })).toBeTruthy();
    expect(document.activeElement).toBe(applyButton);
  });
});

describe('F9 寫入中鎖定', () => {
  it('連點只送一次，Esc／遮罩／X／取消皆不關閉', async () => {
    let resolveApply: (v: ReturnType<typeof makeResult>) => void = () => {};
    applyMock.mockReturnValue(new Promise((resolve) => (resolveApply = resolve)));
    const user = userEvent.setup();
    const { dialog } = await openDialog();
    const d = within(dialog);

    fireEvent.click(d.getByRole('button', { name: '確認套用' }));
    const loading = (await d.findByRole('button', { name: '套用中…' })) as HTMLButtonElement;
    expect(loading.disabled).toBe(true);
    fireEvent.click(loading);
    fireEvent.click(loading);

    await user.keyboard('{Escape}');
    await user.click(dialog.lastElementChild as HTMLElement);
    fireEvent.click(d.getByRole('button', { name: '關閉' }));
    fireEvent.click(d.getByRole('button', { name: '取消' }));

    expect((d.getByRole('button', { name: '關閉' }) as HTMLButtonElement).disabled).toBe(true);
    expect((d.getByRole('button', { name: '取消' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('alertdialog')).toBeTruthy();
    expect(applyMock).toHaveBeenCalledTimes(1);

    resolveApply(makeResult());
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
  });
});

describe('F10 寫入錯誤各狀態', () => {
  const generic = '套用失敗，沒有任何資料被修改，請稍後重試。';

  async function submitWithChoice() {
    previewMock.mockResolvedValue(choicePreview());
    const utils = await openDialog();
    const d = within(utils.dialog);
    fireEvent.click(d.getByRole('radio', { name: /Google 的/ }));
    fireEvent.click(d.getByRole('button', { name: '確認套用' }));
    return { ...utils, d };
  }

  it.each([
    ['500', () => apiError(500)],
    ['網路錯誤', () => new Error('Network Error')],
  ])('%s：通用文案、按鈕恢復、radio 保留', async (_name, makeError) => {
    applyMock.mockRejectedValue(makeError());
    const { d } = await submitWithChoice();

    const alert = await d.findByRole('alert');
    expect(alert.textContent).toBe(generic);
    expect((d.getByRole('button', { name: '確認套用' }) as HTMLButtonElement).disabled).toBe(false);
    expect((d.getByRole('radio', { name: /Google 的/ }) as HTMLInputElement).checked).toBe(true);
  });

  it('400 ADDRESS_CHOICE_REQUIRED：關閉並以同一 placeId 重新預覽', async () => {
    applyMock.mockRejectedValue(apiError(400, { code: 'ADDRESS_CHOICE_REQUIRED' }));
    const { d } = await submitWithChoice();

    const alert = await d.findByRole('alert');
    expect(alert.textContent).toContain('場地地址在你預覽後有變動，請重新預覽後再套用。');
    expect(previewMock).toHaveBeenCalledTimes(1);

    fireEvent.click(d.getByRole('button', { name: '關閉並重新預覽' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    await waitFor(() => expect(previewMock).toHaveBeenCalledTimes(2));
    expect(previewMock).toHaveBeenLastCalledWith('v1', NEW_PLACE_ID);
  });

  it('409 PLACE_ID_IN_USE：確認停用，回到搜尋', async () => {
    applyMock.mockRejectedValue(apiError(409, { code: 'PLACE_ID_IN_USE' }));
    const { d } = await submitWithChoice();

    const alert = await d.findByRole('alert');
    expect(alert.textContent).toContain('這個地點剛剛被其他場地使用，請重新搜尋');
    expect((d.getByRole('button', { name: '確認套用' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(d.getByRole('button', { name: '回到搜尋' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.queryByRole('region', { name: '新地點預覽' })).toBeNull();
    expect(screen.getByLabelText('搜尋地點')).toBeTruthy();
  });

  it('422 TOO_MANY_LINKABLE_EVENTS：顯示實際總數與上限', async () => {
    applyMock.mockRejectedValue(
      apiError(422, { code: 'TOO_MANY_LINKABLE_EVENTS', details: { linkableEventCount: 523 } })
    );
    const { d } = await submitWithChoice();

    const alert = await d.findByRole('alert');
    expect(alert.textContent).toBe(
      '符合條件的活動共 523 場，超過單次上限 400 場，無法套用。請聯繫工程師處理。'
    );
  });

  it.each([
    [429, '操作太頻繁，沒有任何資料被修改，請稍候幾秒再試。'],
    [503, '服務暫時無法使用，沒有任何資料被修改，請稍後重試。'],
  ])('%i：對應文案且按鈕恢復', async (status, message) => {
    applyMock.mockRejectedValue(apiError(status));
    const { d } = await submitWithChoice();

    const alert = await d.findByRole('alert');
    expect(alert.textContent).toContain(message);
    expect((d.getByRole('button', { name: '確認套用' }) as HTMLButtonElement).disabled).toBe(false);
  });
});

describe('F11 彈窗 a11y', () => {
  it('初始焦點在取消、有名稱與描述、關閉後焦點回到觸發鈕', async () => {
    previewMock.mockResolvedValue(choicePreview());
    const { applyButton } = await openDialog();

    const dialog = screen.getByRole('alertdialog', { name: '確認套用新地點？' });
    const d = within(dialog);
    expect(document.activeElement).toBe(d.getByRole('button', { name: '取消' }));
    expect(document.activeElement).not.toBe(d.getByRole('button', { name: '確認套用' }));
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(describedBy && document.getElementById(describedBy)?.textContent).toContain(
      '「測試咖啡」的地點將改為「新店家咖啡」'
    );

    fireEvent.click(d.getByRole('button', { name: '取消' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(document.activeElement).toBe(applyButton);
  });
});
