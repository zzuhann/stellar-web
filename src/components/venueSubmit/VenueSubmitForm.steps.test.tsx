import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FooterWrapper from '@/components/layout/FooterWrapper';
import { useSiteChromeStore } from '@/store/useSiteChromeStore';
import {
  check,
  chooseDropdown,
  fieldset,
  fillStep1,
  fillStep2,
  filledForm,
  goThroughToStep3,
  heading,
  next,
  renderPage,
  resetBrowserState,
  seedHistory,
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
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
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
      address: '臺中市西區 B 路 2 號',
      coordinates: { lat: 24.14, lng: 120.66 },
      name: 'B 咖啡',
      city: '臺中市',
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
      city: '',
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

beforeEach(() => {
  resetBrowserState();
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
  api.create.mockResolvedValue(undefined);
  upload.uploadImageToAPI.mockResolvedValue({ success: true, filename: 'cover.jpg' });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function expectFieldError(field: HTMLElement, message: string) {
  const error = screen.getByText(message);
  expect(field.getAttribute('aria-invalid')).toBe('true');
  expect(field.getAttribute('aria-describedby')?.split(' ')).toContain(error.id);
}

describe('TC-106 步驟頁隱藏全站導覽', () => {
  it('第 1～3 步不顯示 header、footer；成功卡片恢復', async () => {
    render(<FooterWrapper />);
    renderPage();
    await waitForStep(1);
    expect(useSiteChromeStore.getState().hidden).toBe(true);
    expect(screen.queryByText('站尾')).toBeNull();

    await goThroughToStep3();
    expect(useSiteChromeStore.getState().hidden).toBe(true);
    fireEvent.click(screen.getByRole('radio', { name: 'Instagram 私訊' }));
    fireEvent.change(screen.getByLabelText('Instagram 帳號'), { target: { value: 'x' } });
    fireEvent.change(screen.getByTestId('cover-file-input'), {
      target: { files: [new File(['x'], 'c.png', { type: 'image/png' })] },
    });
    await waitFor(() => expect(screen.getByAltText('封面照片')).toBeTruthy());
    submit();

    expect(await screen.findByRole('heading', { name: '已收到場地投稿' })).toBeTruthy();
    expect(useSiteChromeStore.getState().hidden).toBe(false);
    expect(screen.getByText('站尾')).toBeTruthy();
  });
});

describe('TC-107 第 1 步空白按「下一步」', () => {
  it('只顯示第 1 步的錯誤，焦點在搜尋框', async () => {
    renderPage();
    await waitForStep(1);
    next();

    await waitForStep(1);
    const search = screen.getByLabelText('搜尋地點');
    expectFieldError(search, '請從搜尋結果選擇你的店家');
    expectFieldError(screen.getByRole('button', { name: /^地區：/ }), '請選擇地區');
    expectFieldError(
      screen.getByRole('button', { name: /^場地大約可以容納多少人？：/ }),
      '請選擇容納人數'
    );
    expect(document.activeElement).toBe(search);
    expect(screen.queryByLabelText('場地名稱')).toBeNull();
    expect(screen.queryByText('請填寫場地名稱')).toBeNull();
    expect(screen.queryByText('請選擇偏好的聯絡方式')).toBeNull();
    expect(screen.queryByText('請上傳封面圖片')).toBeNull();
  });
});

describe('TC-108 搜尋結果與場地名稱', () => {
  it('a～f：選店家才預填、重新搜尋清掉地點但留名稱、選地址不覆蓋、清空名稱擋下', async () => {
    renderPage();
    await waitForStep(1);
    expect(screen.queryByLabelText('場地名稱')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '選 A 咖啡' }));
    expect(screen.getByText('台北市中山區 A 路 1 號')).toBeTruthy();
    const name = screen.getByLabelText('場地名稱') as HTMLInputElement;
    expect(name.value).toBe('A 咖啡');
    expect(screen.queryByLabelText('搜尋地點')).toBeNull();

    fireEvent.change(name, { target: { value: 'A 二店' } });
    fireEvent.click(screen.getByRole('button', { name: '重新搜尋' }));
    expect(screen.queryByLabelText('場地名稱')).toBeNull();
    expect(screen.queryByText('台北市中山區 A 路 1 號')).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText('搜尋地點')));

    fireEvent.click(screen.getByRole('button', { name: '選 中山北路一段 1 號' }));
    expect((screen.getByLabelText('場地名稱') as HTMLInputElement).value).toBe('A 二店');

    fireEvent.click(screen.getByRole('button', { name: '重新搜尋' }));
    fireEvent.click(screen.getByRole('button', { name: '選 B 咖啡' }));
    expect((screen.getByLabelText('場地名稱') as HTMLInputElement).value).toBe('B 咖啡');
    expect(screen.getByText('臺中市西區 B 路 2 號')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('場地名稱'), { target: { value: '' } });
    next();
    expectFieldError(screen.getByLabelText('場地名稱'), '請填寫場地名稱');
  });

  it('h：選了搜尋結果就用它的縣市帶入地區；重新搜尋選別縣市會換掉；對不上就清空；之後仍可手動改', async () => {
    const region = () => screen.getByRole('button', { name: /^地區：/ });
    renderPage();
    await waitForStep(1);
    fireEvent.click(screen.getByRole('button', { name: '選 A 咖啡' }));
    expect(region().getAttribute('aria-label')).toBe('地區：台北');

    chooseDropdown('地區', '新北');
    expect(region().getAttribute('aria-label')).toBe('地區：新北');

    fireEvent.click(screen.getByRole('button', { name: '重新搜尋' }));
    fireEvent.click(screen.getByRole('button', { name: '選 B 咖啡' }));
    expect(region().getAttribute('aria-label')).toBe('地區：台中');

    fireEvent.click(screen.getByRole('button', { name: '重新搜尋' }));
    fireEvent.click(screen.getByRole('button', { name: '選 某處' }));
    expect(region().getAttribute('aria-label')).toBe('地區：請選擇');
    next();
    expect(screen.getByText('請選擇地區')).toBeTruthy();
  });

  it.each(['中山北路一段 1 號', '某處'])(
    'g：全新表單第一次就選地址型結果（%s）→ 名稱空白，不帶 Google 名稱',
    async (placeName) => {
      renderPage();
      await waitForStep(1);
      fireEvent.click(screen.getByRole('button', { name: `選 ${placeName}` }));
      expect((screen.getByLabelText('場地名稱') as HTMLInputElement).value).toBe('');
      next();
      expect(screen.getByText('請填寫場地名稱')).toBeTruthy();
    }
  );
});

