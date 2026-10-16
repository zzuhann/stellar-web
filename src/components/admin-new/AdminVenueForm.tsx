'use client';

import { lazy, Suspense, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { css, cva, cx } from '@/styled-system/css';
import ImageUpload from '@/components/images/ImageUpload';
import MultiImageUpload from '@/components/images/MultiImageUpload';
import PlaceAutocomplete from '@/components/forms/PlaceAutocomplete';
import type { CreateVenueData, UpdateVenueData, CapacityRange } from '@/types';
import type { UploadResponse } from '@/lib/r2-upload';
import type { placesApi } from '@/lib/api';
import { scrollToFirstErrorField } from '@/utils/formHelpers';
import { REGIONS } from '@/constants';
import { dateToTaipeiDateString, getHttpUrlError } from '@/utils';
import { CAPACITY_RANGE_LABEL } from '@/components/venues/venueCapacity';
import AdminVenueTagSection from './AdminVenueTagSection';
import AdminVenuePreview from './AdminVenuePreview';
import { useVenueTagDictionary } from './hooks/useVenueTagDictionary';
import {
  EMPTY_TAG_FIELDS,
  buildAdminVenuePreview,
  buildTagFieldsCreate,
  buildTagFieldsPatch,
  getTagFieldErrors,
  hasTagFieldErrors,
  toTagFormState,
  type TagFieldErrors,
  type TagFieldsSource,
  type TagFormState,
} from './adminVenueTagFields';

// Edit-only block; lazy so create mode (incl. public /submit-venue) never loads it
const VenueReselectPlace = lazy(() => import('./VenueReselectPlace'));

// ─── CSS ──────────────────────────────────────────────────────────────────────

// Preview column only exists from lg up; below that the form is a single column
const layout = css({
  lg: { display: 'flex', alignItems: 'flex-start', gap: '8' },
});

const mainCol = css({ lg: { flex: '1 1 0', minWidth: 0 } });

const previewCol = css({
  display: 'none',
  lg: {
    display: 'block',
    width: '360px',
    flexShrink: 0,
    position: 'sticky',
    // Clears the 70px fixed site header
    top: 'calc(70px + token(spacing.6))',
  },
});

const saveFailedDetail = css({ display: 'block', marginTop: '1', textStyle: 'caption' });

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
  minHeight: '300px',
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

const REGION_OPTIONS = [...REGIONS, '其他'];
const CAPACITY_OPTIONS: CapacityRange[] = ['20以下', '20-40', '40-60', '60以上'];
const MAX_HOST_TAGS = 5;

// 'form' / 'other' only exist on old venues; they are loaded but no longer selectable
type PreferredContact = 'instagram' | 'threads' | 'line' | 'form' | 'other';
type SelectableContact = 'instagram' | 'threads' | 'line';

const PREFERRED_CONTACT_OPTIONS: { value: SelectableContact; label: string }[] = [
  { value: 'instagram', label: 'IG 私訊' },
  { value: 'threads', label: 'Threads 私訊' },
  { value: 'line', label: 'LINE' },
];

// Field that must hold data for each channel; the error shows under that field
const CHANNEL_REQUIREMENT: Record<
  SelectableContact,
  { field: 'instagram' | 'threads' | 'contactUrl'; message: string }
> = {
  instagram: { field: 'instagram', message: '請填寫 Instagram 帳號' },
  threads: { field: 'threads', message: '請填寫 Threads 帳號' },
  line: { field: 'contactUrl', message: '請填寫 LINE 連結' },
};

const CONTACT_FIELDS = ['preferredContact', 'contactUrl', 'instagram', 'threads'] as const;
type ContactField = (typeof CONTACT_FIELDS)[number];

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
  labels?: Record<string, string>;
}

function SelectDropdown({
  value,
  onChange,
  options,
  placeholder,
  invalid,
  labels,
}: SelectDropdownProps) {
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
        <span>{value ? (labels?.[value] ?? value) : placeholder}</span>
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
              {labels?.[opt] ?? opt}
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
  onChange: (v: SelectableContact) => void;
}

