import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import VenueForm from './VenueForm';

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
const LENGTH_ERR = '網址不能超過 500 個字';
const CONTACT_TRIGGER = /^(IG 私訊|Threads 私訊|LINE|請選擇)$/;

function renderCreate() {
  const onSubmit = vi.fn();
  render(<VenueForm mode="create" onSubmit={onSubmit} isSubmitting={false} submitError={null} />);
  return onSubmit;
}

function fillRequired({ instagram = '@stellar', threads = '' } = {}) {
  fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '測試場地' } });
  fireEvent.change(screen.getByLabelText(/地址/), { target: { value: '測試地址' } });
  fireEvent.click(screen.getByRole('button', { name: '請選擇地區' }));
  fireEvent.click(screen.getByRole('option', { name: '台北' }));
  fireEvent.click(screen.getByRole('button', { name: '請選擇容納人數範圍' }));
  fireEvent.click(screen.getByRole('option', { name: '20-40人' }));
  if (instagram) {
    fireEvent.change(screen.getByLabelText('Instagram'), { target: { value: instagram } });
  }
  if (threads) {
    fireEvent.change(screen.getByLabelText('Threads'), { target: { value: threads } });
  }
  fireEvent.click(screen.getByRole('button', { name: '模擬封面上傳' }));
}

function selectContact(name: string) {
  fireEvent.click(screen.getByRole('button', { name: CONTACT_TRIGGER }));
  fireEvent.click(screen.getByRole('option', { name }));
}

function submitCreate() {
  fireEvent.click(screen.getByRole('button', { name: '新增場地' }));
}

function expectFieldError(label: string, message: string) {
  const input = screen.getByLabelText(label);
  const error = screen.getByText(message);
  expect(input.getAttribute('aria-invalid')).toBe('true');
  expect(input.getAttribute('aria-describedby')).toBe(error.id);
}

describe('VenueForm create mode', () => {
  it('缺少容納人數、社群帳號及封面圖片時阻止送出', () => {
    const onSubmit = renderCreate();

    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '測試場地' } });
    fireEvent.change(screen.getByLabelText(/地址/), { target: { value: '測試地址' } });
    fireEvent.click(screen.getByRole('button', { name: '請選擇地區' }));
    fireEvent.click(screen.getByRole('option', { name: '台北' }));
    submitCreate();

    expect(screen.getByText('請選擇容納人數')).toBeTruthy();
    expect(screen.getByText('請填寫至少一個社群帳號')).toBeTruthy();
    // Both socials empty: the "at least one" message covers it, no per-field channel error on top
    expect(screen.queryByText('請填寫 Instagram 帳號')).toBeNull();
    expect(screen.getByText('請上傳封面圖片')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('送出失敗時捲動並聚焦到第一個錯誤欄位', () => {
    renderCreate();

    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '測試場地' } });
    submitCreate();

    const address = screen.getByLabelText(/地址/);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(address.closest('div'));
    expect(document.activeElement).toBe(address);
  });

  it('社群帳號都沒填時聚焦到 Instagram', () => {
    renderCreate();
    fillRequired({ instagram: '' });
    submitCreate();

    const instagram = screen.getByLabelText('Instagram');
    expect(document.activeElement).toBe(instagram);
    expect(instagram.getAttribute('aria-invalid')).toBe('true');
    expect(instagram.getAttribute('aria-describedby')).toBe('venue-social-media-error');
  });

  it('預設選取 IG 私訊並送出 preferredContact', () => {
    const onSubmit = renderCreate();

    expect(screen.getByText('希望主辦怎麼聯絡你們？')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'IG 私訊' })).toBeTruthy();
    expect(screen.queryByText('不填寫')).toBeNull();

    fillRequired();
    expect(screen.getByRole('button', { name: '20-40人' })).toBeTruthy();
    submitCreate();

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        capacityRange: '20-40',
        coverPhoto: 'https://cdn.test/cover.jpg',
        preferredContact: 'instagram',
        socialMedia: { instagram: '@stellar' },
      })
    );
  });
});