describe('TC-109 交通列', () => {
  it('一開始一列空白；只填一半會報錯；加到 5 列 + 隱藏；步行分鐘欄位屬性', async () => {
    renderPage();
    await waitForStep(1);
    await fillStep1();

    expect(screen.getAllByRole('button', { name: /^交通方式 \d 類型：/ })).toHaveLength(1);
    next();
    await waitForStep(2);
    fireEvent.click(screen.getByRole('button', { name: '上一步' }));
    await waitForStep(1);

    chooseDropdown('交通方式 1 類型', '捷運');
    next();
    expectFieldError(screen.getByLabelText('交通方式 1 站名'), '請填站名');

    fireEvent.click(screen.getByRole('button', { name: '新增交通方式' }));
    fireEvent.change(screen.getByLabelText('交通方式 2 站名'), { target: { value: '市政府' } });
    next();
    expectFieldError(screen.getByRole('button', { name: /^交通方式 2 類型：/ }), '請選交通類型');

    for (let i = 0; i < 3; i += 1) {
      fireEvent.click(screen.getByRole('button', { name: '新增交通方式' }));
    }
    expect(screen.getAllByRole('button', { name: '移除這個交通方式' })).toHaveLength(5);
    expect(screen.queryByRole('button', { name: '新增交通方式' })).toBeNull();

    const walk = screen.getByLabelText('交通方式 1 步行分鐘') as HTMLInputElement;
    expect(walk.getAttribute('type')).toBe('text');
    expect(walk.getAttribute('inputmode')).toBe('numeric');
    expect(walk.hasAttribute('maxlength')).toBe(false);
    fireEvent.change(walk, { target: { value: '1a2' } });
    expect(walk.value).toBe('12');
    expect(screen.queryByText(/分鐘.*格式/)).toBeNull();
  });
});

describe('TC-074 A、C、D 全空按「下一步」', () => {
  it('三題各自顯示錯誤、fieldset 有 aria-invalid 與 describedby，焦點在 A 的第一個選項', async () => {
    renderPage();
    await waitForStep(1);
    await fillStep1();
    next();
    await waitForStep(2);
    next();

    const uses = fieldset('主辦可以在這個空間做什麼？');
    const services = fieldset('可以提供的服務');
    const spaces = fieldset('店裡是什麼樣的空間？');
    for (const [group, message] of [
      [uses, '請至少選一項，或勾「還沒確定」。'],
      [services, '請至少選一項，或勾「還沒確定」。'],
      [spaces, '請至少選一項。'],
    ] as const) {
      expect(group.getAttribute('aria-invalid')).toBe('true');
      const errorId = group.getAttribute('aria-describedby') ?? '';
      expect(document.getElementById(errorId.split(' ').pop() ?? '')?.textContent).toContain(
        message
      );
    }
    expect(screen.queryByRole('group', { name: /佈置、辦生咖怎麼收費？/ })).toBeNull();
    expect(document.activeElement).toBe(within(uses).getByRole('checkbox', { name: '發放應援物' }));
    await waitForStep(2);
  });
});

