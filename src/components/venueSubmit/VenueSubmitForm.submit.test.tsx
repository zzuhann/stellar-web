import { act, cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTransitRow } from '@/utils/transitStops';
import { DEPTH_KEY } from './stepHistory';
import { createLinkRow } from './venueSubmitModel';
import {
  check,
  chooseDropdown,
  coverInput,
  fieldset,
  filledForm,
  fillStep1,
  fillStep2,
  fillStep3Contact,
  imageFile,
  next,
  readStoredDraft,
  renderPage,
  resetBrowserState,
  seedHistory,
  selectFiles,
  storeDraft,
  submit,
  waitForStep,
} from './testing/venueSubmitTestUtils';

const api = vi.hoisted(() => ({
  create: vi.fn(),
  autocomplete: vi.fn(),
  getPlaceDetails: vi.fn(),
}));
const upload = vi.hoisted(() => ({
  uploadImageToAPI: vi.fn(),
  compressImage: vi.fn(async (file: File) => file),
}));

// handleApiError is real; its axios client (and Firebase) is not
vi.mock('@/lib/api/client', () => ({ default: {} }));
vi.mock('@/lib/api', async () => {
  const misc = await vi.importActual<typeof import('@/lib/api/misc')>('@/lib/api/misc');
  return { venueSubmissionApi: api, handleApiError: misc.handleApiError };
});
vi.mock('@/lib/r2-upload', () => upload);
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
const routerReplace = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: routerReplace, push: vi.fn() }),
  usePathname: () => '/submit-venue',
}));
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));
vi.mock('@/components/layout/Footer', () => ({ default: () => <footer>站尾</footer> }));
vi.mock('@/components/forms/PlaceAutocomplete', () => {
  const places = [
    {
      place_id: 'place-1',
      address: '台北市中山區 A 路 1 號',
      coordinates: { lat: 25.05, lng: 121.52 },
      name: 'A 咖啡',
      city: '台北市',
      types: ['cafe', 'establishment'],
    },
    {
      place_id: 'place-2',
      address: '台北市大安區 B 路 2 號',
      coordinates: { lat: 25.03, lng: 121.54 },
      name: 'B 咖啡',
      city: '台北市',
      types: ['establishment'],
    },
    {
      place_id: 'place-3',
      address: '台北市中山區中山北路一段 1 號',
      coordinates: { lat: 25.06, lng: 121.5 },
      name: '中山北路一段 1 號',
      city: '台北市',
      types: ['street_address'],
    },
    {
      place_id: 'place-4',
      address: '台北市某處',
      coordinates: { lat: 25.07, lng: 121.51 },
      name: '某處',
      city: '台北市',
      types: [],
    },
  ];
  return {
    default: ({
      onPlaceSelect,
      inputId,
      invalid,
      describedBy,
    }: {
      onPlaceSelect: (p: (typeof places)[number]) => void;
      inputId?: string;
      invalid?: boolean;
      describedBy?: string;
    }) => (
      <div>
        <input
          id={inputId}
          aria-label="搜尋地點"
          aria-invalid={invalid ? 'true' : undefined}
          aria-describedby={describedBy}
        />
        {places.map((p) => (
          <button key={p.place_id} type="button" onClick={() => onPlaceSelect(p)}>
            選 {p.name}
          </button>
        ))}
      </div>
    ),
  };
});

const scrollTo = vi.fn();
const CDN = 'https://cdn.stellar-zone.com/';
const FAILED_BANNER =
  '送出場地投稿失敗，請確認錯誤訊息及網路連線狀態後再次送出，若持續失敗，請私訊 STELLAR IG 或是 Threads 帳號。';