describe('VenueForm 聯絡方式（TC-098 新增模式）', () => {
  it('TC-098 標題為「希望主辦怎麼聯絡你們？」，選項只有 IG 私訊、Threads 私訊、LINE', () => {
    renderCreate();

    expect(screen.getByText('希望主辦怎麼聯絡你們？')).toBeTruthy();
    expect(screen.queryByText('偏好聯繫方式')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: CONTACT_TRIGGER }));
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'IG 私訊',
      'Threads 私訊',
      'LINE',
    ]);
    expect(screen.queryByRole('option', { name: /表單|其他/ })).toBeNull();
  });

  it('TC-098 只有選 LINE 才出現「LINE 連結」', () => {
    renderCreate();

    expect(screen.queryByLabelText('LINE 連結')).toBeNull();
    selectContact('Threads 私訊');
    expect(screen.queryByLabelText('LINE 連結')).toBeNull();
    selectContact('LINE');
    expect(screen.getByLabelText('LINE 連結')).toBeTruthy();
  });

  it.each([
    {
      channel: 'IG 私訊',
      social: { instagram: '', threads: '@stellar' },
      field: 'Instagram',
      value: '@venue',
      message: '請填寫 Instagram 帳號',
    },
    {
      channel: 'Threads 私訊',
      social: { instagram: '@stellar', threads: '' },
      field: 'Threads',
      value: '@venue',
      message: '請填寫 Threads 帳號',
    },
    {
      channel: 'LINE',
      social: { instagram: '@stellar', threads: '' },
      field: 'LINE 連結',
      value: 'https://lin.ee/abc',
      message: '請填寫 LINE 連結',
    },
  ])(
    'TC-098 選 $channel 但 $field 空白：該欄下方顯示錯誤、不送出；填上後錯誤消失可送出',
    ({ channel, social, field, value, message }) => {
      const onSubmit = renderCreate();
      fillRequired(social);
      selectContact(channel);
      submitCreate();

      expectFieldError(field, message);
      expect(onSubmit).not.toHaveBeenCalled();

      fireEvent.change(screen.getByLabelText(field), { target: { value } });
      expect(screen.queryByText(message)).toBeNull();
      submitCreate();
      expect(onSubmit).toHaveBeenCalledTimes(1);
    }
  );

  it('TC-098 選 LINE 時 LINE 連結只有空白也算沒填', () => {
    const onSubmit = renderCreate();
    fillRequired();
    selectContact('LINE');
    fireEvent.change(screen.getByLabelText('LINE 連結'), { target: { value: '   ' } });
    submitCreate();

    expectFieldError('LINE 連結', '請填寫 LINE 連結');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('TC-098 送出失敗後開始打 LINE 連結：錯誤清掉，打字途中不冒格式錯誤', () => {
    renderCreate();
    fillRequired();
    selectContact('LINE');
    submitCreate();
    expect(screen.getByText('請填寫 LINE 連結')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('LINE 連結'), { target: { value: 'h' } });
    expect(screen.queryByText('請填寫 LINE 連結')).toBeNull();
    expect(screen.queryByText('請輸入完整網址（以 https:// 開頭）')).toBeNull();
  });

  it('LINE 連結用網址鍵盤', () => {
    renderCreate();
    selectContact('LINE');
    expect(screen.getByLabelText('LINE 連結').getAttribute('inputmode')).toBe('url');
  });

  it('TC-098 送出失敗後改選管道，錯誤即時跟著換', () => {
    const onSubmit = renderCreate();
    fillRequired({ instagram: '@stellar', threads: '' });
    selectContact('LINE');
    submitCreate();
    expect(screen.getByText('請填寫 LINE 連結')).toBeTruthy();

    selectContact('Threads 私訊');
    expect(screen.queryByText('請填寫 LINE 連結')).toBeNull();
    expectFieldError('Threads', '請填寫 Threads 帳號');

    selectContact('IG 私訊');
    expect(screen.queryByText('請填寫 Threads 帳號')).toBeNull();
    submitCreate();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('VenueForm LINE 連結（TC-098，存 contactUrl）', () => {
  function fillAndSubmit(contactUrl: string) {
    const onSubmit = renderCreate();
    fillRequired();
    selectContact('LINE');
    fireEvent.change(screen.getByLabelText('LINE 連結'), { target: { value: contactUrl } });
    submitCreate();
    return onSubmit;
  }

  it.each([
    '@abc123',
    'line.me/xxx',
    'ftp://example.com',
    'javascript:alert(1)',
    'https:example.com',
    'HTTPS://example.com',
  ])('拒絕非 http(s) 網址 %s 並顯示錯誤', (value) => {
    const onSubmit = fillAndSubmit(value);
    expectFieldError('LINE 連結', URL_ERR);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('接受 https 與 http 網址，並送出 trim 後的值', () => {
    expect(fillAndSubmit('  https://lin.ee/abc  ')).toHaveBeenCalledWith(
      expect.objectContaining({ preferredContact: 'line', contactUrl: 'https://lin.ee/abc' })
    );
    cleanup();
    expect(fillAndSubmit('http://example.com')).toHaveBeenCalled();
  });

  it('500 字通過、501 字擋下', () => {
    const base = 'https://example.com/';
    expect(fillAndSubmit(base + 'a'.repeat(500 - base.length))).toHaveBeenCalled();
    cleanup();
    const onSubmit = fillAndSubmit(base + 'a'.repeat(501 - base.length));
    expect(screen.getByText(LENGTH_ERR)).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('placeholder 是 LINE 官方帳號網址，不含 LINE ID', () => {
    renderCreate();
    selectContact('LINE');
    const placeholder = screen.getByLabelText('LINE 連結').getAttribute('placeholder') ?? '';
    expect(placeholder).toBe('LINE 網址');
    expect(placeholder).not.toMatch(/line id/i);
  });

  it('改選 IG 私訊後，隱藏的非法值不驗證也不送出', () => {
    const onSubmit = fillAndSubmit('@abc123');
    expect(onSubmit).not.toHaveBeenCalled();
    selectContact('IG 私訊');
    expect(screen.queryByLabelText('LINE 連結')).toBeNull();
    submitCreate();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('contactUrl');
  });
});

describe('VenueForm 預約表單網址（TC-098 新增模式，存 bookingFormUrl）', () => {
  function fillAndSubmit(bookingFormUrl: string) {
    const onSubmit = renderCreate();
    fillRequired();
    fireEvent.change(screen.getByLabelText('預約表單網址'), {
      target: { value: bookingFormUrl },
    });
    submitCreate();
    return onSubmit;
  }

  it('TC-098 不論選哪個管道都顯示，附提示文字', () => {
    renderCreate();
    expect(screen.getByLabelText('預約表單網址')).toBeTruthy();
    expect(
      screen.getByText('例如給主辦預約場地用的 Google 表單、預約系統連結，如果沒有可以跳過。')
    ).toBeTruthy();
    selectContact('Threads 私訊');
    expect(screen.getByLabelText('預約表單網址')).toBeTruthy();
    selectContact('LINE');
    expect(screen.getByLabelText('預約表單網址')).toBeTruthy();
  });

  it.each(['', '   '])('TC-098 空值（%j）可送出，body 不帶 bookingFormUrl', (value) => {
    const onSubmit = fillAndSubmit(value);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('bookingFormUrl');
  });

  it('TC-098 前後空白會 trim 後送出', () => {
    expect(fillAndSubmit('  https://forms.gle/x  ')).toHaveBeenCalledWith(
      expect.objectContaining({ bookingFormUrl: 'https://forms.gle/x' })
    );
  });

  it.each([
    { value: 'abc', message: URL_ERR },
    { value: 'javascript:alert(1)', message: URL_ERR },
    {
      value: 'https://forms.gle/' + 'a'.repeat(501 - 'https://forms.gle/'.length),
      message: LENGTH_ERR,
    },
  ])('TC-098 非法值 $value 在欄位下方顯示錯誤、不送出', ({ value, message }) => {
    const onSubmit = fillAndSubmit(value);
    expectFieldError('預約表單網址', message);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('TC-098 剛好 500 字可送出', () => {
    const base = 'https://forms.gle/';
    const value = base + 'a'.repeat(500 - base.length);
    expect(fillAndSubmit(value)).toHaveBeenCalledWith(
      expect.objectContaining({ bookingFormUrl: value })
    );
  });

  it('TC-098 修改欄位後錯誤消失', () => {
    fillAndSubmit('abc');
    fireEvent.change(screen.getByLabelText('預約表單網址'), {
      target: { value: 'https://forms.gle/x' },
    });
    expect(screen.queryByText(URL_ERR)).toBeNull();
  });
});
