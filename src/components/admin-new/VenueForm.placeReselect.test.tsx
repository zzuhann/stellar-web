import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import VenueForm, { type VenueFormValues } from './VenueForm';
import { CURRENT_PLACE, renderWithClient } from './venuePlaceReselect.fixtures';

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

const editValues: VenueFormValues = {
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
};

describe('R1 後台新增場地（create）', () => {
  it('不出現地點區塊，PlaceAutocomplete 仍在表單頂部', () => {
    renderWithClient(
      <VenueForm mode="create" onSubmit={vi.fn()} isSubmitting={false} submitError={null} />
    );

    expect(screen.queryByRole('button', { name: '重新選擇地點' })).toBeNull();
    expect(screen.queryByText('目前地點')).toBeNull();
    expect(screen.getByText('搜尋地點')).toBeTruthy();
    expect(screen.getByLabelText('搜尋地點')).toBeTruthy();
  });
});

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

describe('R3 edit 一般儲存', () => {
  it('payload 不夾帶 placeId、lat、lng，也不開啟重新選擇彈窗', async () => {
    const onSubmit = vi.fn();
    renderWithClient(
      <VenueForm
        mode="edit"
        initialValues={editValues}
        onSubmit={onSubmit}
        isSubmitting={false}
        submitError={null}
        status="active"
        onStatusChange={vi.fn()}
        isStatusChanging={false}
        onDeleteClick={vi.fn()}
        canDelete={false}
        place={{ venueId: 'v1', ...CURRENT_PLACE }}
      />
    );

    expect(await screen.findByRole('button', { name: '重新選擇地點' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/場地名稱/), { target: { value: '更新場地' } });
    fireEvent.click(screen.getByRole('button', { name: '儲存變更' }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: '更新場地' }));
    const payload = onSubmit.mock.calls[0][0];
    expect(payload).not.toHaveProperty('placeId');
    expect(payload).not.toHaveProperty('lat');
    expect(payload).not.toHaveProperty('lng');
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });
});