beforeEach(() => {
  resetBrowserState();
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  api.create.mockResolvedValue(undefined);
  upload.uploadImageToAPI.mockResolvedValue({ success: true, filename: 'cover.jpg' });
  routerReplace.mockClear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function axiosError(status: number, data: Record<string, unknown>) {
  return new AxiosError('fail', 'ERR', undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

async function fillEverything() {
  renderPage();
  await waitForStep(1);
  await fillStep1();
  next();
  await waitForStep(2);
  fillStep2();
  next();
  await waitForStep(3);
  fillStep3Contact();
  selectFiles(coverInput(), [imageFile('cover.png')]);
  await waitFor(() => expect(screen.getByAltText('封面照片')).toBeTruthy());
}

describe('TC-011 完整填寫送出的 body', () => {
  it.each([
    { name: '有交通兩列', withTransit: true },
    { name: '交通全部空白', withTransit: false },
  ])('$name：逐值比對', async ({ withTransit }) => {
    renderPage();
    await waitForStep(1);
    await fillStep1();
    if (withTransit) {
      chooseDropdown('交通方式 1 類型', '捷運');
      fireEvent.change(screen.getByLabelText('交通方式 1 站名'), { target: { value: '中山' } });
      fireEvent.change(screen.getByLabelText('交通方式 1 步行分鐘'), { target: { value: '0' } });
      fireEvent.click(screen.getByRole('button', { name: '新增交通方式' }));
      chooseDropdown('交通方式 2 類型', '公車站');
      fireEvent.change(screen.getByLabelText('交通方式 2 站名'), { target: { value: '市政府' } });
      fireEvent.change(screen.getByLabelText('交通方式 2 步行分鐘'), { target: { value: '3' } });
    }
    next();
    await waitForStep(2);
    const uses = fieldset('主辦可以在這個空間做什麼？');
    check('發放應援物', uses);
    check('佈置、辦生咖', uses);
    fireEvent.click(screen.getByRole('radio', { name: '不用場地費' }));
    check('期間限定');
    fireEvent.change(screen.getByLabelText('免場地費到'), {
      target: { value: '2099-12-31' },
    });
    fireEvent.click(screen.getByRole('radio', { name: '有' }));
    check('代收應援物');
    check('咖啡廳');
    check('佈置設備');
    fireEvent.change(screen.getByLabelText(/還有什麼想讓主辦知道的？/), {
      target: { value: '可租扭蛋機' },
    });
    next();
    await waitForStep(3);
    fillStep3Contact();
    fireEvent.change(screen.getByLabelText(/預約表單網址/), {
      target: { value: 'https://forms.gle/x' },
    });
    fireEvent.change(screen.getByLabelText('說明文件連結 1'), {
      target: { value: 'https://a.example/rules.pdf' },
    });
    fireEvent.click(screen.getByRole('button', { name: '新增說明文件連結' }));
    fireEvent.change(screen.getByLabelText('說明文件連結 2'), {
      target: { value: 'https://b.example/plan' },
    });
    fireEvent.change(screen.getByLabelText(/檔期行事曆連結/), {
      target: { value: 'https://timetree.app/x' },
    });
    selectFiles(coverInput(), [imageFile('cover.png')]);
    await waitFor(() => expect(screen.getByAltText('封面照片')).toBeTruthy());
    submit();

    expect(await screen.findByRole('heading', { name: '已收到場地投稿' })).toBeTruthy();
    const body = api.create.mock.calls[0][0];
    expect(body.venueConditions).toEqual({
      uses: { options: ['goods_distribution', 'can_decorate'] },
      fees: {
        venueFee: 'free',
        freeVenueLimited: true,
        freeVenueUntil: '2099-12-31',
        guarantee: 'yes',
      },
      services: { options: ['parcel_receiving'] },
      spaceTypes: { options: ['cafe'] },
      equipment: ['display_fixtures'],
      note: '可租扭蛋機',
      sourceLinks: ['https://a.example/rules.pdf', 'https://b.example/plan'],
      calendarUrl: 'https://timetree.app/x',
    });
    expect(body).not.toHaveProperty('hostTags');
    expect(body).not.toHaveProperty('tags');
    expect(JSON.stringify(body)).not.toMatch(/"other"|otherEquipment/);
    expect(body.transitStops).toEqual(
      withTransit
        ? [
            { type: 'mrt', station: '中山', walkMinutes: 0 },
            { type: 'bus', station: '市政府', walkMinutes: 3 },
          ]
        : []
    );
    expect(body).toMatchObject({
      bookingFormUrl: 'https://forms.gle/x',
      placeId: 'place-1',
      lat: 25.05,
      lng: 121.52,
      preferredContact: 'instagram',
      socialMedia: { instagram: 'stellar_cafe' },
      coverPhoto: `${CDN}cover.jpg`,
      name: 'A 咖啡',
      region: '台北',
      capacityRange: '20-40',
    });
  });
});

describe('TC-118 送出中', () => {
  it('只顯示轉圈、停用、aria-busy；上一步停用；連點只打一次 API', async () => {
    await fillEverything();
    let resolve: () => void = () => {};
    api.create.mockImplementation(() => new Promise<void>((r) => (resolve = r)));
    submit();
    const busy = await screen.findByRole('button', { name: '送出中' });
    expect((busy as HTMLButtonElement).disabled).toBe(true);
    expect(busy.getAttribute('aria-busy')).toBe('true');
    expect((screen.getByRole('button', { name: '上一步' }) as HTMLButtonElement).disabled).toBe(
      true
    );
    fireEvent.click(busy);
    expect(api.create).toHaveBeenCalledTimes(1);
    await act(async () => resolve());
  });
});

describe('TC-119 c～e 送出時三步再驗（Integration）', () => {
  const brokenName = () => filledForm({ name: '' });

  it('c：depth 2、第 1 步有錯 → go(-2)、不 push，回到第 1 步顯示錯誤、焦點在名稱', async () => {
    seedHistory(3);
    storeDraft(brokenName(), { maxStep: 3, depth: 2 });
    const go = vi.spyOn(window.history, 'go');
    const push = vi.spyOn(window.history, 'pushState');
    renderPage();
    await waitForStep(3);
    submit();
    expect(go).toHaveBeenCalledWith(-2);
    expect(push).not.toHaveBeenCalled();
    await waitForStep(1);
    const name = screen.getByLabelText('場地名稱');
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('請填寫場地名稱')).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(name));
    expect(api.create).not.toHaveBeenCalled();
  });

  it.each([
    { name: 'd：history.state 沒有 depth', depth: null },
    { name: 'e：depth 不夠退', depth: 1 },
  ])('$name → replaceState 換成第 1 步，不呼叫 go、pushState', async ({ depth }) => {
    seedHistory(3);
    storeDraft(brokenName(), { maxStep: 3, depth: 2 });
    renderPage();
    await waitForStep(3);
    window.history.replaceState(
      depth === null ? null : { [DEPTH_KEY]: depth },
      '',
      window.location.href
    );
    const go = vi.spyOn(window.history, 'go');
    const push = vi.spyOn(window.history, 'pushState');
    const replace = vi.spyOn(window.history, 'replaceState');
    submit();
    await waitForStep(1);
    expect(go).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    // state may be null here, which expect.anything() does not match
    expect(replace.mock.calls.map((call) => call[2])).toContain('/submit-venue?step=1');
    expect(screen.getByText('請填寫場地名稱')).toBeTruthy();
  });
});

describe('TC-075 / TC-076 / TC-143 送出失敗', () => {
  it('TC-075 留在第 3 步、橫幅＋handleApiError 訊息、隱藏的 B 答案保留且不送', async () => {
    renderPage();
    await waitForStep(1);
    await fillStep1();
    next();
    await waitForStep(2);
    const uses = fieldset('主辦可以在這個空間做什麼？');
    check('佈置、辦生咖', uses);
    fireEvent.click(screen.getByRole('radio', { name: '要場地費' }));
    check('佈置、辦生咖', uses);
    check('發放應援物', uses);
    check('客製餐點');
    check('咖啡廳');
    fireEvent.change(screen.getByLabelText(/還有什麼想讓主辦知道的？/), { target: { value: 'N' } });
    next();
    await waitForStep(3);
    fillStep3Contact();
    selectFiles(coverInput(), [imageFile('cover.png')]);
    await waitFor(() => expect(screen.getByAltText('封面照片')).toBeTruthy());

    api.create
      .mockRejectedValueOnce(axiosError(500, { error: '投稿暫時失敗' }))
      .mockResolvedValueOnce(undefined);
    submit();
    const banner = await screen.findByRole('alert', { name: '' }).catch(() => null);
    expect(await screen.findByText(FAILED_BANNER)).toBeTruthy();
    expect(screen.getByText('投稿暫時失敗')).toBeTruthy();
    expect(banner).toBeDefined();
    await waitForStep(3);

    submit();
    expect(await screen.findByRole('heading', { name: '已收到場地投稿' })).toBeTruthy();
    const second = api.create.mock.calls[1][0];
    expect(second.venueConditions).not.toHaveProperty('fees');
    expect(second.venueConditions.note).toBe('N');
    expect(api.create.mock.calls[0][0]).toEqual(second);
  });

  it('TC-076 後端 400 VALIDATION_ERROR → 顯示後端中文原因，資料保留', async () => {
    await fillEverything();
    api.create.mockRejectedValueOnce(
      axiosError(400, {
        code: 'VALIDATION_ERROR',
        field: 'venueConditions.uses',
        error: '至少選一項用途',
      })
    );
    submit();
    expect(await screen.findByText(/至少選一項用途/)).toBeTruthy();
    expect(screen.queryByText('投稿失敗，請稍後再試')).toBeNull();
    expect((screen.getByLabelText('Instagram 帳號') as HTMLInputElement).value).toBe(
      'stellar_cafe'
    );
  });

  it('TC-143 失敗後暫存還在；重新掛載停在第 3 步、沒有橫幅與錯誤；再送一次內容相同', async () => {
    await fillEverything();
    api.create.mockRejectedValueOnce(axiosError(500, { error: '投稿暫時失敗' }));
    submit();
    expect(await screen.findByText(FAILED_BANNER)).toBeTruthy();
    expect(readStoredDraft()).not.toBeNull();
    const first = api.create.mock.calls[0][0];

    cleanup();
    renderPage();
    await waitForStep(3);
    expect(screen.queryByText(FAILED_BANNER)).toBeNull();
    expect(document.querySelector('[aria-invalid="true"]')).toBeNull();
    submit();
    expect(await screen.findByRole('heading', { name: '已收到場地投稿' })).toBeTruthy();
    expect(api.create.mock.calls[1][0]).toEqual(first);
  });
});

describe('TC-121 送出成功後暫存清空、不會被寫回', () => {
  it('清掉之後沒有 setItem 再寫回', async () => {
    await fillEverything();
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem');
    submit();
    expect(await screen.findByRole('heading', { name: '已收到場地投稿' })).toBeTruthy();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    expect(readStoredDraft()).toBeNull();
    const lastRemove = Math.max(...removeItem.mock.invocationCallOrder);
    expect(setItem.mock.invocationCallOrder.filter((order) => order > lastRemove)).toEqual([]);
    expect(window.location.search).toBe('');
  });
});

describe('TC-103 / TC-123 / TC-124 還原', () => {
  it('TC-103 掛載時第一次 setItem 不是空白表單', async () => {
    seedHistory(2);
    storeDraft(filledForm({ name: '舊店名' }), { maxStep: 2, depth: 1 });
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    renderPage();
    await waitForStep(2);
    for (const [, value] of setItem.mock.calls) {
      expect(JSON.parse(value as string).form.name).toBe('舊店名');
    }
    expect(readStoredDraft().form.name).toBe('舊店名');
  });

  it('TC-123 三步都填、隱藏答案也在，第 3 步重新整理後全部還原、沒有錯誤', async () => {
    seedHistory(3);
    const form = filledForm({
      transitStops: [
        createTransitRow({ type: 'mrt', station: '中山', walkMinutes: '5' }),
        createTransitRow({ type: 'bus', station: '市政府', walkMinutes: '' }),
        createTransitRow({ type: 'train', station: '台北車站', walkMinutes: '9' }),
      ],
      fees: {
        venueFee: 'free',
        freeVenueLimited: false,
        freeVenueUntil: '2099-01-01',
        guarantee: 'yes',
        deposit: '',
        discussable: false,
      },
      note: '可租扭蛋機',
      sourceLinks: [createLinkRow('https://a.example'), createLinkRow('https://b.example')],
      calendarUrl: 'https://timetree.app/x',
      description: '店家介紹',
      otherPhotos: [
        { id: 'p1', url: `${CDN}p1.jpg` },
        { id: 'p2', url: `${CDN}p2.jpg` },
      ],
    });
    storeDraft(form, { maxStep: 3, depth: 2 });
    renderPage();
    await waitForStep(3);
    expect(document.querySelector('[aria-invalid="true"]')).toBeNull();
    expect((screen.getByLabelText('說明文件連結 2') as HTMLInputElement).value).toBe(
      'https://b.example'
    );
    expect((screen.getByLabelText(/店家介紹/) as HTMLTextAreaElement).value).toBe('店家介紹');
    expect(screen.getAllByAltText(/^其他照片 /)).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: '上一步' }));
    await waitForStep(2);
    check('佈置、辦生咖', fieldset('主辦可以在這個空間做什麼？'));
    expect((screen.getByRole('radio', { name: '有' }) as HTMLInputElement).checked).toBe(true);
    check('期間限定');
    expect((screen.getByLabelText('免場地費到') as HTMLInputElement).value).toBe('2099-01-01');
    fireEvent.click(screen.getByRole('button', { name: '上一步' }));
    await waitForStep(1);
    expect((screen.getByLabelText('交通方式 3 站名') as HTMLInputElement).value).toBe('台北車站');
  });

  it('TC-124 a：選了店家後重新整理 → 卡片與名稱還在，送出帶原本的座標與 placeId', async () => {
    renderPage();
    await waitForStep(1);
    fireEvent.click(screen.getByRole('button', { name: '選 A 咖啡' }));
    cleanup();
    renderPage();
    await waitForStep(1);
    expect(screen.getByText('台北市中山區 A 路 1 號')).toBeTruthy();
    expect((screen.getByLabelText('場地名稱') as HTMLInputElement).value).toBe('A 咖啡');
    chooseDropdown('地區', '台北');
    chooseDropdown('場地大約可以容納多少人？', '20-40人');
    next();
    await waitForStep(2);
    fillStep2();
    next();
    await waitForStep(3);
    fillStep3Contact();
    selectFiles(coverInput(), [imageFile('cover.png')]);
    await waitFor(() => expect(screen.getByAltText('封面照片')).toBeTruthy());
    submit();
    await waitFor(() => expect(api.create).toHaveBeenCalledTimes(1));
    expect(api.create.mock.calls[0][0]).toMatchObject({
      placeId: 'place-1',
      lat: 25.05,
      lng: 121.52,
    });
  });

  it('TC-124 b：按過「重新搜尋」後重新整理 → 搜尋框、名稱隱藏但值還在；選地址型後名稱是原本的', async () => {
    renderPage();
    await waitForStep(1);
    fireEvent.click(screen.getByRole('button', { name: '選 A 咖啡' }));
    fireEvent.change(screen.getByLabelText('場地名稱'), { target: { value: 'A 二店' } });
    fireEvent.click(screen.getByRole('button', { name: '重新搜尋' }));
    cleanup();
    renderPage();
    await waitForStep(1);
    expect(screen.getByLabelText('搜尋地點')).toBeTruthy();
    expect(screen.queryByLabelText('場地名稱')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '選 中山北路一段 1 號' }));
    expect((screen.getByLabelText('場地名稱') as HTMLInputElement).value).toBe('A 二店');
  });
});

