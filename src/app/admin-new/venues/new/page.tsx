'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ChevronLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import { venueApi, handleApiError } from '@/lib/api';
import type { CreateVenueData, CapacityRange } from '@/types';

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
}

interface FormErrors {
  name?: string;
  address?: string;
  region?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VenueNewPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: '',
    address: '',
    region: '',
    nearestMrt: '',
    mrtWalkMinutes: '',
    capacityRange: '',
    description: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: CreateVenueData) => venueApi.createVenue(data),
    onSuccess: () => {
      router.push('/admin-new/venues');
    },
    onError: (err) => {
      setSubmitError(handleApiError(err));
    },
  });

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

    const data: CreateVenueData = {
      name: form.name.trim(),
      address: form.address.trim(),
      region: form.region,
      nearestMrt: form.nearestMrt.trim() || undefined,
      mrtWalkMinutes: form.mrtWalkMinutes ? Number(form.mrtWalkMinutes) : undefined,
      capacityRange: (form.capacityRange as CapacityRange) || undefined,
      description: form.description.trim() || undefined,
    };

    setSubmitError(null);
    mutation.mutate(data);
  }

  function setField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  return (
    <div className={pageWrapper}>
      <div className={container}>
        <Link href="/admin-new/venues" className={backLink}>
          <ChevronLeftIcon aria-hidden="true" />
          返回場地列表
        </Link>

        <h1 className={pageTitle}>新增場地</h1>

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

            {submitError && (
              <div className={formErrorBanner} role="alert">
                {submitError}
              </div>
            )}

            <div className={submitRow}>
              <Link href="/admin-new/venues" className={cancelBtn}>
                取消
              </Link>
              <button type="submit" className={submitBtn} disabled={mutation.isPending}>
                {mutation.isPending && <div className={spinner} aria-hidden="true" />}
                新增場地
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
