'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import { getDaysInMonth } from '@/utils/birthdayHelpers';

interface BirthdayPickerProps {
  value: string;
  onChange: (date: string) => void;
  disabled?: boolean;
  error?: boolean;
}

const MIN_BIRTH_YEAR = 1950;
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, i) => MIN_BIRTH_YEAR + i
);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

const row = css({
  display: 'flex',
  gap: '2',
});

const fieldWrap = css({
  flex: '1',
  minWidth: '0',
});

const dropdownContainer = css({ position: 'relative' });

const dropdownTrigger = cva({
  base: {
    width: '100%',
    paddingY: '3',
    paddingX: '3',
    border: '1px solid',
    borderColor: 'color.border.light',
    borderRadius: 'radius.lg',
    background: 'color.background.primary',
    color: 'color.text.primary',
    textStyle: 'bodySmall',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1',
    '&[data-empty="true"]': { color: 'color.text.secondary' },
    '&:hover:not(:disabled)': { borderColor: 'color.border.medium' },
    '&:focus-visible': {
      outline: 'none',
      borderColor: 'color.primary',
      boxShadow: '0 0 0 3px var(--colors-alpha-primary-10)',
    },
    '@media (min-width: 768px)': {
      paddingY: '3.5',
      textStyle: 'body',
    },
  },
  variants: {
    error: {
      true: { borderColor: 'red.600' },
    },
    disabled: {
      true: { cursor: 'not-allowed', opacity: '0.6' },
    },
  },
});

const dropdownMenu = css({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: '0',
  right: '0',
  zIndex: '20',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  boxShadow: 'shadow.lg',
  maxHeight: '240px',
  overflowY: 'auto',
});

const dropdownOption = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minHeight: '44px',
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

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  ariaLabel: string;
  value: string;
  options: DropdownOption[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  scrollToValue?: string;
}

// 三個生日子欄位共用的 dropdown：套用 stellar-web/CLAUDE.md 的 custom dropdown 標準 pattern
function Dropdown({
  ariaLabel,
  value,
  options,
  placeholder,
  onChange,
  disabled,
  error,
  scrollToValue,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 開啟時捲動定位到 scrollToValue（年份選單定位到今年），僅是預設可視位置，不代表已選值
  useEffect(() => {
    if (!open || !scrollToValue || !menuRef.current) return;
    const target = menuRef.current.querySelector<HTMLElement>(`[data-value="${scrollToValue}"]`);
    if (!target) return;
    target.scrollIntoView({ block: 'center' });
  }, [open, scrollToValue]);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div ref={containerRef} className={dropdownContainer}>
      <button
        type="button"
        className={dropdownTrigger({ error, disabled })}
        data-empty={!value ? 'true' : undefined}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={error ? 'true' : undefined}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{selectedLabel ?? placeholder}</span>
        <ChevronDownIcon
          className={css({
            width: '14px',
            height: '14px',
            flexShrink: '0',
            transition: 'transform 0.15s ease',
            ...(open && { transform: 'rotate(180deg)' }),
          })}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div ref={menuRef} className={dropdownMenu} role="listbox" aria-label={ariaLabel}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              data-value={opt.value}
              aria-selected={value === opt.value}
              className={dropdownOption({ selected: value === opt.value })}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// 解析 YYYY-MM-DD；月/日轉成不補零的字串，跟下方 option value 的格式一致
function parseBirthday(value: string): { year: string; month: string; day: string } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return { year: '', month: '', day: '' };
  return { year: match[1], month: String(Number(match[2])), day: String(Number(match[3])) };
}

// value 只作為掛載當下的初始值（例如 edit mode 帶入既有藝人生日），掛載後元件
// 自行管理年/月/日狀態，不再對 value prop 的後續變化做任何回填/重置。
// 這個設計假設父層只在資料就緒後才 mount 這個元件（ArtistSubmissionForm 目前唯二兩個
// 呼叫點 SubmitArtistClient.tsx、EditArtistClient.tsx 都是 existingArtist 讀取完成後才
// render 表單），而不是同一個元件實例先掛載、資料才非同步補上。
// 如果未來出現「同一元件實例需要在掛載後被外部整批替換生日」的情境，正確做法是讓父層
// 用 key 強制整個元件重新掛載，而不是在這裡重新引入 value-prop 監聽——
// 曾經試過用「記住最後一次 emit 的值」來分辨「外部真的改變」和「自己 onChange 的回音」，
// 但父層若非同步/非原樣寫回，這個分辨方式一樣會誤判，屬於治標不治本。
export default function BirthdayPicker({ value, onChange, disabled, error }: BirthdayPickerProps) {
  const [year, setYear] = useState(() => parseBirthday(value).year);
  const [month, setMonth] = useState(() => parseBirthday(value).month);
  const [day, setDay] = useState(() => parseBirthday(value).day);

  const daysInMonth = year && month ? getDaysInMonth(Number(year), Number(month)) : 0;
  const dayOptions: DropdownOption[] = Array.from({ length: daysInMonth }, (_, i) => {
    const d = String(i + 1);
    return { value: d, label: `${d} 日` };
  });

  const emit = (y: string, m: string, d: string) => {
    onChange(y && m && d ? `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` : '');
  };

  // 年或月切換後，原本選的日若超出新月份天數（如 2/29 → 平年），清空日期而非留一個不存在的日期
  const clampDay = (nextYear: string, nextMonth: string): string => {
    if (!day || !nextYear || !nextMonth) return day;
    const max = getDaysInMonth(Number(nextYear), Number(nextMonth));
    return Number(day) > max ? '' : day;
  };

  const handleYearChange = (y: string) => {
    const nextDay = clampDay(y, month);
    setYear(y);
    setDay(nextDay);
    emit(y, month, nextDay);
  };

  const handleMonthChange = (m: string) => {
    const nextDay = clampDay(year, m);
    setMonth(m);
    setDay(nextDay);
    emit(year, m, nextDay);
  };

  const handleDayChange = (d: string) => {
    setDay(d);
    emit(year, month, d);
  };

  return (
    <div className={row}>
      <div className={fieldWrap}>
        <Dropdown
          ariaLabel="生日年份"
          value={year}
          options={YEAR_OPTIONS.map((y) => ({ value: String(y), label: `${y} 年` }))}
          placeholder="年"
          onChange={handleYearChange}
          disabled={disabled}
          error={error}
          scrollToValue={String(CURRENT_YEAR)}
        />
      </div>
      <div className={fieldWrap}>
        <Dropdown
          ariaLabel="生日月份"
          value={month}
          options={MONTH_OPTIONS.map((m) => ({ value: String(m), label: `${m} 月` }))}
          placeholder="月"
          onChange={handleMonthChange}
          disabled={disabled}
          error={error}
        />
      </div>
      <div className={fieldWrap}>
        <Dropdown
          ariaLabel="生日日期"
          value={day}
          options={dayOptions}
          placeholder="日"
          onChange={handleDayChange}
          disabled={disabled || !year || !month}
          error={error}
        />
      </div>
    </div>
  );
}
