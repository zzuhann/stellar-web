import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  controlledUploads,
  coverInput,
  fieldset,
  filledForm,
  fillStep3Contact,
  goThroughToStep3,
  imageFile,
  otherInput,
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

beforeEach(() => {
  resetBrowserState();
  window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
  let previewId = 0;
  URL.createObjectURL = vi.fn(() => `blob:preview-${previewId++}`);
  URL.revokeObjectURL = vi.fn();
  api.create.mockResolvedValue(undefined);
  upload.uploadImageToAPI.mockResolvedValue({ success: true, filename: 'cover.jpg' });
});

afterEach(() => {
  cleanup();
});

const CDN = 'https://cdn.stellar-zone.com/';

function expectFieldError(field: HTMLElement, message: string) {
  const error = screen.getByText(message);
  expect(field.getAttribute('aria-invalid')).toBe('true');
  expect(field.getAttribute('aria-describedby')?.split(' ')).toContain(error.id);
}

async function uploadCover() {
  selectFiles(coverInput(), [imageFile('cover.png')]);
  await waitFor(() => expect(screen.getByAltText('封面照片')).toBeTruthy());
}

async function toStep3() {
  renderPage();
  await waitForStep(1);
  await goThroughToStep3();
}

const submitButton = () => screen.getByRole('button', { name: /送出投稿|照片上傳中|送出中/ });

describe('TC-113 店家表單的聯絡方式與預約表單網址', () => {
  it('只有三張卡；沒選就送出 →「請選擇偏好的聯絡方式」', async () => {
    await toStep3();
    const group = fieldset('主要聯絡方式');
    expect(within(group).getAllByRole('radio')).toHaveLength(3);
    for (const name of ['Instagram 私訊', 'Threads 私訊', 'LINE']) {
      expect(within(group).getByRole('radio', { name })).toBeTruthy();
    }
    await uploadCover();
    submit();
    expect(group.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('請選擇偏好的聯絡方式')).toBeTruthy();
    expect(api.create).not.toHaveBeenCalled();
  });

  it.each([
    { channel: 'Instagram 私訊', field: 'Instagram 帳號', message: '請填寫 Instagram 帳號' },
    { channel: 'Threads 私訊', field: 'Threads 帳號', message: '請填寫 Threads 帳號' },
    { channel: 'LINE', field: 'LINE 連結', message: '請填寫 LINE 連結' },
  ])('選 $channel 沒填 → $message', async ({ channel, field, message }) => {
    await toStep3();
    await uploadCover();
    fireEvent.click(screen.getByRole('radio', { name: channel }));
    submit();
    expectFieldError(screen.getByLabelText(field), message);
    expect(document.activeElement).toBe(screen.getByLabelText(field));
    expect(api.create).not.toHaveBeenCalled();
  });

  it('選 LINE、IG 和 Threads 都沒填 →「請填寫至少一個社群帳號」；格式錯誤；http:// 可通過', async () => {
    await toStep3();
    await uploadCover();
    fireEvent.click(screen.getByRole('radio', { name: 'LINE' }));
    const line = screen.getByLabelText('LINE 連結');
    expect(line.getAttribute('placeholder')).toBe('LINE 網址');
    fireEvent.change(line, { target: { value: 'abc' } });
    submit();
    expect(screen.getByText('請填寫至少一個社群帳號')).toBeTruthy();
    expectFieldError(line, '請輸入完整網址（以 https:// 開頭）');

    fireEvent.change(line, { target: { value: 'http://lin.ee/x' } });
    fireEvent.change(screen.getByLabelText('Instagram 帳號'), { target: { value: 'ig' } });
    submit();
    await waitFor(() => expect(api.create).toHaveBeenCalledTimes(1));
    expect(api.create.mock.calls[0][0]).toMatchObject({
      preferredContact: 'line',
      contactUrl: 'http://lin.ee/x',
      socialMedia: { instagram: 'ig' },
    });
  });

  it('選 IG 時另一欄是「Threads 帳號（選填）」，選 Threads 時是「Instagram 帳號（選填）」', async () => {
    await toStep3();
    fireEvent.click(screen.getByRole('radio', { name: 'Instagram 私訊' }));
    expect(screen.getByLabelText('Threads 帳號（選填）')).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: 'Threads 私訊' }));
    expect(screen.getByLabelText('Instagram 帳號（選填）')).toBeTruthy();
  });

  it('LINE 連結填 abc 後改選 IG：隱藏的 LINE 連結不驗證、不送', async () => {
    await toStep3();
    await uploadCover();
    fireEvent.click(screen.getByRole('radio', { name: 'LINE' }));
    fireEvent.change(screen.getByLabelText('LINE 連結'), { target: { value: 'abc' } });
    fillStep3Contact();
    submit();
    await waitFor(() => expect(api.create).toHaveBeenCalledTimes(1));
    const body = api.create.mock.calls[0][0];
    expect(body).not.toHaveProperty('contactUrl');
    expect(body.preferredContact).toBe('instagram');
  });

  it('預約表單網址：空白不帶、trim 後送出', async () => {
    await toStep3();
    await uploadCover();
    fillStep3Contact();
    submit();
    await waitFor(() => expect(api.create).toHaveBeenCalledTimes(1));
    expect(api.create.mock.calls[0][0]).not.toHaveProperty('bookingFormUrl');

    cleanup();
    api.create.mockClear();
    resetBrowserState();
    await toStep3();
    await uploadCover();
    fillStep3Contact();
    fireEvent.change(screen.getByLabelText(/預約表單網址/), {
      target: { value: '  https://forms.gle/x  ' },
    });
    submit();
    await waitFor(() => expect(api.create).toHaveBeenCalledTimes(1));
    expect(api.create.mock.calls[0][0].bookingFormUrl).toBe('https://forms.gle/x');
  });

  it.each([
    { value: 'abc', message: '請輸入完整網址（以 https:// 開頭）' },
    { value: 'javascript:alert(1)', message: '請輸入完整網址（以 https:// 開頭）' },
    {
      value: 'https://forms.gle/' + 'a'.repeat(501 - 'https://forms.gle/'.length),
      message: '網址不能超過 500 個字',
    },
  ])('預約表單網址 $value → $message、焦點移過去、不打 API', async ({ value, message }) => {
    await toStep3();
    await uploadCover();
    fillStep3Contact();
    const input = screen.getByLabelText(/預約表單網址/);
    fireEvent.change(input, { target: { value } });
    submit();
    expectFieldError(input, message);
    expect(document.activeElement).toBe(input);
    expect(api.create).not.toHaveBeenCalled();
  });
});

