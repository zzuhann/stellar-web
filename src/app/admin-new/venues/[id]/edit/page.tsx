'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import { venueApi, handleApiError } from '@/lib/api';
import queryKey from '@/hooks/queryKey';
import Skeleton from '@/components/ui/Skeleton';
import DeleteVenueDialog from '@/components/admin-new/DeleteVenueDialog';
import type { UpdateVenueData, CapacityRange } from '@/types';

// ─── CSS ──────────────────────────────────────────────────────────────────────

const pageWrapper = css({
  display: 'flex',
  minHeight: '100dvh',
  paddingTop: '70px',
  background: 'color.background.primary',
  justifyContent: 'center',
});

const container = css({
  width: '100%',
  maxWidth: '640px',
  paddingX: '4',
  paddingY: '6',
  md: {
    paddingX: '6',
    paddingY: '8',
  },
});

const backLink = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  textStyle: 'caption',
  color: 'color.text.secondary',
  textDecoration: 'none',
  marginBottom: '5',
  '&:hover': { color: 'color.text.primary' },
  '& svg': { width: '14px', height: '14px' },
});

const pageTitle = css({
  textStyle: 'h3',
  color: 'color.text.primary',
  margin: 0,
  marginBottom: '6',
});

const formSection = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '5',
});

const fieldGroup = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5',
});

const label = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  display: 'flex',
  alignItems: 'center',
  gap: '1',
});

const requiredMark = css({
  color: 'red.500',
});

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

const fieldError = css({
  textStyle: 'caption',
  color: 'red.500',
  marginTop: '0.5',
});

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
  '&[data-empty="true"]': { color: 'color.text.disabled' },
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
    selected: {
      true: { color: 'color.primary', fontWeight: 'semibold' },
    },
  },
});

const submitRow = css({
  display: 'flex',
  gap: '3',
  marginTop: '2',
});

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

const dangerZone = css({
  paddingTop: '4',
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
});

const dangerTitle = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'red.700',
});

const dangerDescription = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
});

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

const STATUS_LABEL: Record<string, string> = {
  pending: '審核中',
  active: '上架中',
  inactive: '已下架',
  rejected: '已拒絕',
};

// ─── Constants ────────────────────────────────────────────────────────────────

const REGION_OPTIONS = ['台北', '新北', '桃園', '台中', '台南', '高雄', '其他'];
const CAPACITY_OPTIONS: CapacityRange[] = ['20以下', '20-40', '40-60', '60以上'];

// ─── SelectDropdown component ─────────────────────────────────────────────────

interface SelectDropdownProps {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  invalid?: boolean;
}

function SelectDropdown({ value, onChange, options, placeholder, invalid }: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={dropdownContainer}>
      <button
        type="button"
        className={dropdownTrigger}
        data-empty={!value ? 'true' : undefined}
        aria-invalid={invalid ? 'true' : undefined}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
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

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  address: string;
  region: string;
  nearestMrt: string;
  mrtWalkMinutes: string;
  capacityRange: string;
  description: string;
  status: string;
}

interface FormErrors {
  name?: string;
  address?: string;
  region?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VenueEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const venueId = params.id;

  const [form, setForm] = useState<FormState>({
    name: '',
    address: '',
    region: '',
    nearestMrt: '',
    mrtWalkMinutes: '',
    capacityRange: '',
    description: '',
    status: '',
  });

  const initialized = useRef(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ─── Load data ─────────────────────────────────────────────────────────────

  const {
    data: venue,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKey.venueDetail(venueId),
    queryFn: () => venueApi.getAdminVenueById(venueId),
    enabled: !!venueId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (venue && !initialized.current) {
      initialized.current = true;
      setForm({
        name: venue.name,
        address: venue.address,
        region: venue.region,
        nearestMrt: venue.nearestMrt ?? '',
        mrtWalkMinutes: venue.mrtWalkMinutes != null ? String(venue.mrtWalkMinutes) : '',
        capacityRange: venue.capacityRange ?? '',
        description: venue.description ?? '',
        status: venue.status,
      });
    }
  }, [venue]);

