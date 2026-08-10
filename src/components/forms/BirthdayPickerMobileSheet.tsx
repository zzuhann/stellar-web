'use client';

import { useEffect, useRef, useState } from 'react';
import { css, cva } from '@/styled-system/css';
import { getDaysInMonth } from '@/utils/birthdayHelpers';
import type { PickerOption } from './birthdayPickerOptions';
import { YEAR_OPTIONS, MONTH_OPTIONS } from './birthdayPickerOptions';

const ITEM_HEIGHT = 44; // matches WCAG minimum touch target

const overlay = css({
  position: 'fixed',
  inset: '0',
  background: 'alpha.black.50',
  zIndex: '200',
  transition: 'opacity 280ms ease-out',
});

const sheet = css({
  position: 'fixed',
  bottom: '0',
  left: '0',
  right: '0',
  maxWidth: '480px',
  marginX: 'auto',
  backgroundColor: 'color.background.primary',
  borderTopLeftRadius: 'radius.xl',
  borderTopRightRadius: 'radius.xl',
  boxShadow: 'shadow.xl',
  zIndex: '201',
  paddingX: '4',
  paddingTop: '4',
});

const handleBar = css({
  width: '40px',
  height: '4px',
  backgroundColor: 'color.border.medium',
  borderRadius: '2px',
  marginX: 'auto',
  marginBottom: '4',
  marginTop: '3',
});

const title = css({
  textStyle: 'bodyStrong', // 比 h4 小一號，維持標題感（semibold）但不搶走滾輪的視覺重量
  color: 'color.text.primary',
  textAlign: 'center',
  marginBottom: '4',
  marginTop: '0',
});

const wheelRow = css({
  display: 'flex',
  gap: '2',
  marginBottom: '6',
});

const wheelViewport = css({
  position: 'relative',
  flex: '1',
  height: `${ITEM_HEIGHT * 3}px`,
  overflowX: 'hidden',
});

const wheelScroll = css({
  height: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
  scrollSnapType: 'y mandatory',
  paddingY: `${ITEM_HEIGHT}px`,
  '&:focus-visible': {
    outline: 'none',
  },
});