describe('TC-114 照片上傳中不能送出', () => {
  it('任何一張上傳中都停用；同批 p1 先完成仍停用；全部結束才解鎖', async () => {
    await toStep3();
    fillStep3Contact();
    const uploads = controlledUploads(upload.uploadImageToAPI);

    selectFiles(coverInput(), [imageFile('cover.png')]);
    await waitFor(() => expect(uploads.calls).toHaveLength(1));
    selectFiles(otherInput(), [imageFile('p1.png'), imageFile('p2.png')]);
    await waitFor(() => expect(uploads.calls).toHaveLength(3));

    const busy = screen.getByRole('button', { name: '照片上傳中' }) as HTMLButtonElement;
    expect(busy.disabled).toBe(true);
    expect(busy.getAttribute('aria-busy')).toBe('true');
    expect(busy.textContent).not.toContain('送出投稿');

    await uploads.settle(1, 'p1.jpg');
    expect((submitButton() as HTMLButtonElement).disabled).toBe(true);
    await uploads.settle(2, 'p2.jpg');
    expect((submitButton() as HTMLButtonElement).disabled).toBe(true);
    await uploads.settle(0, 'cover.jpg');
    await waitFor(() =>
      expect((screen.getByRole('button', { name: '送出投稿' }) as HTMLButtonElement).disabled).toBe(
        false
      )
    );
  });
});

