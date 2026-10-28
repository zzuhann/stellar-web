import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VenueDetail, VenueSubmissionRecord } from '@/types';
import { venueTagDictionaryFixture } from '@/test/venueTagDictionary.fixture';
import VenueEditPage from '@/app/admin-new/venues/[id]/edit/page';
import VenueNewPage from '@/app/admin-new/venues/new/page';

const api = vi.hoisted(() => ({
  getAdminVenueById: vi.fn(),
  getTagDictionary: vi.fn(),
  updateVenue: vi.fn(),
  createVenue: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  venueApi: api,
  placesApi: {},
  handleApiError: () => '伺服器錯誤',
}));
vi.mock('@/lib/revalidate', () => ({ revalidatePublicPages: vi.fn() }));
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
vi.mock('./VenueReselectPlace', () => ({ default: () => null }));

Element.prototype.scrollIntoView = vi.fn();

const TAG_FIELDS = ['tags', 'sourceLinks', 'equipmentNote', 'infoUpdatedOn', 'calendarUrl'];
const INFO_BOX =
  '下面預先勾好的是店家投稿時的建議，還沒有顯示在前台。確認或修改後按「確認標籤並儲存」，卡片和詳情頁才會更新。';
const CONFIRM = '確認標籤並儲存';
const SAVE_OTHERS = '先不確認，只存其他欄位';

