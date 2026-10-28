'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';

// Custom dropdown for forms (no native <select>, stellar-web CLAUDE.md). The trigger's name is
// "{label}：{selected or placeholder}", so screen readers hear the question and the answer.

const container = css({ position: 'relative', minWidth: 0 });

const trigger = css({
  width: '100%',
  minHeight: '44px',
  paddingY: '2',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.medium',
  background: 'color.background.primary',
  color: 'color.text.primary',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '2',
  textStyle: 'body',
  '&[data-empty="true"]': { color: 'color.text.secondary' },
  '&:hover': { borderColor: 'color.primary' },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.primary', outlineOffset: '1px' },
  '&[aria-invalid="true"]': { borderColor: 'color.status.error' },
});

const triggerText = css({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' });

const menu = css({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  minWidth: '100%',
  maxHeight: '240px',
  overflowY: 'auto',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  boxShadow: 'shadow.md',
  zIndex: 20,
});

const option = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minHeight: '44px',
    paddingX: '3',
    textStyle: 'body',
    color: 'color.text.primary',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    '&:hover, &:focus-visible': { background: 'color.background.secondary', outline: 'none' },
  },
  variants: {
    selected: { true: { color: 'color.primary', fontWeight: 'semibold' } },
  },
});

const chevron = cva({
  base: { width: '16px', height: '16px', flexShrink: 0, transition: 'transform 0.15s ease' },
  variants: { open: { true: { transform: 'rotate(180deg)' } } },
});

interface FormDropdownProps<T extends string> {
  id?: string;
  label: string;
  value: T | '';
  options: { value: T; label: string }[];
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
  onChange: (value: T) => void;
}

export default function FormDropdown<T extends string>({
  id,
  label,
  value,
  options,
  placeholder = '請選擇',
  invalid,
  describedBy,
  onChange,
}: FormDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((o) => o.value === value)?.label;
  const shown = selected ?? placeholder;

  // Safari never focuses clicked buttons, so blur misses outside clicks (pointerdown covers iOS taps)
  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={container}
      // Focus leaving the widget (incl. clicking outside) closes it
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Escape' || !open) return;
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={trigger}
        data-empty={selected ? undefined : 'true'}
        aria-label={`${label}：${shown}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid ? 'true' : undefined}
        aria-describedby={describedBy}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={triggerText}>{shown}</span>
        <ChevronDownIcon className={chevron({ open })} aria-hidden="true" />
      </button>
      {open && (
        <div
          className={menu}
          role="listbox"
          aria-label={label}
          // Keeps focus inside while clicking (Safari does not focus clicked buttons)
          onMouseDown={(e) => e.preventDefault()}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              className={option({ selected: value === opt.value })}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
                triggerRef.current?.focus();
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