  // ─── Update mutation ───────────────────────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: (data: UpdateVenueData) => venueApi.updateVenue(venueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.venueDetail(venueId) });
      router.push('/admin-new/venues');
    },
    onError: (err) => {
      setSubmitError(handleApiError(err));
    },
  });

  // ─── Delete mutation ───────────────────────────────────────────────────────

  const deleteMutation = useMutation({
    mutationFn: () => venueApi.permanentDeleteVenue(venueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey.adminVenues() });
      router.push('/admin-new/venues');
    },
    onError: (err) => {
      setDeleteError(handleApiError(err));
    },
  });

  // ─── Status toggle mutation ────────────────────────────────────────────────

  const statusMutation = useMutation({
    mutationFn: (status: 'active' | 'inactive') => venueApi.updateVenue(venueId, { status }),
    onSuccess: (_, status) => {
      setForm((prev) => ({ ...prev, status }));
      queryClient.invalidateQueries({ queryKey: queryKey.venueDetail(venueId) });
    },
    onError: (err) => {
      setSubmitError(handleApiError(err));
    },
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────

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

    const data: UpdateVenueData = {
      name: form.name.trim(),
      address: form.address.trim(),
      region: form.region,
      nearestMrt: form.nearestMrt.trim() || undefined,
      mrtWalkMinutes: form.mrtWalkMinutes ? Number(form.mrtWalkMinutes) : null,
      capacityRange: (form.capacityRange as CapacityRange) || null,
      description: form.description.trim() || undefined,
    };

    setSubmitError(null);
    updateMutation.mutate(data);
  }

  function setField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  // ─── Loading / Error states ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={pageWrapper}>
        <div className={container}>
          <Skeleton width="120px" height="16px" />
          <div className={css({ marginTop: '5' })}>
            <Skeleton width="200px" height="28px" />
          </div>
          <div
            className={css({ marginTop: '6', display: 'flex', flexDirection: 'column', gap: '5' })}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={fieldGroup}>
                <Skeleton width="80px" height="16px" />
                <Skeleton width="100%" height="40px" borderRadius="8px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !venue) {
    return (
      <div className={pageWrapper}>
        <div className={container}>
          <Link href="/admin-new/venues" className={backLink}>
            <ChevronLeftIcon aria-hidden="true" />
            返回場地列表
          </Link>
          <div className={formErrorBanner} role="alert">
            載入場地資料失敗，請返回重試。
          </div>
        </div>
      </div>
    );
  }

  const canDelete = venue.status === 'inactive' && venue.eventCount === 0;

  return (
    <div className={pageWrapper}>
      <div className={container}>
        <Link href="/admin-new/venues" className={backLink}>
          <ChevronLeftIcon aria-hidden="true" />
          返回場地列表
        </Link>

        <h1 className={pageTitle}>編輯場地</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className={formSection}>
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

            {/* status toggle */}
            <div className={fieldGroup}>
              <span className={label}>上下架狀態</span>
              <div className={statusToggleRow}>
                <span
                  className={statusBadge({
                    status: form.status as 'pending' | 'active' | 'inactive' | 'rejected',
                  })}
                >
                  {STATUS_LABEL[form.status] ?? form.status}
                </span>
                {form.status === 'active' && (
                  <button
                    type="button"
                    className={statusToggleBtn({ variant: 'offline' })}
                    onClick={() => statusMutation.mutate('inactive')}
                    disabled={statusMutation.isPending}
                  >
                    下架
                  </button>
                )}
                {form.status === 'inactive' && (
                  <button
                    type="button"
                    className={statusToggleBtn({ variant: 'online' })}
                    onClick={() => statusMutation.mutate('active')}
                    disabled={statusMutation.isPending}
                  >
                    上架
                  </button>
                )}
              </div>
            </div>

            {submitError && (
              <div className={formErrorBanner} role="alert">
                {submitError}
              </div>
            )}

            <div className={submitRow}>
              <Link href="/admin-new/venues" className={cancelBtn}>
                取消
              </Link>
              <button type="submit" className={submitBtn} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <div className={spinner} aria-hidden="true" />}
                儲存變更
              </button>
            </div>

            {/* Danger zone */}
            {canDelete && (
              <>
                <div className={divider} />
                <div className={dangerZone}>
                  <span className={dangerTitle}>危險操作</span>
                  <p className={dangerDescription}>
                    場地已下架且無關聯活動，可永久刪除。此操作無法復原。
                  </p>
                  <button
                    type="button"
                    className={deleteBtn}
                    onClick={() => {
                      setDeleteError(null);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    永久刪除場地
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>

      <DeleteVenueDialog
        venue={deleteDialogOpen ? venue : null}
        onConfirm={() => deleteMutation.mutate()}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteError(null);
        }}
        isLoading={deleteMutation.isPending}
        error={deleteError}
      />
    </div>
  );
}
