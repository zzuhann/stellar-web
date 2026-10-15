import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SubmitVenueClient from './SubmitVenueClient';

const mutate = vi.fn();

vi.mock('next/link', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/api', () => ({
  venueSubmissionApi: { autocomplete: vi.fn(), getPlaceDetails: vi.fn() },
}));
vi.mock('@/lib/r2-upload', () => ({ uploadImageToAPI: vi.fn() }));
vi.mock('@/components/admin-new/hooks/useSubmitVenueMutation', () => ({
  useSubmitVenueMutation: () => ({ mutate, isPending: false }),
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

afterEach(() => {
  cleanup();
  mutate.mockReset();
});

describe('SubmitVenueClient 聯絡方式（TC-098）', () => {
  it('TC-098 店家投稿頁用同一套聯絡欄位，送出時帶 trim 後的 bookingFormUrl', () => {
    render(<SubmitVenueClient />);

    expect(screen.getByText('主辦要怎麼聯絡你？')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'IG 私訊' }));
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'IG 私訊',
      'Threads 私訊',
      'LINE',
    ]);
    fireEvent.click(screen.getByRole('option', { name: 'LINE' }));
    expect(screen.getByLabelText('LINE 連結')).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '測試場地' } });
    fireEvent.change(screen.getByLabelText(/地址/), { target: { value: '測試地址' } });
    fireEvent.click(screen.getByRole('button', { name: '請選擇地區' }));
    fireEvent.click(screen.getByRole('option', { name: '台北' }));
    fireEvent.click(screen.getByRole('button', { name: '請選擇容納人數範圍' }));
    fireEvent.click(screen.getByRole('option', { name: '20-40人' }));
    fireEvent.change(screen.getByLabelText('Instagram'), { target: { value: '@stellar' } });
    fireEvent.click(screen.getByRole('button', { name: '模擬封面上傳' }));
    fireEvent.change(screen.getByLabelText('LINE 連結'), {
      target: { value: 'https://lin.ee/abc' },
    });
    fireEvent.change(screen.getByLabelText('預約表單網址'), {
      target: { value: '  https://forms.gle/x  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: '送出場地投稿' }));

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toMatchObject({
      preferredContact: 'line',
      contactUrl: 'https://lin.ee/abc',
      bookingFormUrl: 'https://forms.gle/x',
    });
  });
});
