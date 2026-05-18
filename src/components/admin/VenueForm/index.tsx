'use client';

import { useState } from 'react';
import { css } from '@/styled-system/css';
import { useRouter } from 'next/navigation';
import type { CreateVenueData, UpdateVenueData, VenueDetail } from '@/types';
import ImageUpload from '@/components/images/ImageUpload';
import MultiImageUpload from '@/components/images/MultiImageUpload';
import PlaceAutocomplete from '@/components/forms/PlaceAutocomplete';
import { useAuthToken } from '@/hooks/useAuthToken';
import { useCreateVenueMutation } from './hook/useCreateVenueMutation';
import { useUpdateVenueMutation } from './hook/useUpdateVenueMutation';

const REGIONS = [
  '臺北',
  '新北',
  '桃園',
  '臺中',
  '臺南',
  '高雄',
  '基隆',
  '新竹',
  '嘉義',
  '宜蘭',
  '苗栗',
  '彰化',
  '南投',
  '雲林',
  '屏東',
  '花蓮',
  '臺東',
  '澎湖',
  '金門',
  '連江',
] as const;

const pageContainer = css({
  maxWidth: '640px',
  margin: '0 auto',
  paddingX: '4',
  paddingTop: '25',
  paddingBottom: '16',
});

const sectionTitle = css({
  textStyle: 'heading',
  color: 'color.text.primary',
  margin: '0 0 8px 0',
});

const form = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
  marginTop: '6',
});

const fieldGroup = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5',
});

const fieldRow = css({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '3',
});

const labelStyle = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
});

const labelSub = css({
  textStyle: 'caption',
  fontWeight: 'normal',
  color: 'color.text.secondary',
});

const required = css({
  color: 'red.500',
  marginLeft: '1',
});

const input = css({
  width: '100%',
  paddingY: '2.5',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  textStyle: 'body',
  color: 'color.text.primary',
  background: 'white',
  outline: 'none',
  '&:focus': {
    borderColor: 'color.primary',
    boxShadow: '0 0 0 2px var(--colors-stellar-blue-100)',
  },
  '&::placeholder': { color: 'color.text.tertiary' },
  '&:disabled': {
    background: 'gray.50',
    color: 'color.text.secondary',
    cursor: 'not-allowed',
  },
});

const select = css({
  width: '100%',
  paddingY: '2.5',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  textStyle: 'body',
  color: 'color.text.primary',
  background: 'white',
  outline: 'none',
  cursor: 'pointer',
  '&:focus': {
    borderColor: 'color.primary',
    boxShadow: '0 0 0 2px var(--colors-stellar-blue-100)',
  },
});

const textarea = css({
  width: '100%',
  paddingY: '3',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  textStyle: 'body',
  color: 'color.text.primary',
  background: 'white',
  outline: 'none',
  resize: 'vertical',
  minHeight: '100px',
  '&:focus': {
    borderColor: 'color.primary',
    boxShadow: '0 0 0 2px var(--colors-stellar-blue-100)',
  },
  '&::placeholder': { color: 'color.text.tertiary' },
});

const autoFilledHint = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  marginTop: '1',
});

const divider = css({
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  marginY: '1',
});

const statusToggleRow = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingY: '3',
  paddingX: '4',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
});

const statusToggleLabel = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5',
});

const statusToggleName = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
});

const statusToggleDesc = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
});

const toggleTrack = css({
  position: 'relative',
  width: '44px',
  height: '24px',
  borderRadius: 'full',
  background: 'gray.300',
  cursor: 'pointer',
  transition: 'background 0.2s',
  border: 'none',
  flexShrink: 0,
  '&[data-active="true"]': {
    background: 'color.primary',
  },
});

const toggleThumb = css({
  position: 'absolute',
  top: '2px',
  left: '2px',
  width: '20px',
  height: '20px',
  borderRadius: 'full',
  background: 'white',
  transition: 'transform 0.2s',
  pointerEvents: 'none',
  '[data-active="true"] &': {
    transform: 'translateX(20px)',
  },
});

