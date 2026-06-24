'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import ImageUpload from '@/components/images/ImageUpload';
import MultiImageUpload from '@/components/images/MultiImageUpload';
import PlaceAutocomplete from '@/components/forms/PlaceAutocomplete';
import type { CreateVenueData, UpdateVenueData, CapacityRange } from '@/types';

// ─── CSS ──────────────────────────────────────────────────────────────────────

const formSection = css({ display: 'flex', flexDirection: 'column', gap: '5' });

const fieldGroup = css({ display: 'flex', flexDirection: 'column', gap: '1.5' });

const label = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  display: 'flex',
  alignItems: 'center',
  gap: '1',
});

const labelSub = css({
  textStyle: 'caption',
  fontWeight: 'normal',
  color: 'color.text.secondary',
});

const requiredMark = css({ color: 'red.500' });

const inputStyle = css({
  width: '100%',
  paddingY: '2.5',
  paddingX: '3',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  background: 'white',
  color: 'color.text.primary',
  textStyle: 'bodySmall',
  '&::placeholder': { color: 'color.text.disabled' },
  '&:focus-visible': { outline: 'none', borderColor: 'color.primary' },
  '&[aria-invalid="true"]': { borderColor: 'red.400' },
  '&:disabled': { background: 'gray.50', color: 'color.text.secondary', cursor: 'not-allowed' },
});

const numberInputStyle = css({
  width: '100%',
  paddingY: '2.5',
  paddingX: '3',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  background: 'white',
  color: 'color.text.primary',
  textStyle: 'bodySmall',
  '&::placeholder': { color: 'color.text.disabled' },
  '&:focus-visible': { outline: 'none', borderColor: 'color.primary' },
});

const textareaStyle = css({
  width: '100%',
  minHeight: '100px',
  paddingY: '2.5',
  paddingX: '3',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  background: 'white',
  color: 'color.text.primary',
  textStyle: 'bodySmall',
  resize: 'vertical',
  '&::placeholder': { color: 'color.text.disabled' },
  '&:focus-visible': { outline: 'none', borderColor: 'color.primary' },
});

const fieldError = css({ textStyle: 'caption', color: 'red.500', marginTop: '0.5' });
const fieldHint = css({ textStyle: 'caption', color: 'color.text.secondary' });
const fieldRow = css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3' });

const dropdownContainer = css({ position: 'relative' });

const dropdownTrigger = css({
  width: '100%',
  paddingY: '2.5',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.primary',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  textStyle: 'bodySmall',
  '&[data-empty="true"]': { color: 'color.text.tertiary' },
  '&:hover': { borderColor: 'color.border.medium' },
  '&[aria-invalid="true"]': { borderColor: 'red.400' },
});

const dropdownMenu = css({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  background: 'white',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  boxShadow: 'shadow.md',
  zIndex: 20,
  overflow: 'hidden',
  maxHeight: '240px',
  overflowY: 'auto',
});

const dropdownOption = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    paddingX: '3',
    paddingY: '2.5',
    textStyle: 'bodySmall',
    color: 'color.text.primary',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    '&:hover': { background: 'color.background.secondary' },
  },
  variants: {
    selected: { true: { color: 'color.primary', fontWeight: 'semibold' } },
  },
});

const tagInputRow = css({ display: 'flex', gap: '2' });

const tagAddBtn = css({
  paddingY: '2.5',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.primary',
  textStyle: 'bodySmall',
  fontWeight: 'medium',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'border-color 0.2s ease, background 0.2s ease',
  '&:hover:not(:disabled)': { borderColor: 'color.primary', background: 'stellarBlue.50' },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
});

const tagList = css({ display: 'flex', flexWrap: 'wrap', gap: '1.5', marginTop: '1' });

const tagPill = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  paddingY: '1',
  paddingX: '2.5',
  borderRadius: '999px',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  textStyle: 'caption',
  color: 'color.text.primary',
  fontWeight: 'medium',
});

const tagRemoveBtn = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '14px',
  height: '14px',
  borderRadius: '999px',
  border: 'none',
  background: 'none',
  color: 'color.text.secondary',
  cursor: 'pointer',
  padding: '0',
  flexShrink: 0,
  '&:hover': { color: 'red.500' },
});

const submitRow = css({ display: 'flex', gap: '3', marginTop: '2' });

