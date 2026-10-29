import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { venueTagDictionaryFixture } from '@/test/venueTagDictionary.fixture';
import AdminVenueForm, { type AdminVenueFormValues } from './AdminVenueForm';

// The admin form loads the tag dictionary itself
vi.mock('@/lib/api', () => ({
  venueApi: { getTagDictionary: () => Promise.resolve(venueTagDictionaryFixture) },
  placesApi: {},
}));

// jsdom has no scrollIntoView; failed submits scroll to the first error
const scrollIntoView = vi.fn();
Element.prototype.scrollIntoView = scrollIntoView;

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

afterEach(cleanup);

const URL_ERR = '請輸入完整網址（以 https:// 開頭）';
const CONTACT_TRIGGER = /^(IG 私訊|Threads 私訊|LINE|請選擇)$/;

function selectContact(name: string) {
  fireEvent.click(screen.getByRole('button', { name: CONTACT_TRIGGER }));
  fireEvent.click(screen.getByRole('option', { name }));
}

function expectFieldError(label: string, message: string) {
  const input = screen.getByLabelText(label);
  const error = screen.getByText(message);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.getAttribute('aria-describedby')).toBe(error.id);
}

const EDIT_BASE: AdminVenueFormValues = {
  name: '舊場地',
  address: '舊地址',
  region: '台北',
  transitStops: [],
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
  bookingFormUrl: '',
};

function renderEdit(overrides: Partial<AdminVenueFormValues> = {}) {
  const onSubmit = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AdminVenueForm
        mode="edit"
        initialValues={{ ...EDIT_BASE, ...overrides }}
        onSubmit={onSubmit}
        isSubmitting={false}
        submitError={null}
        status="active"
        onStatusChange={vi.fn()}
        isStatusChanging={false}
        onDeleteClick={vi.fn()}
        canDelete={false}
      />
    </QueryClientProvider>
  );
  return onSubmit;
}

function save() {
  fireEvent.click(screen.getByRole('button', { name: '儲存變更' }));
}

function rename() {
  fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '更新場地' } });
}

describe('AdminVenueForm edit mode', () => {
  it('舊資料缺少新增必填欄位時仍可儲存其他修改', () => {
    const onSubmit = renderEdit();
    rename();
    save();
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: '更新場地' }));
  });

  it('LINE 連結非法時阻止儲存', () => {
    const onSubmit = renderEdit({ preferredContact: 'line', contactUrl: 'abc' });
    save();
    expect(screen.getByText(URL_ERR)).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('切換成不需網址的聯絡方式時，隱藏的非法值不卡住也不送出', () => {
    const onSubmit = renderEdit({ preferredContact: 'line', contactUrl: 'abc', instagram: '@v' });
    selectContact('IG 私訊');
    save();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].contactUrl).toBeUndefined();
  });
});

describe('AdminVenueForm 預約表單網址（TC-099 後台編輯）', () => {
  it('TC-099 預填原值；只改店名時送原值', () => {
    const onSubmit = renderEdit({ bookingFormUrl: 'https://forms.gle/x' });
    expect((screen.getByLabelText('預約表單網址') as HTMLInputElement).value).toBe(
      'https://forms.gle/x'
    );
    rename();
    save();
    expect(onSubmit.mock.calls[0][0].bookingFormUrl).toBe('https://forms.gle/x');
  });

  it.each(['', '   '])('TC-099 清空成 %j 後存檔送 null（不是 undefined）', (value) => {
    const onSubmit = renderEdit({ bookingFormUrl: 'https://forms.gle/x' });
    fireEvent.change(screen.getByLabelText('預約表單網址'), { target: { value } });
    save();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toHaveProperty('bookingFormUrl', null);
  });

  it('TC-099 舊場地沒有預約表單網址，只改店名時送 null', () => {
    const onSubmit = renderEdit({ bookingFormUrl: '' });
    rename();
    save();
    expect(onSubmit.mock.calls[0][0]).toHaveProperty('bookingFormUrl', null);
  });

  it('TC-099 編輯時改成非法值擋下', () => {
    const onSubmit = renderEdit({ bookingFormUrl: 'https://forms.gle/x' });
    fireEvent.change(screen.getByLabelText('預約表單網址'), {
      target: { value: 'javascript:alert(1)' },
    });
    save();
    expectFieldError('預約表單網址', URL_ERR);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('AdminVenueForm 舊資料與聯絡管道檢查（TC-100 後台編輯）', () => {
  it('TC-100 舊資料 form 的下拉是 placeholder 樣式（data-empty）', () => {
    renderEdit({ preferredContact: 'form' as never });
    expect(screen.getByRole('button', { name: '請選擇' }).getAttribute('data-empty')).toBe('true');
  });

  it.each([
    {
      name: 'a：preferredContact form，只改店名',
      values: { preferredContact: 'form', contactUrl: 'https://forms.gle/old' } as const,
      edit: rename,
    },
    {
      name: 'c：preferredContact other，只改說明',
      values: { preferredContact: 'other', contactUrl: '' } as const,
      edit: () =>
        fireEvent.change(screen.getByLabelText('場地描述'), { target: { value: '新說明' } }),
    },
  ])(
    'TC-100 $name：下拉顯示請選擇，存檔不送 preferredContact 與 contactUrl',
    ({ values, edit }) => {
      const onSubmit = renderEdit(values);
      expect(screen.getByRole('button', { name: '請選擇' })).toBeTruthy();
      expect(screen.queryByLabelText('LINE 連結')).toBeNull();

      edit();
      save();

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const payload = onSubmit.mock.calls[0][0];
      expect(payload.preferredContact).not.toBe('instagram');
      expect(payload).not.toHaveProperty('preferredContact');
      expect(payload).not.toHaveProperty('contactUrl');
    }
  );

  it('TC-100 b：舊資料 form 改選 IG 私訊後送 instagram', () => {
    const onSubmit = renderEdit({
      preferredContact: 'form',
      contactUrl: 'https://forms.gle/old',
      instagram: '@venue',
    });
    selectContact('IG 私訊');
    save();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toHaveProperty('preferredContact', 'instagram');
    expect(onSubmit.mock.calls[0][0].contactUrl).toBeUndefined();
  });

  it('TC-100 d：選 IG 但 Instagram 空的舊資料，沒改聯絡欄位就不檢查', () => {
    const onSubmit = renderEdit({ preferredContact: 'instagram', instagram: '' });
    rename();
    save();
    expect(screen.queryByText('請填寫 Instagram 帳號')).toBeNull();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('TC-100 e：改選 Threads 私訊但 Threads 空，Threads 欄下方顯示錯誤、不送出', () => {
    const onSubmit = renderEdit({ preferredContact: 'instagram', instagram: '', threads: '' });
    selectContact('Threads 私訊');
    save();
    expectFieldError('Threads', '請填寫 Threads 帳號');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('TC-100 f：下拉不動、清空 Instagram，Instagram 欄下方顯示錯誤、不送出', () => {
    const onSubmit = renderEdit({ preferredContact: 'instagram', instagram: '@venue' });
    fireEvent.change(screen.getByLabelText('Instagram'), { target: { value: '' } });
    save();
    expectFieldError('Instagram', '請填寫 Instagram 帳號');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
