'use client';

import { useState, useRef, useEffect } from 'react';
import { css } from '@/styled-system/css';
import { ChevronDownIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import type { CapacityRange, CreateVenueData, UpdateVenueData, VenueDetail } from '@/types';
import ImageUpload from '@/components/images/ImageUpload';
import MultiImageUpload from '@/components/images/MultiImageUpload';
import PlaceAutocomplete from '@/components/forms/PlaceAutocomplete';
import { useAuthToken } from '@/hooks/useAuthToken';
import { showToast } from '@/lib/toast';
import { useCreateVenueMutation } from './hook/useCreateVenueMutation';
import { useUpdateVenueMutation } from './hook/useUpdateVenueMutation';
import { REGIONS } from '@/constants';
import { CAPACITY_RANGE_LABEL } from '@/components/venues/venueCapacity';

const pageContainer = css({
  maxWidth: '640px',
  margin: '0 auto',
  paddingX: '4',
  paddingTop: '25',
  paddingBottom: '16',
});

const backBtn = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1.5',
  marginBottom: '4',
  paddingY: '2',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.secondary',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.2s ease, color 0.2s ease',
  '&:hover': {
    background: 'gray.50',
    color: 'color.text.primary',
  },
  '& svg': {
    width: '14px',
    height: '14px',
  },
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
  '&:focus-visible': {
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

const formDropdownContainer = css({
  position: 'relative',
});

const formDropdownTrigger = css({
  width: '100%',
  paddingY: '2.5',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  textStyle: 'body',
  color: 'color.text.primary',
  background: 'white',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '2',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  '&[data-empty="true"]': {
    color: 'color.text.tertiary',
  },
  '&:hover': {
    borderColor: 'color.primary',
  },
  '&:focus-visible': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 2px var(--colors-stellar-blue-100)',
  },
});

const formDropdownArrow = css({
  width: '14px',
  height: '14px',
  flexShrink: 0,
  transition: 'transform 0.2s ease',
});

const formDropdownArrowOpen = css({
  transform: 'rotate(180deg)',
});

const formDropdownMenu = css({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  maxHeight: '240px',
  overflowY: 'auto',
  background: 'white',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  boxShadow: 'shadow.md',
  zIndex: 20,
});

const formDropdownOption = css({
  textStyle: 'body',
  paddingY: '2.5',
  paddingX: '3',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  transition: 'background 0.15s',
  '&:hover': {
    background: 'gray.50',
  },
});

const formDropdownOptionSelected = css({
  color: 'color.primary',
  fontWeight: 'medium',
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
  '&:focus-visible': {
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

const tagInputRow = css({
  display: 'flex',
  gap: '2',
});

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
  '&:hover': {
    borderColor: 'color.primary',
    background: 'stellarBlue.50',
  },
});

const tagList = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.5',
  marginTop: '2',
});

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
  '&:hover': {
    color: 'red.500',
  },
});

const fieldHint = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  marginTop: '0.5',
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
  transition: 'background 0.2s ease, border-color 0.2s ease',
  '&:hover:not(:disabled)': {
    background: 'stellarBlue.600',
    borderColor: 'stellarBlue.600',
  },
  '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
});

type VenueFormMode = { mode: 'create' } | { mode: 'edit'; venue: VenueDetail };

type Props = VenueFormMode;

type PreferredContact = 'instagram' | 'threads' | 'line' | 'form' | 'other';

type FormState = {
  name: string;
  address: string;
  region: string;
  lat: number | null;
  lng: number | null;
  placeId: string;
  nearestMrt: string;
  mrtWalkMinutes: string;
  capacityRange: CapacityRange | '';
  coverPhoto: string;
  otherPhotos: string[];
  hostTags: string[];
  threads: string;
  instagram: string;
  line: string;
  preferredContact: PreferredContact | '';
  contactUrl: string;
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
      placeId: v.placeId ?? '',
      nearestMrt: v.nearestMrt ?? '',
      mrtWalkMinutes: v.mrtWalkMinutes !== null ? String(v.mrtWalkMinutes) : '',
      capacityRange: v.capacityRange ?? '',
      coverPhoto: v.coverPhoto ?? '',
      otherPhotos: v.otherPhotos ?? [],
      hostTags: v.hostTags ?? [],
      threads: v.socialMedia?.threads ?? '',
      instagram: v.socialMedia?.instagram ?? '',
      line: v.socialMedia?.line ?? '',
      preferredContact: v.preferredContact ?? '',
      contactUrl: v.contactUrl ?? '',
      description: v.description ?? '',
      // pending/rejected venues default to inactive in the form toggle
      status: v.status === 'active' || v.status === 'inactive' ? v.status : 'inactive',
    };
  }
  return {
    name: '',
    address: '',
    region: '',
    lat: null,
    lng: null,
    placeId: '',
    nearestMrt: '',
    mrtWalkMinutes: '',
    capacityRange: '',
    coverPhoto: '',
    otherPhotos: [],
    hostTags: [],
    threads: '',
    instagram: '',
    line: '',
    preferredContact: '',
    contactUrl: '',
    description: '',
    status: 'active',
  };
}

