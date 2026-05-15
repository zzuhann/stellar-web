'use client';

import { useState } from 'react';
import { css } from '@/styled-system/css';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { CreateVenueData } from '@/types';
import ImageUpload from '@/components/images/ImageUpload';
import MultiImageUpload from '@/components/images/MultiImageUpload';
import PlaceAutocomplete from '@/components/forms/PlaceAutocomplete';
import { useAuthToken } from '@/hooks/useAuthToken';

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

const overlay = css({
  position: 'fixed',
  inset: '0',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'alpha.black.50',
  padding: '4',
});

const modal = css({
  background: 'color.background.primary',
  borderRadius: 'radius.lg',
  width: '100%',
  maxWidth: '560px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: 'var(--shadow-xl)',
  display: 'flex',
  flexDirection: 'column',
});

const header = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '5',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  position: 'sticky',
  top: 0,
  background: 'color.background.primary',
  zIndex: 1,
});

const titleText = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
  margin: 0,
});

const closeBtn = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: 'radius.md',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: 'color.text.secondary',
  '&:hover': {
    background: 'gray.100',
    color: 'color.text.primary',
  },
  '& svg': { width: '20px', height: '20px' },
});

const body = css({
  padding: '5',
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
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

const footer = css({
  display: 'flex',
  gap: '3',
  padding: '5',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  justifyContent: 'flex-end',
  position: 'sticky',
  bottom: 0,
  background: 'color.background.primary',
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

type VenueCreateModalProps = {
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (data: CreateVenueData) => void;
};

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
};

const emptyForm: FormState = {
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
};

export default function VenueCreateModal({
  isOpen,
  isSaving,
  onClose,
  onSave,
}: VenueCreateModalProps) {
  const { token } = useAuthToken();
  const [form, setForm] = useState<FormState>(emptyForm);

  if (!isOpen) return null;

  const handlePlaceSelect = (place: {
    place_id: string;
    address: string;
    coordinates: { lat: number; lng: number };
    name: string;
    city: string;
  }) => {
    setForm((prev) => ({
      ...prev,
      name: prev.name || place.name,
      address: place.address,
      lat: place.coordinates.lat,
      lng: place.coordinates.lng,
      place_id: place.place_id,
    }));
  };

  const handleClose = () => {
    setForm(emptyForm);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateVenueData = {
      name: form.name.trim(),
      address: form.address.trim(),
      region: form.region,
    };

    if (form.lat !== null) data.lat = form.lat;
    if (form.lng !== null) data.lng = form.lng;
    if (form.place_id) data.place_id = form.place_id;
    if (form.nearest_mrt) data.nearest_mrt = form.nearest_mrt;
    if (form.mrt_walk_minutes) data.mrt_walk_minutes = parseInt(form.mrt_walk_minutes, 10);
    if (form.capacity_max) data.capacity_max = parseInt(form.capacity_max, 10);
    if (form.coverPhoto) data.coverPhoto = form.coverPhoto;
    if (form.otherPhotos.length > 0) data.otherPhotos = form.otherPhotos;
    if (form.description.trim()) data.description = form.description.trim();
    if (form.threads || form.instagram) {
      data.socialMedia = {
        threads: form.threads || undefined,
        instagram: form.instagram || undefined,
      };
    }

    onSave(data);
  };

  const set =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const hasLocation = form.lat !== null && form.lng !== null;

  return (
    <div className={overlay} onClick={handleClose}>
      <div className={modal} onClick={(e) => e.stopPropagation()}>
        <div className={header}>
          <h2 className={titleText}>新增場地</h2>
          <button className={closeBtn} onClick={handleClose} type="button" aria-label="關閉">
            <XMarkIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={body}>
            {/* 地點搜尋 */}
            <div className={fieldGroup}>
              <label className={labelStyle}>
                搜尋地點
                <span className={labelSub}>（自動填入地址與座標）</span>
              </label>
              <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
              {hasLocation && (
                <p className={autoFilledHint}>
                  ✓ 已取得座標 ({form.lat?.toFixed(5)}, {form.lng?.toFixed(5)})
                </p>
              )}
            </div>

            <div className={divider} />

            {/* 必填欄位 */}
            <div className={fieldGroup}>
              <label className={labelStyle}>
                場地名稱
                <span className={required}>*</span>
              </label>
              <input
                className={input}
                value={form.name}
                onChange={set('name')}
                placeholder="例：小米酒咖啡館"
                required
              />
            </div>

            <div className={fieldGroup}>
              <label className={labelStyle}>
                地址
                <span className={required}>*</span>
              </label>
              <input
                className={input}
                value={form.address}
                onChange={set('address')}
                placeholder="由搜尋自動填入，或手動輸入"
                required
              />
            </div>

            <div className={fieldGroup}>
              <label className={labelStyle}>
                地區
                <span className={required}>*</span>
              </label>
              <select className={select} value={form.region} onChange={set('region')} required>
                <option value="">請選擇</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className={divider} />

            {/* 選填欄位 */}
            <div className={fieldRow}>
              <div className={fieldGroup}>
                <label className={labelStyle}>最近捷運站</label>
                <input
                  className={input}
                  value={form.nearest_mrt}
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
                  value={form.mrt_walk_minutes}
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
                value={form.capacity_max}
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
                    value={form.threads}
                    onChange={set('threads')}
                    placeholder="@username"
                  />
                </div>
                <div className={fieldGroup}>
                  <label className={labelSub}>Instagram</label>
                  <input
                    className={input}
                    value={form.instagram}
                    onChange={set('instagram')}
                    placeholder="@username"
                  />
                </div>
              </div>
            </div>

            <div className={fieldGroup}>
              <label className={labelStyle}>封面圖片</label>
              <ImageUpload
                onUploadComplete={(url) => setForm((prev) => ({ ...prev, coverPhoto: url }))}
                onImageRemove={() => setForm((prev) => ({ ...prev, coverPhoto: '' }))}
                authToken={token || undefined}
                placeholder="點擊上傳封面圖片"
                compressionParams={{ maxWidth: 1200, maxHeight: 800, quality: 0.85 }}
              />
            </div>

            <div className={fieldGroup}>
              <label className={labelStyle}>其他照片</label>
              <MultiImageUpload
                onImagesChange={(urls) => setForm((prev) => ({ ...prev, otherPhotos: urls }))}
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
                value={form.description}
                onChange={set('description')}
                placeholder="場地備注、特殊說明..."
              />
            </div>
          </div>

          <div className={footer}>
            <button type="button" className={cancelBtn} onClick={handleClose}>
              取消
            </button>
            <button type="submit" className={saveBtn} disabled={isSaving}>
              {isSaving ? '新增中...' : '新增場地'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