const submitBtn = css({
  flex: 1,
  paddingY: '3',
  paddingX: '4',
  borderRadius: 'radius.md',
  background: 'stellarBlue.600',
  color: 'white',
  border: 'none',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '2',
  transition: 'background 0.15s ease',
  '&:hover:not(:disabled)': { background: 'stellarBlue.700' },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
});

const cancelBtn = css({
  paddingY: '3',
  paddingX: '4',
  borderRadius: 'radius.md',
  background: 'white',
  color: 'color.text.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.15s ease',
  '&:hover': { background: 'color.background.secondary' },
});

const formErrorBanner = css({
  paddingX: '4',
  paddingY: '3',
  borderRadius: 'radius.md',
  background: 'red.50',
  border: '1px solid',
  borderColor: 'red.200',
  textStyle: 'bodySmall',
  color: 'red.700',
});

const spinner = css({
  width: '14px',
  height: '14px',
  border: '2px solid transparent',
  borderTopColor: 'white',
  borderRadius: 'radius.circle',
  animation: 'spin 1s linear infinite',
  flexShrink: 0,
});

const divider = css({
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  marginY: '2',
});

const dangerZone = css({ paddingTop: '4', display: 'flex', flexDirection: 'column', gap: '3' });
const dangerTitle = css({ textStyle: 'bodySmall', fontWeight: 'semibold', color: 'red.700' });
const dangerDescription = css({ textStyle: 'caption', color: 'color.text.secondary' });

const deleteBtn = css({
  paddingY: '2.5',
  paddingX: '4',
  borderRadius: 'radius.md',
  background: 'white',
  color: 'red.600',
  border: '1px solid',
  borderColor: 'red.300',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  cursor: 'pointer',
  alignSelf: 'flex-start',
  transition: 'background 0.15s ease',
  '&:hover': { background: 'red.50', borderColor: 'red.500' },
});

const statusToggleRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  flexWrap: 'wrap',
});

const statusToggleBtn = cva({
  base: {
    paddingY: '2',
    paddingX: '4',
    borderRadius: 'radius.md',
    border: '1px solid',
    textStyle: 'caption',
    fontWeight: 'semibold',
    cursor: 'pointer',
    transition: 'background 0.15s ease, border-color 0.15s ease',
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
  },
  variants: {
    variant: {
      online: {
        background: 'transparent',
        borderColor: 'green.300',
        color: 'green.700',
        '&:hover:not(:disabled)': { background: 'green.50', borderColor: 'green.500' },
      },
      offline: {
        background: 'transparent',
        borderColor: 'color.border.light',
        color: 'color.text.secondary',
        '&:hover:not(:disabled)': { background: 'color.background.secondary' },
      },
    },
  },
});

const statusBadge = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    paddingX: '2',
    paddingY: '0.5',
    borderRadius: 'radius.sm',
    textStyle: 'caption',
    fontWeight: 'semibold',
    whiteSpace: 'nowrap',
  },
  variants: {
    status: {
      pending: { background: 'amber.50', color: 'amber.600' },
      active: { background: 'green.50', color: 'green.700' },
      inactive: { background: 'gray.100', color: 'gray.500' },
      rejected: { background: 'red.50', color: 'red.700' },
    },
  },
});

// ─── Constants ────────────────────────────────────────────────────────────────

const REGION_OPTIONS = [
  '台北',
  '新北',
  '基隆',
  '桃園',
  '新竹',
  '苗栗',
  '台中',
  '彰化',
  '南投',
  '雲林',
  '嘉義',
  '台南',
  '高雄',
  '屏東',
  '宜蘭',
  '花蓮',
  '台東',
  '澎湖',
  '金門',
  '連江',
  '其他',
];
const CAPACITY_OPTIONS: CapacityRange[] = ['20以下', '20-40', '40-60', '60以上'];
const MAX_HOST_TAGS = 5;

type PreferredContact = 'instagram' | 'threads' | 'line' | 'form' | 'other';

const PREFERRED_CONTACT_OPTIONS: { value: PreferredContact | ''; label: string }[] = [
  { value: '', label: '不填寫' },
  { value: 'instagram', label: 'IG 私訊' },
  { value: 'threads', label: 'Threads 私訊' },
  { value: 'line', label: 'Line' },
  { value: 'form', label: '表單／連結' },
  { value: 'other', label: '其他' },
];

