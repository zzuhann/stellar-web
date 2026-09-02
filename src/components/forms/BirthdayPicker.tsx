'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import { formatBirthdayFull, getDaysInMonth } from '@/utils/birthdayHelpers';
import BirthdayPickerMobileSheet from './BirthdayPickerMobileSheet';
import { YEAR_OPTIONS, MONTH_OPTIONS, type PickerOption } from './birthdayPickerOptions';

interface BirthdayPickerProps {
  value: string;
  onChange: (date: string) => void;
  disabled?: boolean;
  error?: boolean;
}

// 用 CSS media query 切換桌面/手機版顯示，兩者常駐掛載，避免 JS matchMedia 造成 hydration 問題
const desktopRow = css({
  display: 'none',
  '@media (min-width: 768px)': {
    display: 'flex',
    gap: '2',
  },
});

const mobileTriggerWrap = css({
  display: 'block',
  '@media (min-width: 768px)': {
    display: 'none',
  },
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

// PickerOption 定義在 birthdayPickerOptions.ts（wheel 選項跟 dropdown 選項是同一種形狀）
type DropdownOption = PickerOption;

interface DropdownProps {
  ariaLabel: string;
  value: string;
  options: DropdownOption[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  // 欄位為空時，第一次開啟選單自動選取這個值並捲動可見（只有年份欄位用，見 spec）
  selectOnOpen?: string;
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
  selectOnOpen,
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

  // 選單開啟時把目前已選值捲動到可見範圍（通用行為，不只服務 selectOnOpen）
  useEffect(() => {
    if (!open) return;
    if (!value) return;
    const optionEl = menuRef.current?.querySelector(`[data-value="${value}"]`);
    // jsdom（測試環境）沒有實作 scrollIntoView，feature-detect 避免測試炸掉
    if (optionEl && typeof optionEl.scrollIntoView === 'function') {
      optionEl.scrollIntoView({ block: 'center' });
    }
  }, [open, value]);

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
        onClick={() => {
          // 只在「打開」的這次觸發自動選取，關閉時不要動到 value
          if (!open && selectOnOpen && !value) {
            onChange(selectOnOpen);
          }
          setOpen((o) => !o);
        }}
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

// value 只作為掛載時的初始值，掛載後不再監聽 prop 變化（會跟自身 emit('') 的回音搞混）。
// 若未來需要在已掛載的實例上換一組生日，用 key 強制重新掛載，不要重新加 resync。
export default function BirthdayPicker({ value, onChange, disabled, error }: BirthdayPickerProps) {
  const [year, setYear] = useState(() => parseBirthday(value).year);
  const [month, setMonth] = useState(() => parseBirthday(value).month);
  const [day, setDay] = useState(() => parseBirthday(value).day);

  // 年份未選時無法判斷閏年，用 2000（閏年）放寬 2 月到 29 天，避免先選日卡住
  const daysInMonth = month ? getDaysInMonth(Number(year) || 2000, Number(month)) : 0;
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

  const [sheetOpen, setSheetOpen] = useState(false);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);

  // Sheet 關閉後把 focus 還給觸發按鈕，避免鍵盤使用者 focus 停在畫面外元素
  const closeSheet = () => {
    setSheetOpen(false);
    mobileTriggerRef.current?.focus();
  };

  // 「完成」永遠可按、emit 目前置中值——跟桌面版「未選滿不送出」刻意不同（見 design-frontend.md）
  const handleWheelConfirm = (date: string) => {
    const parsed = parseBirthday(date);
    setYear(parsed.year);
    setMonth(parsed.month);
    setDay(parsed.day);
    onChange(date);
    closeSheet();
  };

  const hasSelection = !!(year && month && day);
  const mobileTriggerLabel = hasSelection
    ? formatBirthdayFull(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
    : '選擇生日';

  return (
    <>
      <div className={desktopRow}>
        <div className={fieldWrap}>
          <Dropdown
            ariaLabel="生日年份"
            value={year}
            options={YEAR_OPTIONS.map((y) => ({ value: String(y), label: `${y} 年` }))}
            placeholder="年"
            onChange={handleYearChange}
            disabled={disabled}
            error={error}
            selectOnOpen="2000"
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
            disabled={disabled || !month}
            error={error}
          />
        </div>
      </div>
      <div className={mobileTriggerWrap}>
        <button
          ref={mobileTriggerRef}
          type="button"
          className={dropdownTrigger({ error, disabled })}
          data-empty={!hasSelection ? 'true' : undefined}
          aria-label="生日"
          aria-haspopup="dialog"
          disabled={disabled}
          onClick={() => setSheetOpen(true)}
        >
          <span>{mobileTriggerLabel}</span>
          <ChevronDownIcon
            className={css({ width: '14px', height: '14px', flexShrink: '0' })}
            aria-hidden="true"
          />
        </button>
      </div>
      <BirthdayPickerMobileSheet
        isOpen={sheetOpen}
        onClose={closeSheet}
        onConfirm={handleWheelConfirm}
        committedYear={year}
        committedMonth={month}
        committedDay={day}
      />
    </>
  );
}
