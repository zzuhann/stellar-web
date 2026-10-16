import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VenueDetail } from '@/types';
import { venueTagDictionaryFixture } from '@/test/venueTagDictionary.fixture';
import VenueEditPage from '@/app/admin-new/venues/[id]/edit/page';
import VenueNewPage from '@/app/admin-new/venues/new/page';

const api = vi.hoisted(() => ({
  getAdminVenueById: vi.fn(),
  getTagDictionary: vi.fn(),
  updateVenue: vi.fn(),
  createVenue: vi.fn(),
}));
const revalidate = vi.hoisted(() => ({ revalidatePublicPages: vi.fn() }));

vi.mock('@/lib/api', () => ({
  venueApi: api,
  placesApi: {},
  handleApiError: () => '伺服器錯誤',
}));
vi.mock('@/lib/revalidate', () => revalidate);
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'v1' }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('@/hooks/useAuthToken', () => ({ useAuthToken: () => ({ token: null }) }));
vi.mock('next/link', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@/components/images/ImageUpload', () => ({
  default: ({ onUploadComplete }: { onUploadComplete: (url: string) => void }) => (
    <button type="button" onClick={() => onUploadComplete('https://cdn.test/cover.jpg')}>
      模擬封面上傳
    </button>
  ),
}));
vi.mock('@/components/images/MultiImageUpload', () => ({ default: () => null }));
vi.mock('@/components/forms/PlaceAutocomplete', () => ({ default: () => null }));
// Edit-only place block is out of scope here and pulls its own mutations
vi.mock('./VenueReselectPlace', () => ({ default: () => null }));

Element.prototype.scrollIntoView = vi.fn();

const TAG_FIELDS = ['tags', 'sourceLinks', 'equipmentNote', 'infoUpdatedOn', 'calendarUrl'];
const SAVE_FAILED = '儲存失敗，勾選都還在。請再按一次；一直失敗請看 Sentry。';
const DICTIONARY_FAILED = '標籤載入失敗，請重新整理頁面';