describe('TC-115 封面上傳中又換一張', () => {
  it('a：A 慢、B 快 → 結果是 B，A 晚到也丟掉', async () => {
    await toStep3();
    fillStep3Contact();
    const uploads = controlledUploads(upload.uploadImageToAPI);
    selectFiles(coverInput(), [imageFile('a.png')]);
    await waitFor(() => expect(uploads.calls).toHaveLength(1));
    selectFiles(coverInput(), [imageFile('b.png')]);
    await waitFor(() => expect(uploads.calls).toHaveLength(2));

    await uploads.settle(1, 'b.jpg');
    await uploads.settle(0, 'a.jpg');
    expect(screen.getByAltText('封面照片').getAttribute('src')).toBe(`${CDN}b.jpg`);
    expect(readStoredDraft().form.coverPhoto).toBe(`${CDN}b.jpg`);
    submit();
    await waitFor(() => expect(api.create).toHaveBeenCalledTimes(1));
    expect(api.create.mock.calls[0][0].coverPhoto).toBe(`${CDN}b.jpg`);
  });

  it.each(['a.jpg', 'fail'] as const)(
    'b：A 先結束（%s）、B 還在傳 → 仍停用、不顯示錯誤；B 完成才解鎖',
    async (outcome) => {
      await toStep3();
      fillStep3Contact();
      const uploads = controlledUploads(upload.uploadImageToAPI);
      selectFiles(coverInput(), [imageFile('a.png')]);
      await waitFor(() => expect(uploads.calls).toHaveLength(1));
      selectFiles(coverInput(), [imageFile('b.png')]);
      await waitFor(() => expect(uploads.calls).toHaveLength(2));

      await uploads.settle(0, outcome);
      const busy = screen.getByRole('button', { name: '照片上傳中' });
      expect(busy.getAttribute('aria-busy')).toBe('true');
      expect(screen.queryByText(/上傳失敗/)).toBeNull();

      await uploads.settle(1, 'b.jpg');
      await waitFor(() => expect(screen.getByRole('button', { name: '送出投稿' })).toBeTruthy());
      expect(readStoredDraft().form.coverPhoto).toBe(`${CDN}b.jpg`);
    }
  );
});

describe('TC-116 其他照片同時上傳、刪除、排序', () => {
  async function withP1() {
    seedHistory(3);
    storeDraft(
      filledForm({
        coverPhoto: `${CDN}cover.jpg`,
        otherPhotos: [{ id: 'x', url: `${CDN}p1.jpg` }],
      }),
      { maxStep: 3, depth: 2 }
    );
    renderPage();
    await waitForStep(3);
    return controlledUploads(upload.uploadImageToAPI);
  }

  const storedOthers = () => readStoredDraft().form.otherPhotos;

  it('a：p2 慢、p3 快 → [p1, p2, p3]', async () => {
    const uploads = await withP1();
    selectFiles(otherInput(), [imageFile('p2.png')]);
    selectFiles(otherInput(), [imageFile('p3.png')]);
    await waitFor(() => expect(uploads.calls).toHaveLength(2));
    await uploads.settle(1, 'p3.jpg');
    expect(storedOthers()).toEqual([`${CDN}p1.jpg`, `${CDN}p3.jpg`]);
    await uploads.settle(0, 'p2.jpg');
    expect(storedOthers()).toEqual([`${CDN}p1.jpg`, `${CDN}p2.jpg`, `${CDN}p3.jpg`]);
  });

  it('b：同一批 p2、p3，p3 先傳完 → 仍是 [p1, p2, p3]', async () => {
    const uploads = await withP1();
    selectFiles(otherInput(), [imageFile('p2.png'), imageFile('p3.png')]);
    await waitFor(() => expect(uploads.calls).toHaveLength(2));
    await uploads.settle(1, 'p3.jpg');
    await uploads.settle(0, 'p2.jpg');
    expect(storedOthers()).toEqual([`${CDN}p1.jpg`, `${CDN}p2.jpg`, `${CDN}p3.jpg`]);
  });

  it('c：p2 上傳中刪掉 p1 → p1 不會復活', async () => {
    const uploads = await withP1();
    selectFiles(otherInput(), [imageFile('p2.png')]);
    await waitFor(() => expect(uploads.calls).toHaveLength(1));
    fireEvent.click(screen.getByRole('button', { name: '移除其他照片 1' }));
    await uploads.settle(0, 'p2.jpg');
    expect(storedOthers()).toEqual([`${CDN}p2.jpg`]);
  });

  it('d：上傳中移動順序 → 傳完後順序維持', async () => {
    seedHistory(3);
    storeDraft(
      filledForm({
        otherPhotos: [
          { id: 'x', url: `${CDN}p1.jpg` },
          { id: 'y', url: `${CDN}p0.jpg` },
        ],
      }),
      { maxStep: 3, depth: 2 }
    );
    renderPage();
    await waitForStep(3);
    const uploads = controlledUploads(upload.uploadImageToAPI);
    selectFiles(otherInput(), [imageFile('p2.png')]);
    await waitFor(() => expect(uploads.calls).toHaveLength(1));
    fireEvent.click(screen.getByRole('button', { name: '其他照片 2 往前移' }));
    await uploads.settle(0, 'p2.jpg');
    expect(storedOthers()).toEqual([`${CDN}p0.jpg`, `${CDN}p1.jpg`, `${CDN}p2.jpg`]);
  });
});