beforeEach(() => {
  // 2026-10-20 in Taipei, so the submission date (10-15) and today differ
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-20T04:00:00Z'));
  api.getTagDictionary.mockResolvedValue(venueTagDictionaryFixture);
  api.updateVenue.mockResolvedValue({ message: 'Venue updated' });
  api.createVenue.mockResolvedValue({ id: 'new' });
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

function pendingSubmission(overrides: Partial<VenueSubmissionRecord> = {}): VenueSubmissionRecord {
  return {
    submittedAt: '2026-10-14T17:00:00Z',
    confirmedAt: null,
    suggestedTags: [
      { slug: 'free_venue', source: 'store' },
      { slug: 'can_decorate', source: 'auto' },
    ],
    answers: {
      uses: { options: ['goods_distribution'] },
      services: { options: [] },
      spaceTypes: { options: ['cafe'] },
      sourceLinks: ['https://a.example/1', 'https://b.example/2'],
      note: '可租扭蛋機和投影機',
    },
    ...overrides,
  };
}

function makeVenue(overrides: Partial<VenueDetail> = {}): VenueDetail {
  return {
    id: 'v1',
    name: '投稿咖啡',
    address: '台北市中山區 1 號',
    region: '台北',
    lat: 25.04,
    lng: 121.52,
    placeId: 'ChIJx',
    nearestMrt: null,
    mrtWalkMinutes: null,
    capacityRange: '20-40',
    eventCount: 0,
    coverPhoto: null,
    description: '',
    otherPhotos: [],
    hostTags: [],
    status: 'pending',
    socialMedia: { instagram: '@venue' },
    preferredContact: 'instagram',
    bookingFormUrl: null,
    tags: [],
    sourceLinks: [],
    equipmentNote: '',
    infoUpdatedOn: null,
    calendarUrl: 'https://timetree.app/x',
    transitStops: [],
    events: [],
    ...overrides,
  };
}

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

async function renderEdit(overrides: Partial<VenueDetail> = {}) {
  api.getAdminVenueById.mockResolvedValue(makeVenue(overrides));
  renderWithClient(<VenueEditPage />);
  await screen.findByRole('checkbox', { name: '免場地費' });
}

const checkbox = (name: string) => screen.getByRole('checkbox', { name }) as HTMLInputElement;
const tagRow = (name: string) => checkbox(name).closest('[data-tag-row]') as HTMLElement;

async function body() {
  await waitFor(() => expect(api.updateVenue).toHaveBeenCalledTimes(1));
  return api.updateVenue.mock.calls[0][1] as Record<string, unknown>;
}

describe('TC-010 第一次確認店家建議', () => {
  it('預填、資訊框、兩個存檔動作、投稿日', async () => {
    await renderEdit({ submission: pendingSubmission() });
    expect(screen.getByText(INFO_BOX)).toBeTruthy();
    expect(screen.getByText('店家投稿於 2026/10/15')).toBeTruthy();
    expect(checkbox('免場地費').checked).toBe(true);
    expect(checkbox('可佈置').checked).toBe(true);
    expect((screen.getByLabelText('原始說明連結 1') as HTMLInputElement).value).toBe(
      'https://a.example/1'
    );
    expect((screen.getByLabelText('原始說明連結 2') as HTMLInputElement).value).toBe(
      'https://b.example/2'
    );
    expect((screen.getByLabelText('店家提供的設備（原文）') as HTMLTextAreaElement).value).toBe('');
    expect((screen.getByLabelText('檔期行事曆連結') as HTMLInputElement).value).toBe(
      'https://timetree.app/x'
    );
    expect((screen.getByLabelText('資料更新日期') as HTMLInputElement).value).toBe('2026-10-15');
    expect(screen.getByRole('button', { name: CONFIRM })).toBeTruthy();
    expect(screen.getByRole('button', { name: SAVE_OTHERS })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '儲存變更' })).toBeNull();
  });

  it('a：什麼都不改直接確認 → confirmSuggestions 加上五欄（等於預填）', async () => {
    await renderEdit({ submission: pendingSubmission() });
    fireEvent.click(screen.getByRole('button', { name: CONFIRM }));
    expect(await body()).toMatchObject({
      confirmSuggestions: true,
      tags: [{ slug: 'free_venue' }, { slug: 'can_decorate' }],
      sourceLinks: ['https://a.example/1', 'https://b.example/2'],
      equipmentNote: '',
      infoUpdatedOn: '2026-10-15',
      calendarUrl: 'https://timetree.app/x',
    });
  });

  it('b：取消 free_venue、勾 deposit → 來源標記、差異摘要、送出目前勾選', async () => {
    await renderEdit({ submission: pendingSubmission() });
    fireEvent.click(checkbox('免場地費'));
    fireEvent.click(checkbox('需押金'));
    expect(within(tagRow('免場地費')).getByText('店家建議・未採用')).toBeTruthy();
    expect(within(tagRow('可佈置')).getByText('自動帶入')).toBeTruthy();
    expect(within(tagRow('需押金')).getByText('管理員新增')).toBeTruthy();
    expect(
      screen.getByText('跟店家建議相比：自動帶入 可佈置；新增 需押金；未採用 免場地費')
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: CONFIRM }));
    const sent = await body();
    expect(sent.confirmSuggestions).toBe(true);
    const slugs = (sent.tags as { slug: string }[]).map((t) => t.slug);
    expect(slugs).not.toContain('free_venue');
    expect(slugs).toContain('deposit');
    expect(slugs).toContain('can_decorate');
    for (const key of TAG_FIELDS) expect(sent).toHaveProperty(key);
  });
});

describe('TC-059「先不確認，只存其他欄位」', () => {
  it('只送其他欄位；重新載入後資訊框與建議勾選仍在', async () => {
    await renderEdit({ submission: pendingSubmission() });
    fireEvent.change(screen.getByLabelText('場地描述'), { target: { value: '新說明' } });
    fireEvent.click(checkbox('免場地費'));
    fireEvent.click(screen.getByRole('button', { name: SAVE_OTHERS }));
    const sent = await body();
    expect(sent.description).toBe('新說明');
    expect(sent).not.toHaveProperty('confirmSuggestions');
    for (const key of TAG_FIELDS) expect(sent).not.toHaveProperty(key);

    cleanup();
    await renderEdit({ submission: pendingSubmission() });
    expect(screen.getByText(INFO_BOX)).toBeTruthy();
    expect(checkbox('免場地費').checked).toBe(true);
    expect(within(tagRow('免場地費')).getByText('店家建議')).toBeTruthy();
  });
});