const STATUS_LABEL: Record<string, string> = {
  pending: '審核中',
  active: '上架中',
  inactive: '已下架',
  rejected: '已拒絕',
};

// ─── SelectDropdown ───────────────────────────────────────────────────────────

interface SelectDropdownProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  invalid?: boolean;
}

function SelectDropdown({ value, onChange, options, placeholder, invalid }: SelectDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={dropdownContainer}>
      <button
        type="button"
        className={dropdownTrigger}
        data-empty={!value ? 'true' : undefined}
        aria-invalid={invalid ? 'true' : undefined}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        onBlur={(e) => {
          if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) setOpen(false);
        }}
      >
        <span>{value || placeholder}</span>
        <ChevronDownIcon
          className={css({
            width: '14px',
            height: '14px',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
            ...(open ? { transform: 'rotate(180deg)' } : {}),
          })}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className={dropdownMenu} role="listbox">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={value === opt}
              className={dropdownOption({ selected: value === opt })}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PreferredContactDropdown ─────────────────────────────────────────────────

interface PreferredContactDropdownProps {
  value: PreferredContact | '';
  onChange: (v: PreferredContact | '') => void;
}

function PreferredContactDropdown({ value, onChange }: PreferredContactDropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = PREFERRED_CONTACT_OPTIONS.find((o) => o.value === value)?.label ?? '不填寫';

  return (
    <div className={dropdownContainer}>
      <button
        type="button"
        className={dropdownTrigger}
        data-empty={!value ? 'true' : undefined}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        onBlur={(e) => {
          if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) setOpen(false);
        }}
      >
        <span>{selectedLabel}</span>
        <ChevronDownIcon
          className={css({
            width: '14px',
            height: '14px',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
            ...(open ? { transform: 'rotate(180deg)' } : {}),
          })}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className={dropdownMenu} role="listbox">
          {PREFERRED_CONTACT_OPTIONS.map(({ value: optVal, label }) => (
            <button
              key={optVal || 'empty'}
              type="button"
              role="option"
              aria-selected={value === optVal}
              className={dropdownOption({ selected: value === optVal })}
              onClick={() => {
                onChange(optVal);
                setOpen(false);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VenueFormValues {
  name: string;
  address: string;
  region: string;
  nearestMrt: string;
  mrtWalkMinutes: string;
  capacityRange: string;
  description: string;
  coverPhoto: string;
  otherPhotos: string[];
  hostTags: string[];
  threads: string;
  instagram: string;
  line: string;
  preferredContact: PreferredContact | '';
  contactUrl: string;
}

const EMPTY_VALUES: VenueFormValues = {
  name: '',
  address: '',
  region: '',
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

interface FormErrors {
  name?: string;
  address?: string;
  region?: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface VenueFormBaseProps {
  isSubmitting: boolean;
  submitError: string | null;
  authToken?: string;
}

interface VenueFormCreateProps extends VenueFormBaseProps {
  mode: 'create';
  onSubmit: (data: CreateVenueData) => void;
}

interface VenueFormEditProps extends VenueFormBaseProps {
  mode: 'edit';
  initialValues: VenueFormValues;
  onSubmit: (data: UpdateVenueData) => void;
  status: string;
  onStatusChange: (status: 'active' | 'inactive') => void;
  isStatusChanging: boolean;
  onDeleteClick: () => void;
  canDelete: boolean;
}

export type VenueFormProps = VenueFormCreateProps | VenueFormEditProps;

// ─── Component ────────────────────────────────────────────────────────────────

export default function VenueForm(props: VenueFormProps) {
  const { isSubmitting, submitError, authToken } = props;

  const [form, setForm] = useState<VenueFormValues>(() =>
    props.mode === 'edit' ? props.initialValues : EMPTY_VALUES
  );
  const [coordinates, setCoordinates] = useState<{
    lat: number | null;
    lng: number | null;
    placeId: string;
  }>({ lat: null, lng: null, placeId: '' });
  const [hostTagInput, setHostTagInput] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = '請填寫場地名稱';
    if (!form.address.trim()) next.address = '請填寫地址';
    if (!form.region) next.region = '請選擇地區';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const socialMedia =
      form.threads || form.instagram || form.line
        ? {
            threads: form.threads || undefined,
            instagram: form.instagram || undefined,
            line: form.line || undefined,
          }
        : undefined;

    if (props.mode === 'create') {
      const data: CreateVenueData = {
        name: form.name.trim(),
        address: form.address.trim(),
        region: form.region,
        nearestMrt: form.nearestMrt.trim() || undefined,
        mrtWalkMinutes: form.mrtWalkMinutes ? Number(form.mrtWalkMinutes) : undefined,
        capacityRange: (form.capacityRange as CapacityRange) || undefined,
        description: form.description.trim() || undefined,
      };
      if (form.coverPhoto) data.coverPhoto = form.coverPhoto;
      if (form.otherPhotos.length > 0) data.otherPhotos = form.otherPhotos;
      if (form.hostTags.length > 0) data.hostTags = form.hostTags;
      if (socialMedia) data.socialMedia = socialMedia;
      if (form.preferredContact) data.preferredContact = form.preferredContact;
      if (form.contactUrl) data.contactUrl = form.contactUrl;
      if (coordinates.lat !== null) data.lat = coordinates.lat;
      if (coordinates.lng !== null) data.lng = coordinates.lng;
      if (coordinates.placeId) data.placeId = coordinates.placeId;
      props.onSubmit(data);
    } else {
      props.onSubmit({
        name: form.name.trim(),
        address: form.address.trim(),
        region: form.region,
        nearestMrt: form.nearestMrt.trim() || undefined,
        mrtWalkMinutes: form.mrtWalkMinutes ? Number(form.mrtWalkMinutes) : null,
        capacityRange: (form.capacityRange as CapacityRange) || null,
        description: form.description.trim() || undefined,
        coverPhoto: form.coverPhoto || undefined,
        otherPhotos: form.otherPhotos,
        hostTags: form.hostTags,
        preferredContact: (form.preferredContact as PreferredContact) || undefined,
        contactUrl: form.contactUrl || undefined,
        socialMedia,
      });
    }
  }

  function handlePlaceSelect(place: {
    place_id: string;
    address: string;
    coordinates: { lat: number; lng: number };
    name: string;
    city: string;
  }) {
    setCoordinates({
      lat: place.coordinates.lat,
      lng: place.coordinates.lng,
      placeId: place.place_id,
    });
    setForm((prev) => ({
      ...prev,
      address: place.address,
      name: prev.name || place.name,
    }));
  }

  function setField(key: keyof VenueFormValues, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function handleAddHostTag() {
    const tag = hostTagInput.trim();
    if (!tag || form.hostTags.includes(tag) || form.hostTags.length >= MAX_HOST_TAGS) return;
    setForm((prev) => ({ ...prev, hostTags: [...prev.hostTags, tag] }));
    setHostTagInput('');
  }

  function handleRemoveHostTag(tag: string) {
    setForm((prev) => ({ ...prev, hostTags: prev.hostTags.filter((t) => t !== tag) }));
  }

  function handleHostTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddHostTag();
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={formSection}>
        {/* place autocomplete (create only) */}
        {props.mode === 'create' && (
          <>
            <div className={fieldGroup}>
              <span className={label}>搜尋地點</span>
              <span className={labelSub}>自動填入地址與名稱</span>
              <PlaceAutocomplete
                onPlaceSelect={handlePlaceSelect}
                placeholder="輸入地點名稱或地址..."
              />
              {coordinates.lat !== null && <p className={fieldHint}>✓ 已取得座標</p>}
            </div>
            <div className={divider} />
          </>
        )}

        {/* name */}
        <div className={fieldGroup}>
          <label htmlFor="venue-name" className={label}>
            場地名稱 <span className={requiredMark}>*</span>
          </label>
          <input
            id="venue-name"
            type="text"
            className={inputStyle}
            placeholder="例：星光咖啡"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'venue-name-error' : undefined}
          />
          {errors.name && (
            <span id="venue-name-error" className={fieldError} role="alert">
              {errors.name}
            </span>
          )}
        </div>

        {/* address */}
        <div className={fieldGroup}>
          <label htmlFor="venue-address" className={label}>
            地址 <span className={requiredMark}>*</span>
          </label>
          <input
            id="venue-address"
            type="text"
            className={inputStyle}
            placeholder="例：台北市中山區中山北路一段"
            value={form.address}
            onChange={(e) => setField('address', e.target.value)}
            aria-invalid={errors.address ? 'true' : undefined}
            aria-describedby={errors.address ? 'venue-address-error' : undefined}
          />
          {errors.address && (
            <span id="venue-address-error" className={fieldError} role="alert">
              {errors.address}
            </span>
          )}
        </div>

        {/* region */}
        <div className={fieldGroup}>
          <span className={label}>
            地區 <span className={requiredMark}>*</span>
          </span>
          <SelectDropdown
            value={form.region}
            onChange={(v) => setField('region', v)}
            options={REGION_OPTIONS}
            placeholder="請選擇地區"
            invalid={!!errors.region}
          />
          {errors.region && (
            <span className={fieldError} role="alert">
              {errors.region}
            </span>
          )}
        </div>

        {/* nearestMrt */}
        <div className={fieldGroup}>
          <label htmlFor="venue-mrt" className={label}>
            最近捷運站
          </label>
          <input
            id="venue-mrt"
            type="text"
            className={inputStyle}
            placeholder="例：中山站"
            value={form.nearestMrt}
            onChange={(e) => setField('nearestMrt', e.target.value)}
          />
        </div>

        {/* mrtWalkMinutes */}
        <div className={fieldGroup}>
          <label htmlFor="venue-mrt-walk" className={label}>
            步行分鐘數
          </label>
          <input
            id="venue-mrt-walk"
            type="number"
            min={0}
            max={60}
            className={numberInputStyle}
            placeholder="例：5"
            value={form.mrtWalkMinutes}
            onChange={(e) => setField('mrtWalkMinutes', e.target.value)}
          />
        </div>

        {/* capacityRange */}
        <div className={fieldGroup}>
          <span className={label}>容納人數</span>
          <SelectDropdown
            value={form.capacityRange}
            onChange={(v) => setField('capacityRange', v)}
            options={CAPACITY_OPTIONS}
            placeholder="請選擇容納人數範圍"
          />
        </div>

        {/* socialMedia */}
        <div className={fieldGroup}>
          <span className={label}>社群帳號</span>
          <div className={fieldRow}>
            <div className={fieldGroup}>
              <label htmlFor="venue-threads" className={labelSub}>
                Threads
              </label>
              <input
                id="venue-threads"
                type="text"
                className={inputStyle}
                placeholder="@username"
                value={form.threads}
                onChange={(e) => setField('threads', e.target.value)}
              />
            </div>
            <div className={fieldGroup}>
              <label htmlFor="venue-instagram" className={labelSub}>
                Instagram
              </label>
              <input
                id="venue-instagram"
                type="text"
                className={inputStyle}
                placeholder="@username"
                value={form.instagram}
                onChange={(e) => setField('instagram', e.target.value)}
              />
            </div>
          </div>
          <div className={fieldGroup}>
            <label htmlFor="venue-line" className={labelSub}>
              Line
            </label>
            <input
              id="venue-line"
              type="text"
              className={inputStyle}
              placeholder="Line ID 或連結"
              value={form.line}
              onChange={(e) => setField('line', e.target.value)}
            />
          </div>
        </div>

        {/* preferredContact */}
        <div className={fieldGroup}>
          <span className={label}>偏好聯絡方式</span>
          <PreferredContactDropdown
            value={form.preferredContact}
            onChange={(v) => setForm((prev) => ({ ...prev, preferredContact: v }))}
          />
        </div>

        {/* contactUrl — shown for line / form / other */}
        {(form.preferredContact === 'line' ||
          form.preferredContact === 'form' ||
          form.preferredContact === 'other') && (
          <div className={fieldGroup}>
            <label htmlFor="venue-contact-url" className={label}>
              預約表單連結
            </label>
            <input
              id="venue-contact-url"
              type="text"
              className={inputStyle}
              placeholder="https://... 或 Line ID"
              value={form.contactUrl}
              onChange={(e) => setField('contactUrl', e.target.value)}
            />
          </div>
        )}

        {/* coverPhoto */}
        <div className={fieldGroup}>
          <span className={label}>封面圖片</span>
          <ImageUpload
            currentImageUrl={form.coverPhoto || undefined}
            onUploadComplete={(url) => setForm((prev) => ({ ...prev, coverPhoto: url }))}
            onImageRemove={() => setForm((prev) => ({ ...prev, coverPhoto: '' }))}
            authToken={authToken}
            placeholder="點擊上傳封面圖片"
            compressionParams={{ maxWidth: 1200, maxHeight: 800, quality: 0.85 }}
          />
        </div>

        {/* otherPhotos */}
        <div className={fieldGroup}>
          <span className={label}>其他照片</span>
          <MultiImageUpload
            currentImages={form.otherPhotos}
            onImagesChange={(urls) => setForm((prev) => ({ ...prev, otherPhotos: urls }))}
            authToken={authToken}
            maxImages={9}
            placeholder="新增照片"
            compressionParams={{ maxWidth: 1200, maxHeight: 900, quality: 0.85 }}
          />
        </div>

        {/* hostTags */}
        <div className={fieldGroup}>
          <span className={label}>場地標籤</span>
          <p className={fieldHint}>
            主辦初步篩選用，建議 1–3 個，最多 {MAX_HOST_TAGS} 個（例：免場地費、新手友善）
          </p>
          <div className={tagInputRow}>
            <input
              type="text"
              className={inputStyle}
              value={hostTagInput}
              onChange={(e) => setHostTagInput(e.target.value)}
              onKeyDown={handleHostTagKeyDown}
              placeholder="輸入標籤後按 Enter 或點新增"
              disabled={form.hostTags.length >= MAX_HOST_TAGS}
            />
            <button
              type="button"
              className={tagAddBtn}
              onClick={handleAddHostTag}
              disabled={form.hostTags.length >= MAX_HOST_TAGS}
            >
              新增
            </button>
          </div>
          {form.hostTags.length > 0 && (
            <div className={tagList}>
              {form.hostTags.map((t) => (
                <span key={t} className={tagPill}>
                  {t}
                  <button
                    type="button"
                    className={tagRemoveBtn}
                    aria-label={`移除標籤 ${t}`}
                    onClick={() => handleRemoveHostTag(t)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* description */}
        <div className={fieldGroup}>
          <label htmlFor="venue-description" className={label}>
            場地描述
          </label>
          <textarea
            id="venue-description"
            className={textareaStyle}
            placeholder="場地說明、特色、注意事項…"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
          />
        </div>

        {/* status toggle (edit only) */}
        {props.mode === 'edit' && (
          <div className={fieldGroup}>
            <span className={label}>上下架狀態</span>
            <div className={statusToggleRow}>
              <span
                className={statusBadge({
                  status: props.status as 'pending' | 'active' | 'inactive' | 'rejected',
                })}
              >
                {STATUS_LABEL[props.status] ?? props.status}
              </span>
              {props.status === 'active' && (
                <button
                  type="button"
                  className={statusToggleBtn({ variant: 'offline' })}
                  onClick={() => props.onStatusChange('inactive')}
                  disabled={props.isStatusChanging}
                >
                  下架
                </button>
              )}
              {props.status === 'inactive' && (
                <button
                  type="button"
                  className={statusToggleBtn({ variant: 'online' })}
                  onClick={() => props.onStatusChange('active')}
                  disabled={props.isStatusChanging}
                >
                  上架
                </button>
              )}
            </div>
          </div>
        )}

        {submitError && (
          <div className={formErrorBanner} role="alert">
            {submitError}
          </div>
        )}

        <div className={submitRow}>
          <Link href="/admin-new/venues" className={cancelBtn}>
            取消
          </Link>
          <button type="submit" className={submitBtn} disabled={isSubmitting}>
            {isSubmitting && <div className={spinner} aria-hidden="true" />}
            {props.mode === 'create' ? '新增場地' : '儲存變更'}
          </button>
        </div>

        {/* Danger zone (edit only) */}
        {props.mode === 'edit' && props.canDelete && (
          <>
            <div className={divider} />
            <div className={dangerZone}>
              <span className={dangerTitle}>危險操作</span>
              <p className={dangerDescription}>
                場地已下架且無關聯活動，可永久刪除。此操作無法復原。
              </p>
              <button type="button" className={deleteBtn} onClick={props.onDeleteClick}>
                永久刪除場地
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
}