// 選中狀態刻意不切換 textStyle（會連 line-height 一起瞬間跳變、造成頓挫），
// 改用 transform: scale 模擬「放大」，字級本身固定，靠 transition 讓 scale/color/fontWeight 連續漸變
const wheelOption = cva({
  base: {
    height: `${ITEM_HEIGHT}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    scrollSnapAlign: 'center',
    textStyle: 'bodySmall',
    color: 'color.text.secondary',
    fontWeight: 'normal',
    cursor: 'pointer',
    transform: 'scale(1)',
    transformOrigin: 'center',
    transition: 'transform 0.2s ease, color 0.2s ease, font-weight 0.2s ease',
  },
  variants: {
    selected: {
      true: { color: 'color.text.primary', fontWeight: 'semibold', transform: 'scale(1.2)' },
    },
  },
});

const wheelHighlight = css({
  position: 'absolute',
  top: `${ITEM_HEIGHT}px`,
  left: '0',
  right: '0',
  height: `${ITEM_HEIGHT}px`,
  borderTop: '1px solid',
  borderBottom: '1px solid',
  borderColor: 'color.border.subtle',
  pointerEvents: 'none',
});

const buttonRow = css({
  display: 'flex',
  gap: '3',
});

const primaryButton = css({
  flex: '1',
  height: '48px',
  backgroundColor: 'color.primary',
  color: 'gray.0',
  border: 'none',
  borderRadius: 'radius.lg',
  textStyle: 'button',
  cursor: 'pointer',
  transition: 'background 0.2s ease, opacity 0.2s ease',
  '&:hover': { opacity: '0.9' },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'gray.0',
    outlineOffset: '2px',
  },
});

const secondaryButton = css({
  flex: '1',
  height: '48px',
  backgroundColor: 'transparent',
  color: 'color.text.primary',
  border: '1px solid',
  borderColor: 'color.border.medium',
  borderRadius: 'radius.lg',
  textStyle: 'button',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
  '&:hover': { backgroundColor: 'color.background.secondary' },
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'color.primary',
    outlineOffset: '2px',
  },
});

interface WheelColumnProps {
  idPrefix: string;
  ariaLabel: string;
  options: PickerOption[];
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
}

// 原生 scroll-snap 滾輪：每欄是一個獨立 tab stop 的 listbox，方向鍵切換選項；
// 觸控拖曳交給瀏覽器原生 scroll-snap，停止後用 handleScroll 算出停在哪個選項並回報。
// 手感（scroll-snap 在各瀏覽器/App 內建瀏覽器的實際體感）無法用 unit test 驗證，需實機測試。
function WheelColumn({ idPrefix, ariaLabel, options, value, onChange, isOpen }: WheelColumnProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // value 變化時（開啟 sheet、年/月切換 reset 日、鍵盤切換）同步捲動位置。
  // 只在 isOpen 時執行：元件常駐掛載，關閉狀態下 draftYear/Month/Day 理論上不會變，
  // 但仍以 isOpen 擋一層，避免 scrollIntoView 在 sheet 隱藏、body scroll 尚未鎖定的
  // 時間點意外把外層頁面一起捲走（desktop 版年份下拉先前就是同一種 bug）。
  useEffect(() => {
    if (!isOpen) return;
    const container = scrollRef.current;
    if (!container) return;
    const target = container.querySelector<HTMLElement>(`[data-value="${value}"]`);
    target?.scrollIntoView?.({ block: 'center' });
  }, [value, isOpen]);

  useEffect(() => {
    return () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, []);

  const handleScroll = () => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const container = scrollRef.current;
      if (!container) return;
      const containerCenter = container.scrollTop + container.clientHeight / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;
      options.forEach((opt, index) => {
        const el = container.querySelector<HTMLElement>(`[data-value="${opt.value}"]`);
        if (!el) return;
        const elCenter = el.offsetTop + el.offsetHeight / 2;
        const distance = Math.abs(elCenter - containerCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      const next = options[closestIndex];
      if (next && next.value !== value) onChange(next.value);
    }, 120);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = options.findIndex((opt) => opt.value === value);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = options[Math.min(currentIndex + 1, options.length - 1)];
      if (next) onChange(next.value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = options[Math.max(currentIndex - 1, 0)];
      if (prev) onChange(prev.value);
    }
  };

  return (
    <div className={wheelViewport}>
      <div
        ref={scrollRef}
        className={wheelScroll}
        role="listbox"
        aria-label={ariaLabel}
        aria-activedescendant={value ? `${idPrefix}-option-${value}` : undefined}
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
      >
        {options.map((opt) => (
          <div
            key={opt.value}
            id={`${idPrefix}-option-${opt.value}`}
            role="option"
            data-value={opt.value}
            aria-selected={opt.value === value}
            className={wheelOption({ selected: opt.value === value })}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </div>
        ))}
      </div>
      <div className={wheelHighlight} aria-hidden="true" />
    </div>
  );
}

interface BirthdayPickerMobileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  committedYear: string;
  committedMonth: string;
  committedDay: string;
}

const YEAR_WHEEL_OPTIONS: PickerOption[] = YEAR_OPTIONS.map((y) => ({
  value: String(y),
  label: `${y} 年`,
}));
const MONTH_WHEEL_OPTIONS: PickerOption[] = MONTH_OPTIONS.map((m) => ({
  value: String(m),
  label: `${m} 月`,
}));

export default function BirthdayPickerMobileSheet({
  isOpen,
  onClose,
  onConfirm,
  committedYear,
  committedMonth,
  committedDay,
}: BirthdayPickerMobileSheetProps) {
  const [draftYear, setDraftYear] = useState('');
  const [draftMonth, setDraftMonth] = useState('');
  const [draftDay, setDraftDay] = useState('');
  const sheetRef = useRef<HTMLDivElement>(null);

  // 開啟時決定置中位置：已有選過的生日（edit mode 或使用者先前確認過）就置中該值，
  // 否則（create mode 尚未選過）置中今天——wheel 這種互動本來就沒有「空」的視覺狀態，
  // 這是使用者知情且刻意接受的取捨（見 design-frontend.md 手機版章節）。
  // 用 React 官方建議的「render 期間依 prop 變化調整 state」寫法（非 useEffect），
  // 避免 setState-in-effect 造成多一輪 cascading render。
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      const hasCommitted = !!(committedYear && committedMonth && committedDay);
      const today = new Date();
      setDraftYear(hasCommitted ? committedYear : String(today.getFullYear()));
      setDraftMonth(hasCommitted ? committedMonth : String(today.getMonth() + 1));
      setDraftDay(hasCommitted ? committedDay : String(today.getDate()));
    }
  }

  // 鎖背景捲動，比照 MapPage.tsx 現有 pattern
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const container = sheetRef.current;
    const first = container?.querySelector<HTMLElement>('[tabindex="0"]');
    first?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const container = sheetRef.current;
        if (!container) return;
        const focusable = container.querySelectorAll<HTMLElement>(
          '[tabindex="0"], button:not(:disabled)'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 年或月切換後日期直接 reset 成 1 日（不是 clamp 到最接近的合法值）——
  // 跟桌面版刻意不同的簡化行為，見 design-frontend.md 手機版章節
  const handleYearChange = (y: string) => {
    setDraftYear(y);
    setDraftDay('1');
  };

  const handleMonthChange = (m: string) => {
    setDraftMonth(m);
    setDraftDay('1');
  };

  const daysInMonth =
    draftYear && draftMonth ? getDaysInMonth(Number(draftYear), Number(draftMonth)) : 31;
  const dayWheelOptions: PickerOption[] = Array.from({ length: daysInMonth }, (_, i) => {
    const d = String(i + 1);
    return { value: d, label: `${d} 日` };
  });

  const handleConfirm = () => {
    onConfirm(`${draftYear}-${draftMonth.padStart(2, '0')}-${draftDay.padStart(2, '0')}`);
  };

  const sheetTransition = isOpen ? 'transform 280ms ease-out' : 'transform 240ms ease-in';

  return (
    <>
      <div
        className={overlay}
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        className={sheet}
        style={{
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: sheetTransition,
          maxHeight: '90dvh',
          paddingBottom: 'max(calc(env(safe-area-inset-bottom) + 24px), 24px)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="選擇生日"
        aria-hidden={!isOpen}
        // aria-hidden 只讓輔助科技略過，不會把元素移出 Tab 順序；sheet 常駐掛載，
        // 關閉時仍可能被鍵盤 Tab 到藏在畫面外的按鈕/listbox。inert 才會真的讓整個
        // 子樹不可 focus、不可點擊（@testing-library/dom 目前不認得 inert，
        // 所以 aria-hidden 仍保留給測試查詢用）
        inert={!isOpen}
      >
        <div className={handleBar} aria-hidden="true" />
        <h2 className={title}>選擇生日</h2>
        <div className={wheelRow}>
          <WheelColumn
            idPrefix="birthday-year"
            ariaLabel="選擇生日年份"
            options={YEAR_WHEEL_OPTIONS}
            value={draftYear}
            onChange={handleYearChange}
            isOpen={isOpen}
          />
          <WheelColumn
            idPrefix="birthday-month"
            ariaLabel="選擇生日月份"
            options={MONTH_WHEEL_OPTIONS}
            value={draftMonth}
            onChange={handleMonthChange}
            isOpen={isOpen}
          />
          <WheelColumn
            idPrefix="birthday-day"
            ariaLabel="選擇生日日期"
            options={dayWheelOptions}
            value={draftDay}
            onChange={setDraftDay}
            isOpen={isOpen}
          />
        </div>
        <div className={buttonRow}>
          <button type="button" className={secondaryButton} onClick={onClose}>
            取消
          </button>
          <button type="button" className={primaryButton} onClick={handleConfirm}>
            完成
          </button>
        </div>
      </div>
    </>
  );
}
