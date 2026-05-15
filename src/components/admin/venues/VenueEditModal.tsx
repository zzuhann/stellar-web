'use client';

import { useState } from 'react';
import { css } from '@/styled-system/css';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { VenueDetail, UpdateVenueData } from '@/types';
import ImageUpload from '@/components/images/ImageUpload';
import MultiImageUpload from '@/components/images/MultiImageUpload';
import { useAuthToken } from '@/hooks/useAuthToken';

const REGIONS = [
  '台北',
  '新北',
  '桃園',
  '台中',
  '台南',
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
  '台東',
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
  maxWidth: '520px',
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

const title = css({
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
  '& svg': {
    width: '20px',
    height: '20px',
  },
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

const label = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
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
  '&::placeholder': {
    color: 'color.text.tertiary',
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
  '&::placeholder': {
    color: 'color.text.tertiary',
  },
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
  '&:hover': {
    background: 'gray.50',
  },
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
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

type VenueEditModalProps = {
  venue: VenueDetail;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (id: string, data: UpdateVenueData) => void;
};

export default function VenueEditModal({
  venue,
  isOpen,
  isSaving,
  onClose,
  onSave,
}: VenueEditModalProps) {
  const { token } = useAuthToken();
  const [form, setForm] = useState({
    name: venue.name,
    address: venue.address,
    region: venue.region,
    nearest_mrt: venue.nearest_mrt ?? '',
    mrt_walk_minutes: venue.mrt_walk_minutes !== null ? String(venue.mrt_walk_minutes) : '',
    capacity_max: venue.capacity_max !== null ? String(venue.capacity_max) : '',
    coverPhoto: venue.coverPhoto ?? '',
    threads: venue.socialMedia?.threads ?? '',
    instagram: venue.socialMedia?.instagram ?? '',
    otherPhotos: venue.otherPhotos ?? [],
    description: venue.description ?? '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: UpdateVenueData = {};
    if (form.name !== venue.name) data.name = form.name;
    if (form.address !== venue.address) data.address = form.address;
    if (form.region !== venue.region) data.region = form.region;
    if (form.nearest_mrt !== (venue.nearest_mrt ?? '')) data.nearest_mrt = form.nearest_mrt;
    if (form.coverPhoto !== (venue.coverPhoto ?? '')) data.coverPhoto = form.coverPhoto;

    const parsedMinutes = form.mrt_walk_minutes === '' ? null : parseInt(form.mrt_walk_minutes, 10);
    if (parsedMinutes !== venue.mrt_walk_minutes) data.mrt_walk_minutes = parsedMinutes;

    const parsedCapacity = form.capacity_max === '' ? null : parseInt(form.capacity_max, 10);
    if (parsedCapacity !== venue.capacity_max) data.capacity_max = parsedCapacity;

    const threadsChanged = form.threads !== (venue.socialMedia?.threads ?? '');
    const instagramChanged = form.instagram !== (venue.socialMedia?.instagram ?? '');
    if (threadsChanged || instagramChanged) {
      data.socialMedia = {
        threads: form.threads || undefined,
        instagram: form.instagram || undefined,
      };
    }

    const photosChanged =
      JSON.stringify(form.otherPhotos) !== JSON.stringify(venue.otherPhotos ?? []);
    if (photosChanged) data.otherPhotos = form.otherPhotos;

    if (form.description !== (venue.description ?? '')) data.description = form.description;

    if (Object.keys(data).length === 0) {
      onClose();
      return;
    }

    onSave(venue.id, data);
  };

  const set =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className={overlay} onClick={onClose}>
      <div className={modal} onClick={(e) => e.stopPropagation()}>
        <div className={header}>
          <h2 className={title}>編輯場地</h2>
          <button className={closeBtn} onClick={onClose} type="button" aria-label="關閉">
            <XMarkIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={body}>
            <div className={fieldGroup}>
              <label className={label}>場地名稱</label>
              <input className={input} value={form.name} onChange={set('name')} required />
            </div>

            <div className={fieldGroup}>
              <label className={label}>地址</label>
              <input className={input} value={form.address} onChange={set('address')} />
            </div>

            <div className={fieldGroup}>
              <label className={label}>地區</label>
              <select className={select} value={form.region} onChange={set('region')}>
                <option value="">請選擇</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className={fieldRow}>
              <div className={fieldGroup}>
                <label className={label}>最近捷運站</label>
                <input
                  className={input}
                  value={form.nearest_mrt}
                  onChange={set('nearest_mrt')}
                  placeholder="例：台北車站"
                />
              </div>
              <div className={fieldGroup}>
                <label className={label}>步行分鐘數</label>
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
              <label className={label}>最大容納人數</label>
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
              <label className={label}>社群帳號</label>
              <div className={fieldRow}>
                <div className={fieldGroup}>
                  <label
                    className={label}
                    style={{
                      fontWeight: 'normal',
                      fontSize: '12px',
                      color: 'var(--colors-color-text-secondary)',
                    }}
                  >
                    Threads
                  </label>
                  <input
                    className={input}
                    value={form.threads}
                    onChange={set('threads')}
                    placeholder="@username"
                  />
                </div>
                <div className={fieldGroup}>
                  <label
                    className={label}
                    style={{
                      fontWeight: 'normal',
                      fontSize: '12px',
                      color: 'var(--colors-color-text-secondary)',
                    }}
                  >
                    Instagram
                  </label>
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
              <label className={label}>封面圖片</label>
              <ImageUpload
                currentImageUrl={form.coverPhoto || undefined}
                onUploadComplete={(url) => setForm((prev) => ({ ...prev, coverPhoto: url }))}
                onImageRemove={() => setForm((prev) => ({ ...prev, coverPhoto: '' }))}
                authToken={token || undefined}
                placeholder="點擊上傳封面圖片"
                compressionParams={{ maxWidth: 1200, maxHeight: 800, quality: 0.85 }}
              />
            </div>

            <div className={fieldGroup}>
              <label className={label}>其他照片</label>
              <MultiImageUpload
                currentImages={form.otherPhotos}
                onImagesChange={(urls) => setForm((prev) => ({ ...prev, otherPhotos: urls }))}
                authToken={token || undefined}
                maxImages={8}
                placeholder="新增照片"
                compressionParams={{ maxWidth: 1200, maxHeight: 900, quality: 0.85 }}
              />
            </div>

            <div className={fieldGroup}>
              <label className={label}>備注說明</label>
              <textarea
                className={textarea}
                rows={4}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="場地備注、特殊說明..."
              />
            </div>
          </div>

          <div className={footer}>
            <button type="button" className={cancelBtn} onClick={onClose}>
              取消
            </button>
            <button type="submit" className={saveBtn} disabled={isSaving}>
              {isSaving ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