describe('TC-060 已確認過的場地', () => {
  it('用正式 tags；沒有資訊框、來源標記、差異摘要；回答收合；只有「儲存變更」', async () => {
    await renderEdit({
      tags: [{ slug: 'goods_distribution' }],
      submission: pendingSubmission({ confirmedAt: '2026-10-16T00:00:00Z' }),
    });
    expect(checkbox('應援物代發').checked).toBe(true);
    expect(checkbox('免場地費').checked).toBe(false);
    expect(screen.queryByText(INFO_BOX)).toBeNull();
    expect(screen.queryByText('店家建議')).toBeNull();
    expect(screen.queryByText(/跟店家建議相比/)).toBeNull();
    const answers = screen.getByText('店家投稿時的回答').closest('details') as HTMLDetailsElement;
    expect(answers.open).toBe(false);
    expect(screen.queryByRole('button', { name: CONFIRM })).toBeNull();
    expect(screen.queryByRole('button', { name: SAVE_OTHERS })).toBeNull();

    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '改名' } });
    fireEvent.click(screen.getByRole('button', { name: '儲存變更' }));
    const sent = await body();
    expect(sent).not.toHaveProperty('confirmSuggestions');
    for (const key of TAG_FIELDS) expect(sent).not.toHaveProperty(key);
  });
});

describe('TC-062 hostTags 唯讀後不送', () => {
  it('唯讀顯示、沒有輸入框；PATCH 不含 hostTags', async () => {
    await renderEdit({ hostTags: ['大空間', '老闆許願少女時代生咖'] });
    expect(
      screen.getByText('店家舊自填標籤（已停用，只供參考）：大空間、老闆許願少女時代生咖')
    ).toBeTruthy();
    expect(screen.queryByPlaceholderText('輸入標籤後按 Enter 或點新增')).toBeNull();
    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '改名' } });
    fireEvent.click(screen.getByRole('button', { name: '儲存變更' }));
    expect(await body()).not.toHaveProperty('hostTags');
  });
});

describe('TC-064 近捷運只在投稿時自動帶入', () => {
  const stops = [
    { type: 'bus' as const, station: '市政府', walkMinutes: 2 },
    { type: 'mrt' as const, station: '中山站', walkMinutes: 5 },
  ];

  it('後台編輯：不自動勾，小字讀捷運那一列', async () => {
    await renderEdit({ transitStops: stops });
    expect(checkbox('近捷運').checked).toBe(false);
    expect(within(tagRow('近捷運')).getByText('中山站，步行 5 分鐘')).toBeTruthy();
  });

  it('後台新增：填同樣兩列也不自動勾', async () => {
    renderWithClient(<VenueNewPage />);
    await screen.findByRole('checkbox', { name: '免場地費' });
    fireEvent.click(screen.getByRole('button', { name: /^交通方式 1 類型：/ }));
    fireEvent.click(screen.getByRole('option', { name: '公車站' }));
    fireEvent.change(screen.getByLabelText('交通方式 1 站名'), { target: { value: '市政府' } });
    fireEvent.click(screen.getByRole('button', { name: '新增交通方式' }));
    fireEvent.click(screen.getByRole('button', { name: /^交通方式 2 類型：/ }));
    fireEvent.click(screen.getByRole('option', { name: '捷運' }));
    fireEvent.change(screen.getByLabelText('交通方式 2 站名'), { target: { value: '中山站' } });
    fireEvent.change(screen.getByLabelText('交通方式 2 步行分鐘'), { target: { value: '5' } });
    expect(checkbox('近捷運').checked).toBe(false);
    expect(within(tagRow('近捷運')).getByText('中山站，步行 5 分鐘')).toBeTruthy();
  });
});

