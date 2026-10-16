import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import VenueForm from './VenueForm';
import { renderWithClient } from './venuePlaceReselect.fixtures';

vi.mock('@/lib/api', () => ({
  venueApi: { previewPlaceReselect: vi.fn(), applyPlaceReselect: vi.fn() },
  placesApi: {},
}));
vi.mock('@/lib/revalidate', () => ({ revalidatePublicPages: vi.fn() }));
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
vi.mock('@/components/forms/PlaceAutocomplete', () => ({
  default: () => <input aria-label="搜尋地點" />,
}));

afterEach(cleanup);

describe('R2 公開投稿（create）送出 payload', () => {
  it('未選地點時 payload 不含 placeId、lat、lng', () => {
    const onSubmit = vi.fn();
    renderWithClient(
      <VenueForm mode="create" onSubmit={onSubmit} isSubmitting={false} submitError={null} />
    );

    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '測試場地' } });
    fireEvent.change(screen.getByLabelText(/地址/), { target: { value: '測試地址' } });
    fireEvent.click(screen.getByRole('button', { name: '請選擇地區' }));
    fireEvent.click(screen.getByRole('option', { name: '台北' }));
    fireEvent.click(screen.getByRole('button', { name: '請選擇容納人數範圍' }));
    fireEvent.click(screen.getByRole('option', { name: '20-40人' }));
    fireEvent.change(screen.getByLabelText('Instagram'), { target: { value: '@stellar' } });
    fireEvent.click(screen.getByRole('button', { name: '模擬封面上傳' }));
    fireEvent.click(screen.getByRole('button', { name: '新增場地' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload).not.toHaveProperty('placeId');
    expect(payload).not.toHaveProperty('lat');
    expect(payload).not.toHaveProperty('lng');
    expect(Object.keys(payload).sort()).toEqual(
      [
        'address',
        'capacityRange',
        'coverPhoto',
        'description',
        'mrtWalkMinutes',
        'name',
        'nearestMrt',
        'preferredContact',
        'region',
        'socialMedia',
      ].sort()
    );
  });
});