describe('TC-127 sessionStorage 不能用', () => {
  it('a：getItem 拋錯 → 表單照常可送出', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    await fillEverything();
    submit();
    expect(await screen.findByRole('heading', { name: '已收到場地投稿' })).toBeTruthy();
  });

  it('b：讀 window.sessionStorage 屬性本身就拋錯 → 表單照常可送出', async () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'sessionStorage');
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError');
      },
    });
    try {
      await fillEverything();
      submit();
      expect(await screen.findByRole('heading', { name: '已收到場地投稿' })).toBeTruthy();
    } finally {
      if (descriptor) Object.defineProperty(window, 'sessionStorage', descriptor);
    }
  });

  it('c：setItem 失敗 → removeItem 清掉舊暫存，重新掛載是空白第 1 步', async () => {
    seedHistory(2);
    storeDraft(filledForm({ name: '舊店名' }), { maxStep: 2, depth: 1 });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem');
    renderPage();
    await waitForStep(2);
    fireEvent.click(screen.getByRole('button', { name: '上一步' }));
    await waitForStep(1);
    fireEvent.change(screen.getByLabelText('場地名稱'), { target: { value: '新店名' } });
    expect(setItem).toHaveBeenCalled();
    expect(removeItem).toHaveBeenCalledWith('stellar:venue-submit-draft');

    cleanup();
    seedHistory(1);
    renderPage();
    await waitForStep(1);
    expect(screen.queryByDisplayValue('舊店名')).toBeNull();
    expect(screen.queryByLabelText('場地名稱')).toBeNull();
  });
});