function PreferredContactDropdown({ value, onChange }: PreferredContactDropdownProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel = PREFERRED_CONTACT_OPTIONS.find((o) => o.value === value)?.label ?? '請選擇';

  return (
    <div className={dropdownContainer}>
      <button
        type="button"
        className={dropdownTrigger}
        data-empty={!isSelectableContact(value) ? 'true' : undefined}
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
              key={optVal}
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

export interface AdminVenueFormValues {
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
  bookingFormUrl: string;
}

const EMPTY_VALUES: AdminVenueFormValues = {
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
  preferredContact: 'instagram',
  contactUrl: '',
  bookingFormUrl: '',
};

interface FormErrors {
  name?: string;
  address?: string;
  region?: string;
  preferredContact?: string;
  capacityRange?: string;
  socialMedia?: string;
  instagram?: string;
  threads?: string;
  coverPhoto?: string;
  contactUrl?: string;
  bookingFormUrl?: string;
}

type ContactErrors = Pick<FormErrors, 'instagram' | 'threads' | 'contactUrl'>;

// Top-to-bottom order on screen; socialMedia is folded into instagram (same row)
const ERROR_FIELD_ORDER = [
  'name',
  'address',
  'region',
  'capacityRange',
  'threads',
  'instagram',
  'preferredContact',
  'contactUrl',
  'bookingFormUrl',
  'coverPhoto',
  'tags',
  'sourceLinks',
  'calendarUrl',
];

const NO_TAG_ERRORS: TagFieldErrors = { sourceLinks: {}, until: {} };

const SAVE_FAILED_MESSAGE = '儲存失敗，勾選都還在。請再按一次；一直失敗請看 Sentry。';

function isSelectableContact(value: string): value is SelectableContact {
  return PREFERRED_CONTACT_OPTIONS.some((o) => o.value === value);
}

function getContactErrors(values: AdminVenueFormValues, checkChannel: boolean): ContactErrors {
  const next: ContactErrors = {};
  // LINE link is hidden for other channels, so it is neither validated nor submitted
  if (values.preferredContact === 'line') {
    const urlError = getHttpUrlError(values.contactUrl.trim());
    if (urlError) next.contactUrl = urlError;
  }
  if (checkChannel && isSelectableContact(values.preferredContact)) {
    const { field, message } = CHANNEL_REQUIREMENT[values.preferredContact];
    if (!values[field].trim() && !next[field]) next[field] = message;
  }
  return next;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdminVenueFormBaseProps {
  isSubmitting: boolean;
  submitError: string | null;
  authToken?: string;
  cancelHref?: string;
  submitLabel?: string;
  placeApi?: typeof placesApi;
  uploadImage?: (file: File) => Promise<UploadResponse>;
  onImageUploadError?: (error: Error, file: File, category: 'cover' | 'other') => void;
}

interface AdminVenueFormCreateProps extends AdminVenueFormBaseProps {
  mode: 'create';
  onSubmit: (data: CreateVenueData) => void;
}

interface AdminVenueFormEditProps extends AdminVenueFormBaseProps {
  mode: 'edit';
  initialValues: AdminVenueFormValues;
  onSubmit: (data: UpdateVenueData) => void;
  status: string;
  onStatusChange: (status: 'active' | 'inactive') => void;
  isStatusChanging: boolean;
  // Kept apart from submitError so a failed status toggle never reads as a failed save
  statusError?: string | null;
  onDeleteClick: () => void;
  canDelete: boolean;
  // Saved venue-tags fields from the admin detail; PATCH only sends the ones that change
  initialTagFields?: TagFieldsSource;
  // Saved place data; omit to hide the "reselect place" block
  place?: {
    venueId: string;
    placeId: string;
    address: string;
    lat?: number | null;
    lng?: number | null;
  };
}

export type AdminVenueFormProps = AdminVenueFormCreateProps | AdminVenueFormEditProps;

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminVenueForm(props: AdminVenueFormProps) {
  const {
    isSubmitting,
    submitError,
    authToken,
    cancelHref = '/admin-new/venues',
    submitLabel,
    placeApi,
    uploadImage,
    onImageUploadError,
  } = props;

  const [form, setForm] = useState<AdminVenueFormValues>(() =>
    props.mode === 'edit' ? props.initialValues : EMPTY_VALUES
  );
  const [coordinates, setCoordinates] = useState<{
    lat: number | null;
    lng: number | null;
    placeId: string;
  }>({ lat: null, lng: null, placeId: '' });
  const [hostTagInput, setHostTagInput] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [today] = useState(() => dateToTaipeiDateString(new Date()));
  // Frozen load-time snapshot that the PATCH diff compares against
  const [initialTagForm] = useState<TagFormState>(() =>
    props.mode === 'edit'
      ? toTagFormState(props.initialTagFields ?? EMPTY_TAG_FIELDS)
      : { ...toTagFormState(EMPTY_TAG_FIELDS), infoUpdatedOn: today }
  );
  const [tagForm, setTagForm] = useState<TagFormState>(initialTagForm);
  const formRef = useRef<HTMLFormElement>(null);

  // Edit mode validates only changed URL fields; create mode validates everything
  const tagBaseline = props.mode === 'edit' ? initialTagForm : undefined;

  const dictionaryQuery = useVenueTagDictionary();
  // Tag fields are only editable and sent once the dictionary is in hand
  const dictionary = dictionaryQuery.data;
  const tagStatus = dictionary ? 'success' : dictionaryQuery.isError ? 'error' : 'pending';
  const tagErrors =
    submitAttempted && dictionary
      ? getTagFieldErrors(tagForm, dictionary, tagBaseline)
      : NO_TAG_ERRORS;
  const preview = dictionary ? buildAdminVenuePreview(tagForm, dictionary, today) : null;

  const showContactUrl = form.preferredContact === 'line';

  // Edit mode only checks the channel once a contact field changes, so old data can still save
  function shouldCheckChannel(values: AdminVenueFormValues): boolean {
    if (props.mode === 'create') return true;
    const initial = props.initialValues;
    return CONTACT_FIELDS.some((key) => values[key] !== initial[key]);
  }

  function contactErrorsFor(values: AdminVenueFormValues): ContactErrors {
    const errs = getContactErrors(values, shouldCheckChannel(values));
    // Create mode already says "fill IG or Threads"; don't repeat it on the field
    if (props.mode === 'create' && !values.instagram.trim() && !values.threads.trim()) {
      delete errs.instagram;
      delete errs.threads;
    }
    return errs;
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = '請填寫場地名稱';
    if (!form.address.trim()) next.address = '請填寫地址';
    if (!form.region) next.region = '請選擇地區';
    if (props.mode === 'create' && !form.preferredContact) {
      next.preferredContact = '請選擇偏好的聯絡方式';
    }
    if (props.mode === 'create' && !form.capacityRange) {
      next.capacityRange = '請選擇容納人數';
    }
    if (props.mode === 'create' && !form.instagram.trim() && !form.threads.trim()) {
      next.socialMedia = '請填寫至少一個社群帳號';
    }
    if (props.mode === 'create' && !form.coverPhoto) {
      next.coverPhoto = '請上傳封面圖片';
    }
    Object.assign(next, contactErrorsFor(form));
    const bookingFormUrlError = getHttpUrlError(form.bookingFormUrl.trim());
    if (bookingFormUrlError) next.bookingFormUrl = bookingFormUrlError;
    setErrors(next);
    return next;
  }

  // First element in DOM order whose marker attribute names a key with an error
  function firstMarked(attribute: string, errorsByKey: Record<string, string>) {
    const nodes = formRef.current?.querySelectorAll<HTMLElement>(`[${attribute}]`) ?? [];
    return Array.from(nodes).find((node) => (node.getAttribute(attribute) ?? '') in errorsByKey);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    const nextErrors = validate();
    const nextTagErrors = dictionary
      ? getTagFieldErrors(tagForm, dictionary, tagBaseline)
      : NO_TAG_ERRORS;
    if (Object.keys(nextErrors).length > 0 || hasTagFieldErrors(nextTagErrors)) {
      const tagFieldHasError: Record<string, boolean> = {
        tags: Object.keys(nextTagErrors.until).length > 0,
        sourceLinks: Object.keys(nextTagErrors.sourceLinks).length > 0,
        calendarUrl: !!nextTagErrors.calendarUrl,
      };
      scrollToFirstErrorField(
        ERROR_FIELD_ORDER,
        // "At least one social account" sits under the IG/Threads row; land on IG (the default channel)
        (field) =>
          field in tagFieldHasError
            ? tagFieldHasError[field]
            : field === 'instagram'
              ? !!(nextErrors.instagram || nextErrors.socialMedia)
              : !!nextErrors[field as keyof FormErrors],
        {
          ...Object.fromEntries(
            ERROR_FIELD_ORDER.map((field) => [
              field,
              formRef.current?.querySelector<HTMLElement>(`[data-field="${field}"]`),
            ])
          ),
          // Land on the exact failing control, not the first checkbox of the tag area
          tags: firstMarked('data-until-field', nextTagErrors.until),
          sourceLinks: firstMarked('data-link-row', nextTagErrors.sourceLinks),
        }
      );
      return;
    }

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
      if (showContactUrl && form.contactUrl.trim()) data.contactUrl = form.contactUrl.trim();
      if (form.bookingFormUrl.trim()) data.bookingFormUrl = form.bookingFormUrl.trim();
      if (coordinates.lat !== null) data.lat = coordinates.lat;
      if (coordinates.lng !== null) data.lng = coordinates.lng;
      if (coordinates.placeId) data.placeId = coordinates.placeId;
      if (dictionary) Object.assign(data, buildTagFieldsCreate(tagForm, dictionary));
      props.onSubmit(data);
    } else {
      const data: UpdateVenueData = {
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
        socialMedia,
        // Always sent so the field can be cleared; null clears it on the backend
        bookingFormUrl: form.bookingFormUrl.trim() || null,
      };
      // Old form/other stays untouched (incl. its contactUrl) until the admin picks a new channel
      if (isSelectableContact(form.preferredContact)) {
        data.preferredContact = form.preferredContact;
      }
      if (showContactUrl && form.contactUrl.trim()) data.contactUrl = form.contactUrl.trim();
      if (dictionary) Object.assign(data, buildTagFieldsPatch(initialTagForm, tagForm, dictionary));
      props.onSubmit(data);
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

  function setField(key: keyof AdminVenueFormValues, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function setContactField(key: ContactField, value: string) {
    const next = { ...form, [key]: value };
    setForm(next);
    setErrors((prev) => {
      const cleared: FormErrors = {
        ...prev,
        instagram: undefined,
        threads: undefined,
        contactUrl: undefined,
        ...(key === 'preferredContact' && { preferredContact: undefined }),
        ...((key === 'instagram' || key === 'threads') && { socialMedia: undefined }),
      };
      // Switching channel after a failed submit moves the requirement error; typing just clears it
      return submitAttempted && key === 'preferredContact'
        ? { ...cleared, ...contactErrorsFor(next) }
        : cleared;
    });
  }

  function handleAddHostTag() {
    const tag = hostTagInput.trim();
    setHostTagInput('');
    if (!tag || form.hostTags.includes(tag) || form.hostTags.length >= MAX_HOST_TAGS) return;
    setForm((prev) => ({ ...prev, hostTags: [...prev.hostTags, tag] }));
  }

  function handleRemoveHostTag(tag: string) {
    setForm((prev) => ({ ...prev, hostTags: prev.hostTags.filter((t) => t !== tag) }));
  }

  function handleHostTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleAddHostTag();
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      <div className={layout}>
        <div className={cx(formSection, mainCol)}>
          {submitError && (
            <div className={formErrorBanner} role="alert">
              {SAVE_FAILED_MESSAGE}
              <span className={saveFailedDetail}>{submitError}</span>
            </div>
          )}

          {/* place autocomplete (create only) */}
          {props.mode === 'create' && (
            <>
              <div className={fieldGroup}>
                <span className={label}>搜尋地點</span>
                <span className={labelSub}>自動填入地址與名稱</span>
                <PlaceAutocomplete
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="輸入地點名稱或地址..."
                  api={placeApi}
                />
                {coordinates.lat !== null && <p className={fieldHint}>✓ 已取得座標</p>}
              </div>
              <div className={divider} />
            </>
          )}

          {/* place reselect (edit only) */}
          {props.mode === 'edit' && props.place && (
            <>
              <Suspense fallback={null}>
                <VenueReselectPlace
                  venueId={props.place.venueId}
                  venueName={props.initialValues.name}
                  place={props.place}
                  formAddress={form.address}
                  onAddressSync={(address) => setForm((prev) => ({ ...prev, address }))}
                  placeApi={placeApi}
                />
              </Suspense>
              <div className={divider} />
            </>
          )}

          {/* name */}
          <div data-field="name" className={fieldGroup}>
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
          <div data-field="address" className={fieldGroup}>
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
          <div data-field="region" className={fieldGroup}>
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
          <div data-field="capacityRange" className={fieldGroup}>
            <span className={label}>
              容納人數
              {props.mode === 'create' && <span className={requiredMark}>*</span>}
            </span>
            <SelectDropdown
              value={form.capacityRange}
              onChange={(v) => setField('capacityRange', v)}
              options={CAPACITY_OPTIONS}
              placeholder="請選擇容納人數範圍"
              labels={CAPACITY_RANGE_LABEL}
              invalid={!!errors.capacityRange}
            />
            {errors.capacityRange && (
              <span className={fieldError} role="alert">
                {errors.capacityRange}
              </span>
            )}
          </div>

          {/* socialMedia */}
          <div className={fieldGroup}>
            <span className={label}>
              社群帳號：填寫主要經營的即可
              {props.mode === 'create' && <span className={requiredMark}>*</span>}
            </span>
            <div className={fieldRow}>
              <div data-field="threads" className={fieldGroup}>
                <label htmlFor="venue-threads" className={labelSub}>
                  Threads
                </label>
                <input
                  id="venue-threads"
                  type="text"
                  className={inputStyle}
                  placeholder="@username"
                  value={form.threads}
                  onChange={(e) => setContactField('threads', e.target.value)}
                  aria-invalid={errors.threads || errors.socialMedia ? 'true' : undefined}
                  aria-describedby={
                    errors.threads
                      ? 'venue-threads-error'
                      : errors.socialMedia
                        ? 'venue-social-media-error'
                        : undefined
                  }
                />
                {errors.threads && (
                  <span id="venue-threads-error" className={fieldError} role="alert">
                    {errors.threads}
                  </span>
                )}
              </div>
              <div data-field="instagram" className={fieldGroup}>
                <label htmlFor="venue-instagram" className={labelSub}>
                  Instagram
                </label>
                <input
                  id="venue-instagram"
                  type="text"
                  className={inputStyle}
                  placeholder="@username"
                  value={form.instagram}
                  onChange={(e) => setContactField('instagram', e.target.value)}
                  aria-invalid={errors.instagram || errors.socialMedia ? 'true' : undefined}
                  aria-describedby={
                    errors.instagram
                      ? 'venue-instagram-error'
                      : errors.socialMedia
                        ? 'venue-social-media-error'
                        : undefined
                  }
                />
                {errors.instagram && (
                  <span id="venue-instagram-error" className={fieldError} role="alert">
                    {errors.instagram}
                  </span>
                )}
              </div>
            </div>
            {errors.socialMedia && (
              <span id="venue-social-media-error" className={fieldError} role="alert">
                {errors.socialMedia}
              </span>
            )}
          </div>

          {/* preferredContact */}
          <div data-field="preferredContact" className={fieldGroup}>
            <span className={label}>
              希望主辦怎麼聯絡你們？
              {props.mode === 'create' && <span className={requiredMark}>*</span>}
            </span>
            <PreferredContactDropdown
              value={form.preferredContact}
              onChange={(v) => setContactField('preferredContact', v)}
            />
            {errors.preferredContact && (
              <span className={fieldError} role="alert">
                {errors.preferredContact}
              </span>
            )}
          </div>

          {/* contactUrl — LINE link, shown only for line */}
          {showContactUrl && (
            <div data-field="contactUrl" className={fieldGroup}>
              <label htmlFor="venue-contact-url" className={label}>
                LINE 連結
              </label>
              <input
                id="venue-contact-url"
                type="text"
                className={inputStyle}
                inputMode="url"
                placeholder="LINE 網址"
                value={form.contactUrl}
                onChange={(e) => setContactField('contactUrl', e.target.value)}
                aria-invalid={errors.contactUrl ? 'true' : undefined}
                aria-describedby={errors.contactUrl ? 'venue-contact-url-error' : undefined}
              />
              {errors.contactUrl && (
                <span id="venue-contact-url-error" className={fieldError} role="alert">
                  {errors.contactUrl}
                </span>
              )}
            </div>
          )}

          {/* bookingFormUrl — always shown, optional */}
          <div data-field="bookingFormUrl" className={fieldGroup}>
            <label htmlFor="venue-booking-form-url" className={label}>
              預約表單網址
            </label>
            <p id="venue-booking-form-url-hint" className={fieldHint}>
              例如給主辦預約場地用的 Google 表單、預約系統連結，如果沒有可以跳過。
            </p>
            <input
              id="venue-booking-form-url"
              type="text"
              inputMode="url"
              className={inputStyle}
              placeholder="https://"
              value={form.bookingFormUrl}
              onChange={(e) => setField('bookingFormUrl', e.target.value)}
              aria-invalid={errors.bookingFormUrl ? 'true' : undefined}
              aria-describedby={
                errors.bookingFormUrl
                  ? 'venue-booking-form-url-error'
                  : 'venue-booking-form-url-hint'
              }
            />
            {errors.bookingFormUrl && (
              <span id="venue-booking-form-url-error" className={fieldError} role="alert">
                {errors.bookingFormUrl}
              </span>
            )}
          </div>

          {/* coverPhoto */}
          <div data-field="coverPhoto" className={fieldGroup}>
            <span className={label}>
              封面圖片
              {props.mode === 'create' && <span className={requiredMark}>*</span>}
            </span>
            <ImageUpload
              currentImageUrl={form.coverPhoto || undefined}
              onUploadComplete={(url) => {
                setForm((prev) => ({ ...prev, coverPhoto: url }));
                setErrors((prev) => ({ ...prev, coverPhoto: undefined }));
              }}
              onImageRemove={() => setForm((prev) => ({ ...prev, coverPhoto: '' }))}
              authToken={authToken}
              uploadImage={uploadImage}
              onUploadError={(error, file) => onImageUploadError?.(error, file, 'cover')}
              placeholder="點擊上傳封面圖片"
              compressionParams={{ maxWidth: 1200, maxHeight: 800, quality: 0.85 }}
            />
            {errors.coverPhoto && (
              <span className={fieldError} role="alert">
                {errors.coverPhoto}
              </span>
            )}
          </div>

          {/* otherPhotos */}
          <div className={fieldGroup}>
            <span className={label}>其他照片</span>
            <MultiImageUpload
              currentImages={form.otherPhotos}
              onImagesChange={(urls) => setForm((prev) => ({ ...prev, otherPhotos: urls }))}
              authToken={authToken}
              uploadImage={uploadImage}
              onUploadError={(error, file) => onImageUploadError?.(error, file, 'other')}
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

          <AdminVenueTagSection
            status={tagStatus}
            dictionary={dictionary}
            state={tagForm}
            initialEntries={initialTagForm.entries}
            errors={tagErrors}
            today={today}
            nearestMrt={form.nearestMrt}
            mrtWalkMinutes={form.mrtWalkMinutes}
            onChange={setTagForm}
          />

          {/* description */}
          <div className={fieldGroup}>
            <label htmlFor="venue-description" className={label}>
              場地描述
            </label>
            <textarea
              id="venue-description"
              className={textareaStyle}
              placeholder="場地說明、特色、注意事項、給 STELLAR 使用者的秘密優惠(非強制)…"
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
              {props.statusError && (
                <span className={fieldError} role="alert">
                  {props.statusError}
                </span>
              )}
            </div>
          )}

          <div className={submitRow}>
            <Link href={cancelHref} className={cancelBtn}>
              取消
            </Link>
            <button type="submit" className={submitBtn} disabled={isSubmitting}>
              {isSubmitting && <div className={spinner} aria-hidden="true" />}
              {submitLabel ?? (props.mode === 'create' ? '新增場地' : '儲存變更')}
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

        <aside className={previewCol} aria-label="前台會這樣顯示">
          <AdminVenuePreview
            status={tagStatus}
            preview={preview}
            name={form.name}
            region={form.region}
            nearestMrt={form.nearestMrt}
            mrtWalkMinutes={form.mrtWalkMinutes}
            coverPhoto={form.coverPhoto}
            sourceLinks={preview?.sourceLinks ?? []}
            infoUpdatedOn={preview?.infoUpdatedOn ?? null}
          />
        </aside>
      </div>
    </form>
  );
}