beforeEach(() => {
  // Only Date is faked so React Query timers keep running; 2026-10-15 12:00 in Taipei
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-15T04:00:00Z'));
  api.getTagDictionary.mockResolvedValue(venueTagDictionaryFixture);
  api.updateVenue.mockResolvedValue({ message: 'Venue updated' });
  api.createVenue.mockResolvedValue({ id: 'new' });
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

function makeVenue(overrides: Partial<VenueDetail> = {}): VenueDetail {
  return {
    id: 'v1',
    name: '舊場地',
    address: '台北市中山區舊地址 1 號',
    region: '台北',
    lat: 25.04,
    lng: 121.52,
    placeId: 'ChIJold',
    nearestMrt: '中山站',
    mrtWalkMinutes: 10,
    capacityRange: '20-40',
    eventCount: 0,
    coverPhoto: null,
    description: '',
    otherPhotos: [],
    hostTags: [],
    status: 'active',
    socialMedia: { instagram: '@venue' },
    preferredContact: 'instagram',
    bookingFormUrl: null,
    tags: [],
    sourceLinks: [],
    equipmentNote: '',
    infoUpdatedOn: null,
    calendarUrl: null,
    events: [],
    ...overrides,
  };
}

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
  return client;
}

async function renderEdit(overrides: Partial<VenueDetail> = {}) {
  api.getAdminVenueById.mockResolvedValue(makeVenue(overrides));
  renderWithClient(<VenueEditPage />);
  await screen.findByRole('checkbox', { name: '免場地費' });
}

async function renderEditWithFailedDictionary() {
  api.getTagDictionary.mockRejectedValue(new Error('500'));
  api.getAdminVenueById.mockResolvedValue(makeVenue());
  renderWithClient(<VenueEditPage />);
  await screen.findByText(DICTIONARY_FAILED);
}

function checkbox(name: string) {
  return screen.getByRole('checkbox', { name }) as HTMLInputElement;
}

function chooseLimit(tagLabel: string, option: string) {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${tagLabel}的限期：`) }));
  fireEvent.click(screen.getByRole('option', { name: option }));
}

function setUntil(tagLabel: string, value: string) {
  fireEvent.change(screen.getByLabelText(`${tagLabel}的結束日期`), { target: { value } });
}

function save() {
  fireEvent.click(screen.getByRole('button', { name: '儲存變更' }));
}

async function savedBody() {
  await waitFor(() => expect(api.updateVenue).toHaveBeenCalledTimes(1));
  return api.updateVenue.mock.calls[0][1] as Record<string, unknown>;
}

function expectNoTagFields(body: Record<string, unknown>) {
  for (const key of TAG_FIELDS) expect(body).not.toHaveProperty(key);
}

describe('TC-008 後台編輯勾標籤並設限期', () => {
  it('body tags 帶三種限期寫法，儲存後清公開頁快取', async () => {
    await renderEdit();

    fireEvent.click(checkbox('免場地費'));
    chooseLimit('免場地費', '限期到');
    setUntil('免場地費', '2026-12-31');
    fireEvent.click(checkbox('可包場'));
    fireEvent.click(checkbox('近火車站'));
    save();

    const body = await savedBody();
    expect(body.tags).toHaveLength(3);
    expect(body.tags).toEqual(
      expect.arrayContaining([
        { slug: 'free_venue', limited: true, until: '2026-12-31' },
        { slug: 'private_booking' },
        { slug: 'near_train' },
      ])
    );
    await waitFor(() => expect(revalidate.revalidatePublicPages).toHaveBeenCalledTimes(1));
  });

  it('勾選時限期預設「不限期」，選項有三個', async () => {
    await renderEdit();
    fireEvent.click(checkbox('免場地費'));

    fireEvent.click(screen.getByRole('button', { name: '免場地費的限期：不限期' }));
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      '不限期',
      '限期（目前沒有設定結束日）',
      '限期到',
    ]);
  });
});

describe('限期控制只在價格組', () => {
  it('服務組勾一個標籤：沒有限期控制，body 是 {slug}', async () => {
    await renderEdit();
    fireEvent.click(checkbox('可包場'));
    expect(screen.queryByRole('button', { name: /^可包場的限期：/ })).toBeNull();
    fireEvent.click(checkbox('免場地費'));
    expect(screen.getByRole('button', { name: '免場地費的限期：不限期' })).toBeTruthy();
    save();

    const body = await savedBody();
    expect(body.tags).toEqual(
      expect.arrayContaining([{ slug: 'private_booking' }, { slug: 'free_venue' }])
    );
  });

  it('載入時服務組標籤本來就帶 until：照樣顯示控制，原值保留，可改回不限期', async () => {
    await renderEdit({
      tags: [{ slug: 'goods_distribution', limited: true, until: '2026-12-31' }],
    });
    expect(screen.getByRole('button', { name: '應援物代發的限期：限期到' })).toBeTruthy();
    expect((screen.getByLabelText('應援物代發的結束日期') as HTMLInputElement).value).toBe(
      '2026-12-31'
    );
    fireEvent.click(checkbox('可包場'));
    save();

    const first = await savedBody();
    expect(first.tags).toEqual(
      expect.arrayContaining([
        { slug: 'goods_distribution', limited: true, until: '2026-12-31' },
        { slug: 'private_booking' },
      ])
    );

    chooseLimit('應援物代發', '不限期');
    expect(screen.getByRole('button', { name: '應援物代發的限期：不限期' })).toBeTruthy();
  });
});

describe('限期下拉的鍵盤操作', () => {
  const trigger = () => screen.getByRole('button', { name: /^免場地費的限期：/ });

  it('Tab 進選項再 Tab 出去 → 選單關閉', async () => {
    const user = userEvent.setup();
    await renderEdit();
    fireEvent.click(checkbox('免場地費'));
    await user.click(trigger());
    expect(screen.getByRole('listbox')).toBeTruthy();

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('option', { name: '不限期' }));
    await user.tab();
    await user.tab();
    await user.tab();

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('展開時箭頭套用 open 樣式，收合時拿掉', async () => {
    await renderEdit();
    fireEvent.click(checkbox('免場地費'));
    const iconClass = () => trigger().querySelector('svg')?.getAttribute('class') ?? '';
    const closed = iconClass();

    fireEvent.click(trigger());
    expect(iconClass()).not.toBe(closed);
    fireEvent.click(trigger());
    expect(iconClass()).toBe(closed);
  });

  it('Escape → 選單關閉，焦點回到觸發按鈕', async () => {
    const user = userEvent.setup();
    await renderEdit();
    fireEvent.click(checkbox('免場地費'));
    await user.click(trigger());
    await user.tab();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });
});

describe('TC-058 只送有變的欄位；刻意清空要送出', () => {
  const loaded = {
    tags: [{ slug: 'free_venue' }],
    sourceLinks: ['https://a.test/1'],
    equipmentNote: '投影機',
    infoUpdatedOn: '2026-10-01',
    calendarUrl: 'https://cal.test/x',
  };

  it('a：只改店名 → body 不含標籤區五欄', async () => {
    await renderEdit(loaded);
    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '新店名' } });
    save();

    const body = await savedBody();
    expect(body.name).toBe('新店名');
    expectNoTagFields(body);
  });

  it('b：勾掉再勾回 → body 不含標籤區五欄', async () => {
    await renderEdit({
      ...loaded,
      tags: [{ slug: 'free_venue', limited: true, until: '2026-12-31' }],
    });
    fireEvent.click(checkbox('免場地費'));
    fireEvent.click(checkbox('免場地費'));
    save();

    expectNoTagFields(await savedBody());
  });

  it('c：只新增一個原始說明連結 → 只送 sourceLinks', async () => {
    await renderEdit(loaded);
    fireEvent.click(screen.getByRole('button', { name: '新增連結' }));
    fireEvent.change(screen.getByLabelText('原始說明連結 2'), {
      target: { value: 'https://b.test/2' },
    });
    save();

    const body = await savedBody();
    expect(body.sourceLinks).toEqual(['https://a.test/1', 'https://b.test/2']);
    for (const key of TAG_FIELDS.filter((k) => k !== 'sourceLinks')) {
      expect(body).not.toHaveProperty(key);
    }
  });

  it('d：標籤順序跟載入時不同但集合相同 → body 不含標籤區五欄', async () => {
    await renderEdit({ ...loaded, tags: [{ slug: 'private_booking' }, { slug: 'free_venue' }] });
    save();

    expectNoTagFields(await savedBody());
  });

  it('e：五欄全部清空 → 送出空值', async () => {
    await renderEdit(loaded);
    fireEvent.click(checkbox('免場地費'));
    fireEvent.click(screen.getByRole('button', { name: '移除原始說明連結 1' }));
    fireEvent.change(screen.getByLabelText('店家提供的設備（原文）'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('資料更新日期'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('檔期行事曆連結'), { target: { value: '' } });
    save();

    const body = await savedBody();
    expect(body).toMatchObject({
      tags: [],
      sourceLinks: [],
      equipmentNote: '',
      infoUpdatedOn: null,
      calendarUrl: null,
    });
  });
});

describe('TC-061 過期標籤在後台不會被默默刪掉', () => {
  it('保持勾選並標已過期；body 仍含原 until；右欄預覽不顯示', async () => {
    await renderEdit({ tags: [{ slug: 'free_venue', limited: true, until: '2026-10-01' }] });

    expect(checkbox('免場地費').checked).toBe(true);
    expect(screen.getByText('已過期 2026/10/1')).toBeTruthy();
    const preview = screen.getByRole('complementary', { name: '前台會這樣顯示' });
    expect(within(preview).queryByText(/免場地費/)).toBeNull();

    fireEvent.click(checkbox('可包場'));
    save();

    const body = await savedBody();
    expect(body.tags).toEqual(
      expect.arrayContaining([
        { slug: 'free_venue', limited: true, until: '2026-10-01' },
        { slug: 'private_booking' },
      ])
    );
  });
});

describe('TC-063 資料更新日期不自動改', () => {
  it('舊場地 infoUpdatedOn null：欄位空白；勾標籤存檔只送 tags', async () => {
    await renderEdit({ infoUpdatedOn: null });

    expect((screen.getByLabelText('資料更新日期') as HTMLInputElement).value).toBe('');
    fireEvent.click(checkbox('可包場'));
    save();

    const body = await savedBody();
    expect(body.tags).toEqual([{ slug: 'private_booking' }]);
    for (const key of TAG_FIELDS.filter((k) => k !== 'tags')) {
      expect(body).not.toHaveProperty(key);
    }
  });
});

describe('TC-065 限期日期早於今天', () => {
  it('日期欄下方出現警告，仍可存檔並帶該 until', async () => {
    await renderEdit();
    fireEvent.click(checkbox('免場地費'));
    chooseLimit('免場地費', '限期到');
    setUntil('免場地費', '2026-10-14');

    const warning = screen.getByText('這個日期已經過了，存了之後前台不會顯示這個標籤。');
    expect(screen.getByLabelText('免場地費的結束日期').getAttribute('aria-describedby')).toContain(
      warning.id
    );
    save();

    const body = await savedBody();
    expect(body.tags).toEqual([{ slug: 'free_venue', limited: true, until: '2026-10-14' }]);
  });
});

describe('TC-066 原始說明連結上限與格式', () => {
  it('第 5 個之後「新增連結」停用；abc 顯示錯誤、不送出', async () => {
    await renderEdit({ sourceLinks: [] });
    const add = screen.getByRole('button', { name: '新增連結' }) as HTMLButtonElement;
    while (screen.queryByLabelText('原始說明連結 5') === null) fireEvent.click(add);
    expect(add.disabled).toBe(true);

    const first = screen.getByLabelText('原始說明連結 1');
    fireEvent.change(first, { target: { value: 'abc' } });
    save();

    const error = screen.getByText('請輸入完整網址（以 https:// 開頭）');
    expect(first.getAttribute('aria-describedby')).toContain(error.id);
    expect(api.updateVenue).not.toHaveBeenCalled();
  });
});

describe('TC-066 刪掉中間列時，錯誤跟著那一列走', () => {
  it('第 2 列錯、刪掉第 1 列後，錯誤仍在原本那一列（現在是第 1 列）', async () => {
    await renderEdit({ sourceLinks: ['https://ok.test/1'] });
    fireEvent.click(screen.getByRole('button', { name: '新增連結' }));
    fireEvent.change(screen.getByLabelText('原始說明連結 2'), { target: { value: 'abc' } });
    save();
    expect(screen.getByText('請輸入完整網址（以 https:// 開頭）')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '移除原始說明連結 1' }));

    const remaining = screen.getByLabelText('原始說明連結 1') as HTMLInputElement;
    const error = screen.getByText('請輸入完整網址（以 https:// 開頭）');
    expect(remaining.value).toBe('abc');
    expect(remaining.getAttribute('aria-describedby')).toContain(error.id);
    expect(screen.queryByLabelText('原始說明連結 2')).toBeNull();
  });
});

describe('TC-058 載入時就不合法、沒動過的網址不擋存檔', () => {
  it('calendarUrl 載入值不合法，只改店名 → 能存、body 不含 calendarUrl', async () => {
    await renderEdit({ calendarUrl: 'not-a-url', sourceLinks: ['ftp://old.test'] });
    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '新店名' } });
    save();

    const body = await savedBody();
    expect(body.name).toBe('新店名');
    expect(body).not.toHaveProperty('calendarUrl');
    expect(body).not.toHaveProperty('sourceLinks');
  });

  it('改過的網址照樣驗證；大寫 HTTPS:// 跟後端一樣接受', async () => {
    await renderEdit({ calendarUrl: 'not-a-url' });
    fireEvent.change(screen.getByLabelText('檔期行事曆連結'), {
      target: { value: 'HTTPS://cal.test/x' },
    });
    fireEvent.change(screen.getByLabelText('原始說明連結 1'), { target: { value: 'abc' } });
    save();
    expect(screen.getByText('請輸入完整網址（以 https:// 開頭）')).toBeTruthy();
    expect(api.updateVenue).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('原始說明連結 1'), {
      target: { value: 'HTTPS://source.test/1' },
    });
    save();

    const body = await savedBody();
    expect(body.calendarUrl).toBe('HTTPS://cal.test/x');
    expect(body.sourceLinks).toEqual(['HTTPS://source.test/1']);
  });
});

describe('送出擋下時焦點落在出錯的欄位', () => {
  it('「限期到」沒填日期 → 焦點在那個日期欄，顯示錯誤', async () => {
    await renderEdit();
    fireEvent.click(checkbox('可包場'));
    fireEvent.click(checkbox('免場地費'));
    chooseLimit('免場地費', '限期到');
    save();

    const dateInput = screen.getByLabelText('免場地費的結束日期');
    expect(document.activeElement).toBe(dateInput);
    expect(screen.getByText('請選擇日期，或改成「限期（目前沒有設定結束日）」').id).toBe(
      dateInput.getAttribute('aria-describedby')
    );
    expect(api.updateVenue).not.toHaveBeenCalled();
  });

  it('第 2 列連結錯 → 焦點在第 2 列 input', async () => {
    await renderEdit({ sourceLinks: ['https://ok.test/1'] });
    fireEvent.click(screen.getByRole('button', { name: '新增連結' }));
    fireEvent.change(screen.getByLabelText('原始說明連結 2'), { target: { value: 'abc' } });
    save();

    expect(document.activeElement).toBe(screen.getByLabelText('原始說明連結 2'));
  });
});

describe('TC-077 後台儲存失敗', () => {
  it('錯誤橫幅出現，勾選與限期保留，按鈕恢復可按', async () => {
    api.updateVenue.mockRejectedValue(new Error('500'));
    await renderEdit();
    fireEvent.click(checkbox('免場地費'));
    chooseLimit('免場地費', '限期到');
    setUntil('免場地費', '2026-12-31');
    save();

    expect(await screen.findByText(SAVE_FAILED)).toBeTruthy();
    expect(checkbox('免場地費').checked).toBe(true);
    expect(screen.getByRole('button', { name: '免場地費的限期：限期到' })).toBeTruthy();
    expect((screen.getByLabelText('免場地費的結束日期') as HTMLInputElement).value).toBe(
      '2026-12-31'
    );
    await waitFor(() =>
      expect((screen.getByRole('button', { name: '儲存變更' }) as HTMLButtonElement).disabled).toBe(
        false
      )
    );
  });
});

describe('上下架失敗跟存檔失敗分開', () => {
  it('status mutation 失敗 → 上下架控制旁出現新文案，不出現儲存失敗橫幅', async () => {
    api.updateVenue.mockRejectedValue(new Error('500'));
    await renderEdit({ status: 'active' });
    fireEvent.click(screen.getByRole('button', { name: '下架' }));

    const alert = await screen.findByText('上下架失敗，請再試一次。');
    expect(alert.getAttribute('role')).toBe('alert');
    expect(api.updateVenue).toHaveBeenCalledWith('v1', { status: 'inactive' });
    expect(screen.queryByText(SAVE_FAILED)).toBeNull();
  });
});

describe('TC-093 後台字典載入失敗時，不送標籤區欄位', () => {
  it('a：編輯頁整區停用；改店名存檔，body 有 name、不含五欄', async () => {
    await renderEditWithFailedDictionary();

    for (const label of [
      '原始說明連結 1',
      '店家提供的設備（原文）',
      '資料更新日期',
      '檔期行事曆連結',
    ]) {
      expect((screen.getByLabelText(label) as HTMLInputElement).disabled).toBe(true);
    }
    expect((screen.getByRole('button', { name: '新增連結' }) as HTMLButtonElement).disabled).toBe(
      true
    );

    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '新店名' } });
    save();

    const body = await savedBody();
    expect(body.name).toBe('新店名');
    expectNoTagFields(body);
  });

  it('c：新增頁填完必填送出，body 不含五欄', async () => {
    api.getTagDictionary.mockRejectedValue(new Error('500'));
    renderWithClient(<VenueNewPage />);
    await screen.findByText(DICTIONARY_FAILED);
    expect((screen.getByLabelText('資料更新日期') as HTMLInputElement).disabled).toBe(true);

    fillNewVenueRequired();
    fireEvent.click(screen.getByRole('button', { name: '新增場地' }));

    await waitFor(() => expect(api.createVenue).toHaveBeenCalledTimes(1));
    expectNoTagFields(api.createVenue.mock.calls[0][0]);
  });
});

function fillNewVenueRequired() {
  fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '新場地' } });
  fireEvent.change(screen.getByLabelText(/地址/), { target: { value: '新地址' } });
  fireEvent.click(screen.getByRole('button', { name: '請選擇地區' }));
  fireEvent.click(screen.getByRole('option', { name: '台北' }));
  fireEvent.click(screen.getByRole('button', { name: '請選擇容納人數範圍' }));
  fireEvent.click(screen.getByRole('option', { name: '20-40人' }));
  fireEvent.change(screen.getByLabelText('Instagram'), { target: { value: '@venue' } });
  fireEvent.click(screen.getByRole('button', { name: '模擬封面上傳' }));
}

describe('TC-093 字典先成功、之後重新抓取失敗（仍有快取 data）', () => {
  it('標籤區停用並顯示錯誤；改店名存檔，body 不含五欄', async () => {
    api.getAdminVenueById.mockResolvedValue(
      makeVenue({ tags: [{ slug: 'free_venue' }], calendarUrl: 'https://cal.test/x' })
    );
    const client = renderWithClient(<VenueEditPage />);
    await screen.findByRole('checkbox', { name: '免場地費' });

    api.getTagDictionary.mockRejectedValue(new Error('500'));
    await act(async () => {
      await client.refetchQueries({ queryKey: ['venue-tag-dictionary'] });
    });
    expect(client.getQueryData(['venue-tag-dictionary'])).toBeTruthy();

    expect(await screen.findByText(DICTIONARY_FAILED)).toBeTruthy();
    expect(screen.queryByRole('checkbox', { name: '免場地費' })).toBeNull();
    expect((screen.getByLabelText('檔期行事曆連結') as HTMLInputElement).disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '新店名' } });
    save();

    const body = await savedBody();
    expect(body.name).toBe('新店名');
    expectNoTagFields(body);
  });
});

describe('TC-093 字典還在載入中就送出，也不送標籤區欄位', () => {
  beforeEach(() => {
    api.getTagDictionary.mockReturnValue(new Promise(() => {}));
  });

  it('編輯頁：改店名存檔，body 有 name、不含五欄', async () => {
    api.getAdminVenueById.mockResolvedValue(
      makeVenue({ tags: [{ slug: 'free_venue' }], calendarUrl: 'https://cal.test/x' })
    );
    renderWithClient(<VenueEditPage />);
    fireEvent.change(await screen.findByLabelText(/場地名稱/), { target: { value: '新店名' } });
    expect((screen.getByLabelText('資料更新日期') as HTMLInputElement).disabled).toBe(true);
    save();

    const body = await savedBody();
    expect(body.name).toBe('新店名');
    expectNoTagFields(body);
  });

  it('新增頁：填完必填送出，body 不含五欄', async () => {
    renderWithClient(<VenueNewPage />);
    fillNewVenueRequired();
    fireEvent.click(screen.getByRole('button', { name: '新增場地' }));

    await waitFor(() => expect(api.createVenue).toHaveBeenCalledTimes(1));
    expectNoTagFields(api.createVenue.mock.calls[0][0]);
  });
});

describe('TC-009 後台新增場地有標籤區、沒有問卷', () => {
  it('有標籤與店家說明資料區，日期預設台灣今天；POST 帶 tags 與 infoUpdatedOn', async () => {
    renderWithClient(<VenueNewPage />);
    await screen.findByRole('checkbox', { name: '免場地費' });

    expect(screen.queryByText(/辦活動的條件/)).toBeNull();
    expect(screen.getByRole('heading', { name: '標籤' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: '店家說明資料' })).toBeTruthy();
    expect((screen.getByLabelText('資料更新日期') as HTMLInputElement).value).toBe('2026-10-15');

    fillNewVenueRequired();
    fireEvent.click(checkbox('應援物代發'));
    fireEvent.click(checkbox('可包場'));
    fireEvent.click(screen.getByRole('button', { name: '新增場地' }));

    await waitFor(() => expect(api.createVenue).toHaveBeenCalledTimes(1));
    const body = api.createVenue.mock.calls[0][0];
    expect(body.tags).toEqual(
      expect.arrayContaining([{ slug: 'goods_distribution' }, { slug: 'private_booking' }])
    );
    expect(body.tags).toHaveLength(2);
    expect(body.infoUpdatedOn).toBe('2026-10-15');
    expect(body).not.toHaveProperty('sourceLinks');
    expect(body).not.toHaveProperty('equipmentNote');
    expect(body).not.toHaveProperty('calendarUrl');
  });
});