describe('TC-130 按「×」離開', () => {
  it('a、b：有填 → 對話框；「繼續填寫」留下；「離開」清暫存並到首頁', async () => {
    renderPage();
    await waitForStep(1);
    chooseDropdown('地區', '台北');
    fireEvent.click(screen.getByRole('button', { name: '離開投稿' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText('要離開嗎？目前填寫的資料都不會儲存哦！')).toBeTruthy();
    fireEvent.click(within(dialog).getByRole('button', { name: '繼續填寫' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.getByRole('button', { name: /^地區：台北/ })).toBeTruthy();
    expect(readStoredDraft()).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '離開投稿' }));
    fireEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: '離開' })
    );
    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith('/'));
    expect(readStoredDraft()).toBeNull();
  });

  it('c：什麼都沒填 → 不跳對話框，直接到首頁', async () => {
    renderPage();
    await waitForStep(1);
    fireEvent.click(screen.getByRole('button', { name: '離開投稿' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith('/'));
  });

  it('從站內連結重新進表單（網址沒有 step）不沿用暫存的 depth，離開時不會多退', async () => {
    storeDraft(filledForm(), { maxStep: 3, depth: 2 });
    window.history.pushState(null, '', '/submit-venue');
    const go = vi.spyOn(window.history, 'go');
    renderPage();
    await waitForStep(1);
    expect(window.history.state[DEPTH_KEY]).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: '離開投稿' }));
    fireEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: '離開' })
    );
    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith('/'));
    expect(go).not.toHaveBeenCalled();
  });
});