const footerActions = css({
  display: 'flex',
  gap: '3',
  justifyContent: 'flex-end',
  marginTop: '4',
  paddingTop: '6',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
});

const cancelBtn = css({
  paddingY: '2.5',
  paddingX: '5',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.primary',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  cursor: 'pointer',
  '&:hover': { background: 'gray.50' },
});

const saveBtn = css({
  paddingY: '2.5',
  paddingX: '5',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.primary',
  background: 'color.primary',
  color: 'white',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover:not(:disabled)': {
    background: 'stellarBlue.600',
    borderColor: 'stellarBlue.600',
  },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
});

type VenueFormMode = { mode: 'create' } | { mode: 'edit'; venue: VenueDetail };

type Props = VenueFormMode;

type FormState = {
  name: string;
  address: string;
  region: string;
  lat: number | null;
  lng: number | null;
  place_id: string;
  nearest_mrt: string;
  mrt_walk_minutes: string;
  capacity_max: string;
  coverPhoto: string;
  otherPhotos: string[];
  threads: string;
  instagram: string;
  description: string;
  status: 'active' | 'inactive';
};

function buildInitialForm(props: Props): FormState {
  if (props.mode === 'edit') {
    const v = props.venue;
    return {
      name: v.name,
      address: v.address,
      region: v.region,
      lat: v.lat ?? null,
      lng: v.lng ?? null,
      place_id: v.place_id ?? '',
      nearest_mrt: v.nearest_mrt ?? '',
      mrt_walk_minutes: v.mrt_walk_minutes !== null ? String(v.mrt_walk_minutes) : '',
      capacity_max: v.capacity_max !== null ? String(v.capacity_max) : '',
      coverPhoto: v.coverPhoto ?? '',
      otherPhotos: v.otherPhotos ?? [],
      threads: v.socialMedia?.threads ?? '',
      instagram: v.socialMedia?.instagram ?? '',
      description: v.description ?? '',
      status: v.status ?? 'active',
    };
  }
  return {
    name: '',
    address: '',
    region: '',
    lat: null,
    lng: null,
    place_id: '',
    nearest_mrt: '',
    mrt_walk_minutes: '',
    capacity_max: '',
    coverPhoto: '',
    otherPhotos: [],
    threads: '',
    instagram: '',
    description: '',
    status: 'active',
  };
}