export default function VenueFormClient(props: Props) {
  const { token } = useAuthToken();
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(() => buildInitialForm(props));
  const [hostTagInput, setHostTagInput] = useState('');

  const createMutation = useCreateVenueMutation();
  const updateMutation = useUpdateVenueMutation(props.mode === 'edit' ? props.venue.id : '');

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const [regionOpen, setRegionOpen] = useState(false);
  const [capacityOpen, setCapacityOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const regionDropdownRef = useRef<HTMLDivElement>(null);
  const capacityDropdownRef = useRef<HTMLDivElement>(null);
  const contactDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(e.target as Node))
        setRegionOpen(false);
      if (capacityDropdownRef.current && !capacityDropdownRef.current.contains(e.target as Node))
        setCapacityOpen(false);
      if (contactDropdownRef.current && !contactDropdownRef.current.contains(e.target as Node))
        setContactOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      placeId: place.place_id,
    }));
  };

  const MAX_HOST_TAGS = 5;

  const handleAddHostTag = () => {
    const tag = hostTagInput.trim();
    if (!tag || formState.hostTags.includes(tag) || formState.hostTags.length >= MAX_HOST_TAGS)
      return;
    setFormState((prev) => ({ ...prev, hostTags: [...prev.hostTags, tag] }));
    setHostTagInput('');
  };

  const handleRemoveHostTag = (tag: string) => {
    setFormState((prev) => ({ ...prev, hostTags: prev.hostTags.filter((t) => t !== tag) }));
  };

  const handleHostTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddHostTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.region) {
      showToast.error('請選擇地區');
      return;
    }

    if (props.mode === 'create') {
      const data: CreateVenueData = {
        name: formState.name.trim(),
        address: formState.address.trim(),
        region: formState.region,
      };
      if (formState.lat !== null) data.lat = formState.lat;
      if (formState.lng !== null) data.lng = formState.lng;
      if (formState.placeId) data.placeId = formState.placeId;
      if (formState.nearestMrt) data.nearestMrt = formState.nearestMrt;
      if (formState.mrtWalkMinutes) data.mrtWalkMinutes = parseInt(formState.mrtWalkMinutes, 10);
      if (formState.capacityRange) data.capacityRange = formState.capacityRange;
      if (formState.coverPhoto) data.coverPhoto = formState.coverPhoto;
      if (formState.otherPhotos.length > 0) data.otherPhotos = formState.otherPhotos;
      if (formState.hostTags.length > 0) data.hostTags = formState.hostTags;
      if (formState.description.trim()) data.description = formState.description.trim();
      if (formState.threads || formState.instagram || formState.line) {
        data.socialMedia = {
          threads: formState.threads || undefined,
          instagram: formState.instagram || undefined,
          line: formState.line || undefined,
        };
      }
      if (formState.preferredContact) data.preferredContact = formState.preferredContact;
      if (formState.contactUrl) data.contactUrl = formState.contactUrl;
      createMutation.mutate(data);
    } else {
      const v = props.venue;
      const data: UpdateVenueData = {};

      if (formState.name !== v.name) data.name = formState.name;
      if (formState.address !== v.address) data.address = formState.address;
      if (formState.region !== v.region) data.region = formState.region;
      if (formState.nearestMrt !== (v.nearestMrt ?? '')) data.nearestMrt = formState.nearestMrt;
      if (formState.coverPhoto !== (v.coverPhoto ?? '')) data.coverPhoto = formState.coverPhoto;

      const parsedMinutes =
        formState.mrtWalkMinutes === '' ? null : parseInt(formState.mrtWalkMinutes, 10);
      if (parsedMinutes !== v.mrtWalkMinutes) data.mrtWalkMinutes = parsedMinutes;

      const newCapacityRange = formState.capacityRange || null;
      if (newCapacityRange !== v.capacityRange) data.capacityRange = newCapacityRange;

      const threadsChanged = formState.threads !== (v.socialMedia?.threads ?? '');
      const instagramChanged = formState.instagram !== (v.socialMedia?.instagram ?? '');
      const lineChanged = formState.line !== (v.socialMedia?.line ?? '');
      if (threadsChanged || instagramChanged || lineChanged) {
        data.socialMedia = {
          threads: formState.threads || undefined,
          instagram: formState.instagram || undefined,
          line: formState.line || undefined,
        };
      }

      const photosChanged =
        JSON.stringify(formState.otherPhotos) !== JSON.stringify(v.otherPhotos ?? []);
      if (photosChanged) data.otherPhotos = formState.otherPhotos;

      const hostTagsChanged =
        JSON.stringify(formState.hostTags) !== JSON.stringify(v.hostTags ?? []);
      if (hostTagsChanged) data.hostTags = formState.hostTags;

      if (formState.description !== (v.description ?? '')) data.description = formState.description;

      if (formState.status !== (v.status ?? 'active')) data.status = formState.status;

      const newPreferredContact = formState.preferredContact || undefined;
      if (newPreferredContact !== v.preferredContact) data.preferredContact = newPreferredContact;

      if (formState.contactUrl !== (v.contactUrl ?? '')) data.contactUrl = formState.contactUrl;

      if (Object.keys(data).length === 0) {
        router.push('/admin/venues');
        return;
      }

      updateMutation.mutate(data);
    }
  };

  const set =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));

  const hasLocation = formState.lat !== null && formState.lng !== null;
  const isEdit = props.mode === 'edit';

  return (
    <div className={pageContainer}>
      <button type="button" className={backBtn} onClick={() => router.push('/admin/venues')}>
        <ArrowLeftIcon />
        場地管理
      </button>
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
          <div className={formDropdownContainer} ref={regionDropdownRef}>
            <button
              type="button"
              className={formDropdownTrigger}
              data-empty={!formState.region ? 'true' : undefined}
              onClick={() => {
                setRegionOpen((o) => !o);
                setCapacityOpen(false);
                setContactOpen(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={regionOpen}
            >
              <span>{formState.region || '請選擇'}</span>
              <ChevronDownIcon
                className={`${formDropdownArrow} ${regionOpen ? formDropdownArrowOpen : ''}`}
              />
            </button>
            {regionOpen && (
              <div className={formDropdownMenu} role="listbox">
                {REGIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`${formDropdownOption} ${formState.region === r ? formDropdownOptionSelected : ''}`}
                    onClick={() => {
                      setFormState((prev) => ({ ...prev, region: r }));
                      setRegionOpen(false);
                    }}
                    role="option"
                    aria-selected={formState.region === r}
                  >
                    <span>{r}</span>
                    {formState.region === r && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={divider} />

        {/* Optional fields */}
        <div className={fieldRow}>
          <div className={fieldGroup}>
            <label className={labelStyle}>最近捷運站</label>
            <input
              className={input}
              value={formState.nearestMrt}
              onChange={set('nearestMrt')}
              placeholder="例：忠孝復興"
            />
          </div>
          <div className={fieldGroup}>
            <label className={labelStyle}>步行分鐘數</label>
            <input
              className={input}
              type="number"
              min={0}
              value={formState.mrtWalkMinutes}
              onChange={set('mrtWalkMinutes')}
              placeholder="分鐘"
            />
          </div>
        </div>

        <div className={fieldGroup}>
          <label className={labelStyle}>容納人數區間</label>
          <div className={formDropdownContainer} ref={capacityDropdownRef}>
            <button
              type="button"
              className={formDropdownTrigger}
              data-empty={!formState.capacityRange ? 'true' : undefined}
              onClick={() => {
                setCapacityOpen((o) => !o);
                setRegionOpen(false);
                setContactOpen(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={capacityOpen}
            >
              <span>{CAPACITY_RANGE_LABEL[formState.capacityRange] || '不填寫'}</span>
              <ChevronDownIcon
                className={`${formDropdownArrow} ${capacityOpen ? formDropdownArrowOpen : ''}`}
              />
            </button>
            {capacityOpen && (
              <div className={formDropdownMenu} role="listbox">
                {(['20以下', '20-40', '40-60', '60以上'] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    className={`${formDropdownOption} ${formState.capacityRange === range ? formDropdownOptionSelected : ''}`}
                    onClick={() => {
                      setFormState((prev) => ({ ...prev, capacityRange: range }));
                      setCapacityOpen(false);
                    }}
                    role="option"
                    aria-selected={formState.capacityRange === range}
                  >
                    <span>{CAPACITY_RANGE_LABEL[range]}</span>
                    {formState.capacityRange === range && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
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
          <div className={fieldGroup}>
            <label className={labelSub}>Line</label>
            <input
              className={input}
              value={formState.line}
              onChange={set('line')}
              placeholder="Line ID 或連結"
            />
          </div>
        </div>

        <div className={fieldGroup}>
          <label className={labelStyle}>偏好聯絡方式</label>
          <div className={formDropdownContainer} ref={contactDropdownRef}>
            <button
              type="button"
              className={formDropdownTrigger}
              data-empty={!formState.preferredContact ? 'true' : undefined}
              onClick={() => {
                setContactOpen((o) => !o);
                setRegionOpen(false);
                setCapacityOpen(false);
              }}
              aria-haspopup="listbox"
              aria-expanded={contactOpen}
            >
              <span>
                {formState.preferredContact
                  ? (
                      {
                        instagram: 'IG 私訊',
                        threads: 'Threads 私訊',
                        line: 'Line',
                        form: '表單／連結',
                        other: '其他',
                      } as Record<string, string>
                    )[formState.preferredContact]
                  : '不填寫'}
              </span>
              <ChevronDownIcon
                className={`${formDropdownArrow} ${contactOpen ? formDropdownArrowOpen : ''}`}
              />
            </button>
            {contactOpen && (
              <div className={formDropdownMenu} role="listbox">
                {(
                  [
                    { value: '' as const, label: '不填寫' },
                    { value: 'instagram' as const, label: 'IG 私訊' },
                    { value: 'threads' as const, label: 'Threads 私訊' },
                    { value: 'line' as const, label: 'Line' },
                    { value: 'form' as const, label: '表單／連結' },
                    { value: 'other' as const, label: '其他' },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value || 'empty'}
                    type="button"
                    className={`${formDropdownOption} ${formState.preferredContact === value ? formDropdownOptionSelected : ''}`}
                    onClick={() => {
                      setFormState((prev) => ({ ...prev, preferredContact: value }));
                      setContactOpen(false);
                    }}
                    role="option"
                    aria-selected={formState.preferredContact === value}
                  >
                    <span>{label}</span>
                    {formState.preferredContact === value && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {(formState.preferredContact === 'line' ||
          formState.preferredContact === 'form' ||
          formState.preferredContact === 'other') && (
          <div className={fieldGroup}>
            <label className={labelStyle}>聯絡連結或 ID</label>
            <input
              className={input}
              value={formState.contactUrl}
              onChange={set('contactUrl')}
              placeholder="https://... 或 Line ID"
            />
          </div>
        )}

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
            maxImages={9}
            placeholder="新增照片"
            compressionParams={{ maxWidth: 1200, maxHeight: 900, quality: 0.85 }}
          />
        </div>

        <div className={fieldGroup}>
          <label className={labelStyle}>場地標籤</label>
          <p className={fieldHint}>
            主辦初步篩選用，建議 1–3 個，最多 {MAX_HOST_TAGS} 個（例：免場地費、新手友善）
          </p>
          <div className={tagInputRow}>
            <input
              className={input}
              value={hostTagInput}
              onChange={(e) => setHostTagInput(e.target.value)}
              onKeyDown={handleHostTagKeyDown}
              placeholder="輸入標籤後按 Enter 或點新增"
              disabled={formState.hostTags.length >= MAX_HOST_TAGS}
            />
            <button
              type="button"
              className={tagAddBtn}
              onClick={handleAddHostTag}
              disabled={formState.hostTags.length >= MAX_HOST_TAGS}
            >
              新增
            </button>
          </div>
          {formState.hostTags.length > 0 && (
            <div className={tagList}>
              {formState.hostTags.map((t) => (
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