describe('TC-067「店家投稿時補充」', () => {
  it('照原文顯示 note、服務題「還沒確定」、最後一句固定', async () => {
    await renderEdit({
      submission: pendingSubmission({
        answers: {
          ...pendingSubmission().answers,
          note: '保證金撤展後退還\n可租扭蛋機',
          services: { options: [], discussable: true },
        },
      }),
    });
    const box = screen.getByRole('region', { name: '店家投稿時補充' });
    expect(within(box).getByText(/保證金撤展後退還/).textContent).toBe(
      '保證金撤展後退還\n可租扭蛋機'
    );
    expect(within(box).getByText('服務：店家勾了「還沒確定，想先跟主辦聊聊」')).toBeTruthy();
    expect(
      within(box).getByText('這段不會變成標籤。設備的部分請複製到「店家提供的設備」。')
    ).toBeTruthy();
  });
});

describe('TC-093 b 字典載入失敗、有未確認建議', () => {
  it('「確認標籤並儲存」停用；「先不確認」不送五欄與 confirmSuggestions', async () => {
    api.getTagDictionary.mockRejectedValue(new Error('500'));
    api.getAdminVenueById.mockResolvedValue(makeVenue({ submission: pendingSubmission() }));
    renderWithClient(<VenueEditPage />);
    await screen.findByText('標籤載入失敗，請重新整理頁面');
    const confirm = screen.getByRole('button', { name: CONFIRM }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    fireEvent.click(confirm);
    expect(api.updateVenue).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('場地描述'), { target: { value: '新說明' } });
    fireEvent.click(screen.getByRole('button', { name: SAVE_OTHERS }));
    const sent = await body();
    expect(sent.description).toBe('新說明');
    expect(sent).not.toHaveProperty('confirmSuggestions');
    for (const key of TAG_FIELDS) expect(sent).not.toHaveProperty(key);
  });
});