describe('TC-056 即時清錯；之後才出現的費用區塊等下次再驗', () => {
  it('a～d', async () => {
    renderPage();
    await waitForStep(1);
    await fillStep1();
    next();
    await waitForStep(2);
    next();
    const uses = fieldset('主辦可以在這個空間做什麼？');

    check('發放應援物', uses);
    expect(uses.getAttribute('aria-invalid')).toBeNull();
    expect(fieldset('可以提供的服務').getAttribute('aria-invalid')).toBe('true');
    expect(fieldset('店裡是什麼樣的空間？').getAttribute('aria-invalid')).toBe('true');

    check('發放應援物', uses);
    check('佈置、辦生咖', uses);
    expect(screen.getByRole('group', { name: /佈置、辦生咖怎麼收費？/ })).toBeTruthy();
    expect(screen.queryByText('請至少回答一題，或勾「要看檔期和方案」。')).toBeNull();

    next();
    expect(screen.getByText('請至少回答一題，或勾「要看檔期和方案」。')).toBeTruthy();
    expect(fieldset('可以提供的服務').getAttribute('aria-invalid')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: '上一步' }));
    await waitForStep(1);
    expect(screen.queryByText('請至少選一項。')).toBeNull();
  });
});

describe('TC-050 / TC-051 / TC-054 / TC-055 / TC-112 第 2 步的送出內容', () => {
  async function toStep2() {
    renderPage();
    await waitForStep(1);
    await fillStep1();
    next();
    await waitForStep(2);
  }

  async function finishAndSubmit() {
    next();
    await waitForStep(3);
    fireEvent.click(screen.getByRole('radio', { name: 'Instagram 私訊' }));
    fireEvent.change(screen.getByLabelText('Instagram 帳號'), { target: { value: 'x' } });
    fireEvent.change(screen.getByTestId('cover-file-input'), {
      target: { files: [new File(['x'], 'c.png', { type: 'image/png' })] },
    });
    await waitFor(() => expect(screen.getByAltText('封面照片')).toBeTruthy());
    submit();
    await waitFor(() => expect(api.create).toHaveBeenCalledTimes(1));
    return api.create.mock.calls[0][0];
  }

  it('TC-050 A 只勾「還沒確定」：可前進、費用區塊不出現、body 沒有 fees', async () => {
    await toStep2();
    check('還沒確定，想先跟主辦聊聊', fieldset('主辦可以在這個空間做什麼？'));
    check('客製餐點');
    check('咖啡廳');
    expect(screen.queryByRole('group', { name: /佈置、辦生咖怎麼收費？/ })).toBeNull();
    const body = await finishAndSubmit();
    expect(body.venueConditions.uses).toEqual({ options: [], discussable: true });
    expect(body.venueConditions).not.toHaveProperty('fees');
  });

  it('TC-051 取消佈置後 B 不送出；勾回來答案都在', async () => {
    await toStep2();
    const uses = fieldset('主辦可以在這個空間做什麼？');
    check('佈置、辦生咖', uses);
    fireEvent.click(screen.getByRole('radio', { name: '不用場地費' }));
    check('期間限定');
    fireEvent.change(screen.getByLabelText('免場地費到'), {
      target: { value: '2099-12-31' },
    });
    fireEvent.click(screen.getByRole('radio', { name: '要' }));

    check('佈置、辦生咖', uses);
    expect(screen.queryByRole('radio', { name: '不用場地費' })).toBeNull();
    check('佈置、辦生咖', uses);
    expect((screen.getByRole('radio', { name: '不用場地費' }) as HTMLInputElement).checked).toBe(
      true
    );
    expect((screen.getByRole('checkbox', { name: '期間限定' }) as HTMLInputElement).checked).toBe(
      true
    );
    expect((screen.getByLabelText('免場地費到') as HTMLInputElement).value).toBe('2099-12-31');
    expect((screen.getByRole('radio', { name: '要' }) as HTMLInputElement).checked).toBe(true);

    check('佈置、辦生咖', uses);
    check('發放應援物', uses);
    check('客製餐點');
    check('咖啡廳');
    const body = await finishAndSubmit();
    expect(body.venueConditions).not.toHaveProperty('fees');
  });

  it.each([
    {
      name: 'a：限期但不選日期',
      act: () => {
        fireEvent.click(screen.getByRole('radio', { name: '不用場地費' }));
        check('期間限定');
      },
      fees: { venueFee: 'free', freeVenueLimited: true },
    },
    {
      name: 'b：選了日期後改「要場地費」',
      act: () => {
        fireEvent.click(screen.getByRole('radio', { name: '不用場地費' }));
        check('期間限定');
        fireEvent.change(screen.getByLabelText('免場地費到'), {
          target: { value: '2099-12-31' },
        });
        fireEvent.click(screen.getByRole('radio', { name: '要場地費' }));
      },
      fees: { venueFee: 'paid' },
    },
    {
      name: 'd：選了日期後取消限期',
      act: () => {
        fireEvent.click(screen.getByRole('radio', { name: '不用場地費' }));
        check('期間限定');
        fireEvent.change(screen.getByLabelText('免場地費到'), {
          target: { value: '2099-12-31' },
        });
        check('期間限定');
      },
      fees: { venueFee: 'free' },
    },
  ])('TC-055 $name', async ({ act: answer, fees }) => {
    await toStep2();
    check('佈置、辦生咖', fieldset('主辦可以在這個空間做什麼？'));
    answer();
    check('客製餐點');
    check('咖啡廳');
    const body = await finishAndSubmit();
    expect(body.venueConditions.fees).toEqual(fees);
  });

  it('TC-055 c：改回「不用場地費」時限期與日期還在；d 勾回來日期也在', async () => {
    await toStep2();
    check('佈置、辦生咖', fieldset('主辦可以在這個空間做什麼？'));
    fireEvent.click(screen.getByRole('radio', { name: '不用場地費' }));
    check('期間限定');
    fireEvent.change(screen.getByLabelText('免場地費到'), {
      target: { value: '2099-12-31' },
    });
    fireEvent.click(screen.getByRole('radio', { name: '要場地費' }));
    expect(screen.queryByLabelText('免場地費到')).toBeNull();
    fireEvent.click(screen.getByRole('radio', { name: '不用場地費' }));
    expect((screen.getByLabelText('免場地費到') as HTMLInputElement).value).toBe('2099-12-31');
    check('期間限定');
    expect(screen.queryByLabelText('免場地費到')).toBeNull();
    check('期間限定');
    expect((screen.getByLabelText('免場地費到') as HTMLInputElement).value).toBe('2099-12-31');
  });

  it('TC-054 D、E 沒有「還沒確定」；E 全空可以送出', async () => {
    await toStep2();
    expect(
      within(fieldset('店裡是什麼樣的空間？')).queryByRole('checkbox', { name: /還沒確定/ })
    ).toBeNull();
    expect(
      within(fieldset('有哪些設備？（選填）')).queryByRole('checkbox', { name: /還沒確定/ })
    ).toBeNull();
    fillStep2();
    const body = await finishAndSubmit();
    expect(body.venueConditions.equipment ?? []).toEqual([]);
  });

  it.each([
    { name: 'a：只打空白 → 不送 note', value: '   ', expected: undefined },
    { name: 'b：前後空白 → trim', value: '  可租扭蛋機  ', expected: '可租扭蛋機' },
  ])('TC-112 $name', async ({ value, expected }) => {
    await toStep2();
    fillStep2();
    fireEvent.change(screen.getByLabelText(/還有什麼想讓主辦知道的？/), { target: { value } });
    const body = await finishAndSubmit();
    expect(body.venueConditions.note).toBe(expected);
  });

  it('TC-112 c：文字框 maxLength 1000，送出 1000 字、不顯示錯誤', async () => {
    await toStep2();
    fillStep2();
    const note = screen.getByLabelText(/還有什麼想讓主辦知道的？/) as HTMLTextAreaElement;
    expect(note.maxLength).toBe(1000);
    // Native maxLength truncates real pastes; jsdom does not, so paste what the browser would keep
    fireEvent.change(note, { target: { value: 'a'.repeat(1000) } });
    const body = await finishAndSubmit();
    expect(body.venueConditions.note).toHaveLength(1000);
    expect(screen.queryByText(/超過|1000 字/)).toBeNull();
  });
});