describe('TC-131 beforeunload', () => {
  const fire = () => {
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    return event.defaultPrevented;
  };

  it('沒填不擋；有填才擋；送出成功後不擋', async () => {
    renderPage();
    await waitForStep(1);
    expect(fire()).toBe(false);
    await fillStep1();
    expect(fire()).toBe(true);
    next();
    await waitForStep(2);
    fillStep2();
    next();
    await waitForStep(3);
    fillStep3Contact();
    selectFiles(coverInput(), [imageFile('cover.png')]);
    await waitFor(() => expect(screen.getByAltText('封面照片')).toBeTruthy());
    submit();
    expect(await screen.findByRole('heading', { name: '已收到場地投稿' })).toBeTruthy();
    expect(fire()).toBe(false);
  });

  it('按「×」離開後不擋', async () => {
    renderPage();
    await waitForStep(1);
    chooseDropdown('地區', '台北');
    fireEvent.click(screen.getByRole('button', { name: '離開投稿' }));
    fireEvent.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: '離開' })
    );
    await waitFor(() => expect(routerReplace).toHaveBeenCalled());
    expect(fire()).toBe(false);
  });
});

describe('TC-133 d、e depth 跟著目前那一筆更新（Integration）', () => {
  it('push 時 state 與暫存都是新 depth；popstate 後暫存跟著更新', async () => {
    renderPage();
    await waitForStep(1);
    await fillStep1();
    next();
    await waitForStep(2);
    expect(window.history.state[DEPTH_KEY]).toBe(1);
    expect(readStoredDraft().depth).toBe(1);
    fillStep2();
    next();
    await waitForStep(3);
    expect(window.history.state[DEPTH_KEY]).toBe(2);
    expect(readStoredDraft().depth).toBe(2);

    window.history.back();
    await waitForStep(2);
    expect(readStoredDraft().depth).toBe(1);
    window.history.forward();
    await waitForStep(3);
    expect(readStoredDraft().depth).toBe(2);
  });
});
