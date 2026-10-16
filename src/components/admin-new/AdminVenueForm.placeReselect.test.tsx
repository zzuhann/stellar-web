import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdminVenueForm, { type AdminVenueFormValues } from './AdminVenueForm';
import { CURRENT_PLACE, renderWithClient } from './venuePlaceReselect.fixtures';

vi.mock('@/lib/api', () => ({
  venueApi: {
    previewPlaceReselect: vi.fn(),
    applyPlaceReselect: vi.fn(),
    getTagDictionary: () => new Promise(() => {}),
  },
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

const editValues: AdminVenueFormValues = {
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
  bookingFormUrl: '',
};

describe('R1 後台新增場地（create）', () => {
  it('不出現地點區塊，PlaceAutocomplete 仍在表單頂部', () => {
    renderWithClient(
      <AdminVenueForm mode="create" onSubmit={vi.fn()} isSubmitting={false} submitError={null} />
    );

    expect(screen.queryByRole('button', { name: '重新選擇地點' })).toBeNull();
    expect(screen.queryByText('目前地點')).toBeNull();
    expect(screen.getByText('搜尋地點')).toBeTruthy();
    expect(screen.getByLabelText('搜尋地點')).toBeTruthy();
  });
});

describe('R3 edit 一般儲存', () => {
  it('payload 不夾帶 placeId、lat、lng，也不開啟重新選擇彈窗', async () => {
    const onSubmit = vi.fn();
    renderWithClient(
      <AdminVenueForm
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