describe('TC-111 限時優惠的日期', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-28T04:00:00Z'));
  });

  const expiredDraft = () =>
    filledForm({
      uses: { options: ['can_decorate'], discussable: false },
      fees: {
        venueFee: 'free',
        freeVenueLimited: true,
        freeVenueUntil: '2026-10-27',
        guarantee: '',
        deposit: '',
        discussable: false,
      },
    });

  it('a：最早是今天、不能手打', async () => {
    renderPage();
    await waitForStep(1);
    await fillStep1();
    next();
    await waitForStep(2);
    check('佈置、辦生咖', fieldset('主辦可以在這個空間做什麼？'));
    fireEvent.click(screen.getByRole('radio', { name: '不用場地費' }));
    check('期間限定');
    const date = screen.getByLabelText('免場地費到') as HTMLInputElement;
    expect(date.getAttribute('min')).toBe('2026-10-28');
    await userEvent.type(date, '2026-11-01');
    expect(date.value).toBe('');
    expect(screen.queryByText('請重新選擇日期')).toBeNull();
  });

  it('b、c：在第 3 步還原過期日期 → 送出擋下、go(-1) 回第 2 步；重選後送出成功', async () => {
    seedHistory(3);
    storeDraft(expiredDraft(), { maxStep: 3, depth: 2 });
    const go = vi.spyOn(window.history, 'go');
    const push = vi.spyOn(window.history, 'pushState');
    renderPage();
    await waitForStep(3);
    submit();

    await waitForStep(2);
    expect(go).toHaveBeenCalledWith(-1);
    expect(push).not.toHaveBeenCalled();
    expect(api.create).not.toHaveBeenCalled();
    const date = screen.getByLabelText('免場地費到');
    expectFieldError(date, '請重新選擇日期');
    await waitFor(() => expect(document.activeElement).toBe(date));

    fireEvent.change(date, { target: { value: '2026-10-28' } });
    expect(screen.queryByText('請重新選擇日期')).toBeNull();
    next();
    await waitForStep(3);
    submit();
    await waitFor(() => expect(api.create).toHaveBeenCalledTimes(1));
    expect(api.create.mock.calls[0][0].venueConditions.fees.freeVenueUntil).toBe('2026-10-28');
  });

  it('d：同一份暫存在第 2 步還原，按「下一步」也擋下', async () => {
    seedHistory(2);
    storeDraft(expiredDraft(), { maxStep: 3, depth: 1 });
    renderPage();
    await waitForStep(2);
    next();
    expect(screen.getByText('請重新選擇日期')).toBeTruthy();
    await waitForStep(2);
  });
});