describe('TC-139 後台編輯交通，送出的 request', () => {
  const two = [
    { type: 'mrt' as const, station: '中山', walkMinutes: 5 },
    { type: 'bus' as const, station: '市政府', walkMinutes: null },
  ];
  const save = () => fireEvent.click(screen.getByRole('button', { name: '儲存變更' }));
  const rename = () =>
    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '改名' } });

  it('a：舊場地預填一列、類型留空；只改店名 → 不帶 transitStops、不被擋', async () => {
    await renderEdit({ transitStops: null, nearestMrt: '中山站', mrtWalkMinutes: 5 });
    expect((screen.getByLabelText('交通方式 1 站名') as HTMLInputElement).value).toBe('中山站');
    expect((screen.getByLabelText('交通方式 1 步行分鐘') as HTMLInputElement).value).toBe('5');
    expect(screen.getByRole('button', { name: '交通方式 1 類型：類型' })).toBeTruthy();
    rename();
    save();
    const sent = await body();
    expect(sent).not.toHaveProperty('transitStops');
    expect(screen.queryByText('請選交通類型')).toBeNull();
  });

  it('b：新增第三筆 → 帶三筆', async () => {
    await renderEdit({ transitStops: two });
    fireEvent.click(screen.getByRole('button', { name: '新增交通方式' }));
    fireEvent.click(screen.getByRole('button', { name: /^交通方式 3 類型：/ }));
    fireEvent.click(screen.getByRole('option', { name: '火車站' }));
    fireEvent.change(screen.getByLabelText('交通方式 3 站名'), { target: { value: '台北車站' } });
    save();
    expect((await body()).transitStops).toEqual([
      ...two,
      { type: 'train', station: '台北車站', walkMinutes: null },
    ]);
  });

  it('c：改一筆站名 → 帶修改後的兩筆', async () => {
    await renderEdit({ transitStops: two });
    fireEvent.change(screen.getByLabelText('交通方式 2 站名'), { target: { value: '市府' } });
    save();
    expect((await body()).transitStops).toEqual([two[0], { ...two[1], station: '市府' }]);
  });

  it('d：兩筆都移除 → transitStops: []', async () => {
    await renderEdit({ transitStops: two });
    fireEvent.click(screen.getAllByRole('button', { name: '移除這個交通方式' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: '移除這個交通方式' })[0]);
    save();
    expect((await body()).transitStops).toEqual([]);
  });

  it('e：改了又改回 → 不帶 transitStops', async () => {
    await renderEdit({ transitStops: two });
    const station = screen.getByLabelText('交通方式 1 站名');
    fireEvent.change(station, { target: { value: '雙連' } });
    fireEvent.change(station, { target: { value: '中山' } });
    rename();
    save();
    expect(await body()).not.toHaveProperty('transitStops');
  });

  it('改到交通時才驗類型：舊資料改了站名但沒選類型 → 擋下', async () => {
    await renderEdit({ transitStops: null, nearestMrt: '中山站', mrtWalkMinutes: 5 });
    fireEvent.change(screen.getByLabelText('交通方式 1 站名'), { target: { value: '雙連站' } });
    save();
    expect(await screen.findByText('請選交通類型')).toBeTruthy();
    expect(api.updateVenue).not.toHaveBeenCalled();
  });

  it('f：後台新增填一筆交通 → POST 帶 transitStops', async () => {
    renderWithClient(<VenueNewPage />);
    await screen.findByRole('checkbox', { name: '免場地費' });
    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '新店' } });
    fireEvent.change(screen.getByLabelText(/地址/), { target: { value: '地址' } });
    fireEvent.click(screen.getByRole('button', { name: '請選擇地區' }));
    fireEvent.click(screen.getByRole('option', { name: '台北' }));
    fireEvent.click(screen.getByRole('button', { name: '請選擇容納人數範圍' }));
    fireEvent.click(screen.getByRole('option', { name: '20-40人' }));
    fireEvent.change(screen.getByLabelText('Instagram'), { target: { value: '@v' } });
    fireEvent.click(screen.getByRole('button', { name: '模擬封面上傳' }));
    fireEvent.click(screen.getByRole('button', { name: /^交通方式 1 類型：/ }));
    fireEvent.click(screen.getByRole('option', { name: '捷運' }));
    fireEvent.change(screen.getByLabelText('交通方式 1 站名'), { target: { value: '中山' } });
    fireEvent.click(screen.getByRole('button', { name: '新增場地' }));
    await waitFor(() => expect(api.createVenue).toHaveBeenCalledTimes(1));
    const sent = api.createVenue.mock.calls[0][0];
    expect(sent.transitStops).toEqual([{ type: 'mrt', station: '中山', walkMinutes: null }]);
    expect(sent).not.toHaveProperty('hostTags');
    expect(sent).not.toHaveProperty('nearestMrt');
  });
});

describe('TC-140「店家投稿時的回答」的顯示條件', () => {
  it('a：只答押金、沒有 note 與「還沒確定」→ 沒有補充框；回答展開、場地費和保底寫「沒答」', async () => {
    await renderEdit({
      submission: pendingSubmission({
        answers: {
          uses: { options: ['can_decorate'] },
          fees: { deposit: 'no' },
          services: { options: ['custom_menu'] },
          spaceTypes: { options: ['cafe'] },
        },
      }),
    });
    expect(screen.queryByRole('region', { name: '店家投稿時補充' })).toBeNull();
    const answers = screen.getByText('店家投稿時的回答').closest('details') as HTMLDetailsElement;
    expect(answers.open).toBe(true);
    expect(within(answers).getByText('押金：不用')).toBeTruthy();
    expect(within(answers).getByText('場地費：沒答')).toBeTruthy();
    expect(within(answers).getByText('保底：沒答')).toBeTruthy();
  });

  it('b：沒選佈置 →「沒有選佈置、辦生咖，不用答費用」', async () => {
    await renderEdit({ submission: pendingSubmission() });
    expect(screen.getByText('沒有選佈置、辦生咖，不用答費用')).toBeTruthy();
  });

  it('沒有 submission 的場地不出現', async () => {
    await renderEdit();
    expect(screen.queryByText('店家投稿時的回答')).toBeNull();
  });
});