describe('TC-125 停在第 3 步重新整理後的照片', () => {
  it('還原的封面與其他照片顯示；再加一張後 body 是原本 2 張加新的', async () => {
    seedHistory(3);
    storeDraft(
      filledForm({
        coverPhoto: `${CDN}cover.jpg`,
        otherPhotos: [
          { id: 'x', url: `${CDN}p1.jpg` },
          { id: 'y', url: `${CDN}p2.jpg` },
        ],
      }),
      { maxStep: 3, depth: 2 }
    );
    renderPage();
    await waitForStep(3);
    expect(screen.getByAltText('封面照片').getAttribute('src')).toBe(`${CDN}cover.jpg`);
    expect(screen.getByAltText('其他照片 1').getAttribute('src')).toBe(`${CDN}p1.jpg`);
    expect(screen.getByAltText('其他照片 2').getAttribute('src')).toBe(`${CDN}p2.jpg`);

    upload.uploadImageToAPI.mockResolvedValue({ success: true, filename: 'p3.jpg' });
    selectFiles(otherInput(), [imageFile('p3.png')]);
    await waitFor(() => expect(screen.getByAltText('其他照片 3')).toBeTruthy());
    submit();
    await waitFor(() => expect(api.create).toHaveBeenCalledTimes(1));
    expect(api.create.mock.calls[0][0].otherPhotos).toEqual([
      `${CDN}p1.jpg`,
      `${CDN}p2.jpg`,
      `${CDN}p3.jpg`,
    ]);
  });
});

describe('TC-126 上傳中重新整理', () => {
  it('a：已有 [p0]、p1 上傳中 → 暫存只有 [p0]，沒有 blob:', async () => {
    seedHistory(3);
    storeDraft(filledForm({ otherPhotos: [{ id: 'x', url: `${CDN}p0.jpg` }] }), {
      maxStep: 3,
      depth: 2,
    });
    renderPage();
    await waitForStep(3);
    const uploads = controlledUploads(upload.uploadImageToAPI);
    selectFiles(otherInput(), [imageFile('p1.png')]);
    await waitFor(() => expect(uploads.calls).toHaveLength(1));
    const raw = window.sessionStorage.getItem('stellar:venue-submit-draft') ?? '';
    expect(raw).not.toContain('blob:');
    expect(readStoredDraft().form.otherPhotos).toEqual([`${CDN}p0.jpg`]);

    cleanup();
    renderPage();
    await waitForStep(3);
    expect(screen.getAllByAltText(/^其他照片 /)).toHaveLength(1);
  });

  it('b：同批 p1 傳完、p2 不回應 → 重新 render 後 p1 保留、p2 不保留', async () => {
    seedHistory(3);
    storeDraft(filledForm(), { maxStep: 3, depth: 2 });
    renderPage();
    await waitForStep(3);
    const uploads = controlledUploads(upload.uploadImageToAPI);
    selectFiles(otherInput(), [imageFile('p1.png'), imageFile('p2.png')]);
    await waitFor(() => expect(uploads.calls).toHaveLength(2));
    await uploads.settle(0, 'p1.jpg');
    expect(readStoredDraft().form.otherPhotos).toEqual([`${CDN}p1.jpg`]);

    cleanup();
    renderPage();
    await waitForStep(3);
    expect(screen.getAllByAltText(/^其他照片 /).map((img) => img.getAttribute('src'))).toEqual([
      `${CDN}p1.jpg`,
    ]);
  });
});