describe('TC-117 圖示按鈕、封面標籤、選填標示', () => {
  it('aria-label 與「（選填）」，沒有紅色星號', async () => {
    renderPage();
    await waitForStep(1);
    expect(screen.getByRole('button', { name: '新增交通方式' }).textContent?.trim()).toBe('');
    expect(screen.getByText(/要怎麼前往呢？/).textContent).toContain('（選填）');
    expect(document.body.textContent).not.toContain('*');

    await goThroughToStep3();
    expect(screen.getByRole('button', { name: '新增說明文件連結' }).textContent?.trim()).toBe('');
    expect(screen.getByRole('button', { name: '新增照片' })).toBeTruthy();
    expect(screen.getByText('封面')).toBeTruthy();
    for (const label of [/預約表單網址/, /給主辦的說明文件/, /檔期行事曆連結/, /店家介紹/]) {
      expect(screen.getAllByText(label)[0].textContent).toContain('（選填）');
    }
    expect(document.body.textContent).not.toContain('*');
  });
});

describe('TC-132 換步驟的捲動與焦點', () => {
  it('每步捲到頂、焦點在 h1、頁首顯示 N／3', async () => {
    renderPage();
    await waitForStep(1);
    expect(heading().textContent).toBe('輸入你的場地名稱或地點');
    expect(screen.getByText('1／3')).toBeTruthy();
    await fillStep1();

    scrollTo.mockClear();
    next();
    await waitForStep(2);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(heading().textContent).toBe('主辦可以在這個空間做什麼？');
    expect(screen.getByText('2／3')).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(heading()));
    expect(scrollTo).toHaveBeenCalled();

    fillStep2();
    next();
    await waitForStep(3);
    expect(heading().textContent).toBe('主辦怎麼聯絡你們？');
    expect(screen.getByText('3／3')).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(heading()));

    fireEvent.click(screen.getByRole('button', { name: '上一步' }));
    await waitForStep(2);
    await waitFor(() => expect(document.activeElement).toBe(heading()));
    await act(async () => {});
  });
});
