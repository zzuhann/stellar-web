import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import VenueForm from './VenueForm';

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

describe('VenueForm create mode', () => {
  it('缺少容納人數、社群帳號及封面圖片時阻止送出', () => {
    const onSubmit = vi.fn();
    render(<VenueForm mode="create" onSubmit={onSubmit} isSubmitting={false} submitError={null} />);

    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '測試場地' } });
    fireEvent.change(screen.getByLabelText(/地址/), { target: { value: '測試地址' } });
    fireEvent.click(screen.getByRole('button', { name: '請選擇地區' }));
    fireEvent.click(screen.getByRole('option', { name: '台北' }));
    fireEvent.click(screen.getByRole('button', { name: '新增場地' }));

    expect(screen.getByText('請選擇容納人數')).toBeTruthy();
    expect(screen.getByText('請至少填寫 Instagram 或 Threads')).toBeTruthy();
    expect(screen.getByText('請上傳封面圖片')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('預設選取 IG 私訊並送出 preferredContact', () => {
    const onSubmit = vi.fn();
    render(<VenueForm mode="create" onSubmit={onSubmit} isSubmitting={false} submitError={null} />);

    expect(screen.getByText('偏好聯繫方式')).toBeTruthy();
    expect(screen.getByRole('button', { name: /IG 私訊/ })).toBeTruthy();
    expect(screen.queryByText('不填寫')).toBeNull();

    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '測試場地' } });
    fireEvent.change(screen.getByLabelText(/地址/), { target: { value: '測試地址' } });
    fireEvent.click(screen.getByRole('button', { name: '請選擇地區' }));
    fireEvent.click(screen.getByRole('option', { name: '台北' }));
    fireEvent.click(screen.getByRole('button', { name: '請選擇容納人數範圍' }));
    fireEvent.click(screen.getByRole('option', { name: '20-40人' }));
    expect(screen.getByRole('button', { name: '20-40人' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Instagram'), { target: { value: '@stellar' } });
    fireEvent.click(screen.getByRole('button', { name: '模擬封面上傳' }));
    fireEvent.click(screen.getByRole('button', { name: '新增場地' }));

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

describe('VenueForm contactUrl', () => {
  const ERR = '請輸入完整網址（以 http:// 或 https:// 開頭）';

  function fillAndSubmit(contactUrl: string | null) {
    const onSubmit = vi.fn();
    render(<VenueForm mode="create" onSubmit={onSubmit} isSubmitting={false} submitError={null} />);
    fillRequired();
    if (contactUrl !== null) {
      selectContact(/LINE/i);
      fireEvent.change(screen.getByLabelText('預約表單連結'), { target: { value: contactUrl } });
    }
    fireEvent.click(screen.getByRole('button', { name: '新增場地' }));
    return onSubmit;
  }

  function fillRequired() {
    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '測試場地' } });
    fireEvent.change(screen.getByLabelText(/地址/), { target: { value: '測試地址' } });
    fireEvent.click(screen.getByRole('button', { name: '請選擇地區' }));
    fireEvent.click(screen.getByRole('option', { name: '台北' }));
    fireEvent.click(screen.getByRole('button', { name: '請選擇容納人數範圍' }));
    fireEvent.click(screen.getByRole('option', { name: '20-40人' }));
    fireEvent.change(screen.getByLabelText('Instagram'), { target: { value: '@stellar' } });
    fireEvent.click(screen.getByRole('button', { name: '模擬封面上傳' }));
  }

  function selectContact(name: RegExp) {
    fireEvent.click(screen.getByRole('button', { name: /IG 私訊|Line|表單|其他|Threads/ }));
    fireEvent.click(screen.getByRole('option', { name }));
  }

  it.each([
    '@abc123',
    'line.me/xxx',
    'ftp://example.com',
    'javascript:alert(1)',
    'https:example.com',
  ])('拒絕非 http(s) 網址 %s 並顯示錯誤', (value) => {
    const onSubmit = fillAndSubmit(value);
    const input = screen.getByLabelText('預約表單連結');
    const error = screen.getByText(ERR);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(error.id);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('接受 https 與 http 網址，並送出 trim 後的值', () => {
    expect(fillAndSubmit('  https://line.me/ti/p/xxx  ')).toHaveBeenCalledWith(
      expect.objectContaining({ contactUrl: 'https://line.me/ti/p/xxx' })
    );
    cleanup();
    expect(fillAndSubmit('http://example.com')).toHaveBeenCalled();
  });

  it('空值仍為選填', () => {
    expect(fillAndSubmit('')).toHaveBeenCalled();
  });

  it('500 字通過、501 字擋下', () => {
    const base = 'https://example.com/';
    expect(fillAndSubmit(base + 'a'.repeat(500 - base.length))).toHaveBeenCalled();
    cleanup();
    const onSubmit = fillAndSubmit(base + 'a'.repeat(501 - base.length));
    expect(screen.getByText('網址不能超過 500 個字')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('placeholder 不含 LINE ID', () => {
    fillAndSubmit('');
    const placeholder = screen.getByLabelText('預約表單連結').getAttribute('placeholder') ?? '';
    expect(placeholder).not.toMatch(/line id/i);
  });

  it('改選不需要網址的聯繫方式後，隱藏的非法值不驗證也不送出', () => {
    const onSubmit = fillAndSubmit('@abc123');
    expect(onSubmit).not.toHaveBeenCalled();
    selectContact(/IG 私訊/);
    expect(screen.queryByLabelText('預約表單連結')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '新增場地' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].contactUrl).toBeUndefined();
  });
});

describe('VenueForm edit mode', () => {
  it('舊資料缺少新增必填欄位時仍可儲存其他修改', () => {
    const onSubmit = vi.fn();
    render(
      <VenueForm
        mode="edit"
        initialValues={{
          name: '舊場地',
          address: '舊地址',
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
        onSubmit={onSubmit}
        isSubmitting={false}
        submitError={null}
        status="active"
        onStatusChange={vi.fn()}
        isStatusChanging={false}
        onDeleteClick={vi.fn()}
        canDelete={false}
      />
    );

    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '更新場地' } });
    fireEvent.click(screen.getByRole('button', { name: '儲存變更' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: '更新場地' }));
  });

  function renderEdit(preferredContact: string, contactUrl: string) {
    const onSubmit = vi.fn();
    render(
      <VenueForm
        mode="edit"
        initialValues={{
          name: '舊場地',
          address: '舊地址',
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
          preferredContact: preferredContact as never,
          contactUrl,
        }}
        onSubmit={onSubmit}
        isSubmitting={false}
        submitError={null}
        status="active"
        onStatusChange={vi.fn()}
        isStatusChanging={false}
        onDeleteClick={vi.fn()}
        canDelete={false}
      />
    );
    return onSubmit;
  }

  it('contactUrl 非法時阻止儲存', () => {
    const onSubmit = renderEdit('line', 'abc');
    fireEvent.click(screen.getByRole('button', { name: '儲存變更' }));
    expect(screen.getByText('請輸入完整網址（以 http:// 或 https:// 開頭）')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('切換成不需網址的聯繫方式時，隱藏的非法值不卡住也不送出', () => {
    const onSubmit = renderEdit('line', 'abc');
    fireEvent.click(screen.getByRole('button', { name: /Line/ }));
    fireEvent.click(screen.getByRole('option', { name: /IG 私訊/ }));
    fireEvent.click(screen.getByRole('button', { name: '儲存變更' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].contactUrl).toBeUndefined();
  });
});