export default function VenueFormClient(props: Props) {
  const { token } = useAuthToken();
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(() => buildInitialForm(props));

  const createMutation = useCreateVenueMutation();
  const updateMutation = useUpdateVenueMutation(props.mode === 'edit' ? props.venue.id : '');

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handlePlaceSelect = (place: {
    place_id: string;
    address: string;
    coordinates: { lat: number; lng: number };
    name: string;
    city: string;
  }) => {
    setFormState((prev) => ({
      ...prev,
      name: prev.name || place.name,
      address: place.address,
      lat: place.coordinates.lat,
      lng: place.coordinates.lng,
      place_id: place.place_id,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (props.mode === 'create') {
      const data: CreateVenueData = {
        name: formState.name.trim(),
        address: formState.address.trim(),
        region: formState.region,
      };
      if (formState.lat !== null) data.lat = formState.lat;
      if (formState.lng !== null) data.lng = formState.lng;
      if (formState.place_id) data.place_id = formState.place_id;
      if (formState.nearest_mrt) data.nearest_mrt = formState.nearest_mrt;
      if (formState.mrt_walk_minutes)
        data.mrt_walk_minutes = parseInt(formState.mrt_walk_minutes, 10);
      if (formState.capacity_max) data.capacity_max = parseInt(formState.capacity_max, 10);
      if (formState.coverPhoto) data.coverPhoto = formState.coverPhoto;
      if (formState.otherPhotos.length > 0) data.otherPhotos = formState.otherPhotos;
      if (formState.description.trim()) data.description = formState.description.trim();
      if (formState.threads || formState.instagram) {
        data.socialMedia = {
          threads: formState.threads || undefined,
          instagram: formState.instagram || undefined,
        };
      }
      createMutation.mutate(data);
    } else {
      const v = props.venue;
      const data: UpdateVenueData = {};

      if (formState.name !== v.name) data.name = formState.name;
      if (formState.address !== v.address) data.address = formState.address;
      if (formState.region !== v.region) data.region = formState.region;
      if (formState.nearest_mrt !== (v.nearest_mrt ?? '')) data.nearest_mrt = formState.nearest_mrt;
      if (formState.coverPhoto !== (v.coverPhoto ?? '')) data.coverPhoto = formState.coverPhoto;

      const parsedMinutes =
        formState.mrt_walk_minutes === '' ? null : parseInt(formState.mrt_walk_minutes, 10);
      if (parsedMinutes !== v.mrt_walk_minutes) data.mrt_walk_minutes = parsedMinutes;

      const parsedCapacity =
        formState.capacity_max === '' ? null : parseInt(formState.capacity_max, 10);
      if (parsedCapacity !== v.capacity_max) data.capacity_max = parsedCapacity;

      const threadsChanged = formState.threads !== (v.socialMedia?.threads ?? '');
      const instagramChanged = formState.instagram !== (v.socialMedia?.instagram ?? '');
      if (threadsChanged || instagramChanged) {
        data.socialMedia = {
          threads: formState.threads || undefined,
          instagram: formState.instagram || undefined,
        };
      }

      const photosChanged =
        JSON.stringify(formState.otherPhotos) !== JSON.stringify(v.otherPhotos ?? []);
      if (photosChanged) data.otherPhotos = formState.otherPhotos;

      if (formState.description !== (v.description ?? '')) data.description = formState.description;

      if (formState.status !== (v.status ?? 'active')) data.status = formState.status;

      if (Object.keys(data).length === 0) {
        router.push('/admin/venues');
        return;
      }

      updateMutation.mutate(data);
    }
  };

  const set =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));

  const hasLocation = formState.lat !== null && formState.lng !== null;
  const isEdit = props.mode === 'edit';

  return (
    <div className={pageContainer}>
      <h1 className={sectionTitle}>{isEdit ? '編輯場地' : '新增場地'}</h1>

      <form className={form} onSubmit={handleSubmit}>
        {/* Place autocomplete — only shown in create mode */}
        {!isEdit && (
          <>
            <div className={fieldGroup}>
              <label className={labelStyle}>
                搜尋地點
                <span className={labelSub}>（自動填入地址與座標）</span>
              </label>
              <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
              {hasLocation && (
                <p className={autoFilledHint}>
                  ✓ 已取得座標 ({formState.lat?.toFixed(5)}, {formState.lng?.toFixed(5)})
                </p>
              )}
            </div>
            <div className={divider} />
          </>
        )}

        {/* Required fields */}
        <div className={fieldGroup}>
          <label className={labelStyle}>
            場地名稱<span className={required}>*</span>
          </label>
          <input
            className={input}
            value={formState.name}
            onChange={set('name')}
            placeholder="例：小米酒咖啡館"
            required
          />
        </div>

        <div className={fieldGroup}>
          <label className={labelStyle}>
            地址<span className={required}>*</span>
          </label>
          <input
            className={input}
            value={formState.address}
            onChange={set('address')}
            placeholder="由搜尋自動填入，或手動輸入"
            required
          />
        </div>

        <div className={fieldGroup}>
          <label className={labelStyle}>
            地區<span className={required}>*</span>
          </label>
          <select className={select} value={formState.region} onChange={set('region')} required>
            <option value="">請選擇</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className={divider} />

        {/* Optional fields */}
        <div className={fieldRow}>
          <div className={fieldGroup}>
            <label className={labelStyle}>最近捷運站</label>
            <input
              className={input}
              value={formState.nearest_mrt}
              onChange={set('nearest_mrt')}
              placeholder="例：忠孝復興"
            />
          </div>
          <div className={fieldGroup}>
            <label className={labelStyle}>步行分鐘數</label>
            <input
              className={input}
              type="number"
              min={0}
              value={formState.mrt_walk_minutes}
              onChange={set('mrt_walk_minutes')}
              placeholder="分鐘"
            />
          </div>
        </div>

        <div className={fieldGroup}>
          <label className={labelStyle}>最大容納人數</label>
          <input
            className={input}
            type="number"
            min={0}
            value={formState.capacity_max}
            onChange={set('capacity_max')}
            placeholder="人"
          />
        </div>

        <div className={fieldGroup}>
          <label className={labelStyle}>社群帳號</label>
          <div className={fieldRow}>
            <div className={fieldGroup}>
              <label className={labelSub}>Threads</label>
              <input
                className={input}
                value={formState.threads}
                onChange={set('threads')}
                placeholder="@username"
              />
            </div>
            <div className={fieldGroup}>
              <label className={labelSub}>Instagram</label>
              <input
                className={input}
                value={formState.instagram}
                onChange={set('instagram')}
                placeholder="@username"
              />
            </div>
          </div>
        </div>

        <div className={fieldGroup}>
          <label className={labelStyle}>封面圖片</label>
          <ImageUpload
            currentImageUrl={formState.coverPhoto || undefined}
            onUploadComplete={(url) => setFormState((prev) => ({ ...prev, coverPhoto: url }))}
            onImageRemove={() => setFormState((prev) => ({ ...prev, coverPhoto: '' }))}
            authToken={token || undefined}
            placeholder="點擊上傳封面圖片"
            compressionParams={{ maxWidth: 1200, maxHeight: 800, quality: 0.85 }}
          />
        </div>

        <div className={fieldGroup}>
          <label className={labelStyle}>其他照片</label>
          <MultiImageUpload
            currentImages={formState.otherPhotos}
            onImagesChange={(urls) => setFormState((prev) => ({ ...prev, otherPhotos: urls }))}
            authToken={token || undefined}
            maxImages={8}
            placeholder="新增照片"
            compressionParams={{ maxWidth: 1200, maxHeight: 900, quality: 0.85 }}
          />
        </div>

        <div className={fieldGroup}>
          <label className={labelStyle}>備注說明</label>
          <textarea
            className={textarea}
            rows={4}
            value={formState.description}
            onChange={set('description')}
            placeholder="場地備注、特殊說明..."
          />
        </div>

        {/* Status toggle — edit mode only */}
        {isEdit && (
          <>
            <div className={divider} />
            <div className={fieldGroup}>
              <label className={labelStyle}>上架狀態</label>
              <div className={statusToggleRow}>
                <div className={statusToggleLabel}>
                  <span className={statusToggleName}>公開上架</span>
                  <span className={statusToggleDesc}>
                    {formState.status === 'active' ? '場地目前開放公開瀏覽' : '場地目前未公開'}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formState.status === 'active'}
                  data-active={formState.status === 'active'}
                  className={toggleTrack}
                  onClick={() =>
                    setFormState((prev) => ({
                      ...prev,
                      status: prev.status === 'active' ? 'inactive' : 'active',
                    }))
                  }
                >
                  <span className={toggleThumb} />
                </button>
              </div>
            </div>
          </>
        )}

        <div className={footerActions}>
          <button type="button" className={cancelBtn} onClick={() => router.push('/admin/venues')}>
            取消
          </button>
          <button type="submit" className={saveBtn} disabled={isSaving}>
            {isSaving ? (isEdit ? '儲存中...' : '新增中...') : isEdit ? '儲存變更' : '新增場地'}
          </button>
        </div>
      </form>
    </div>
  );
}
