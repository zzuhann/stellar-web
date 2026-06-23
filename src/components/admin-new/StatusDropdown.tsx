'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';

const dropdownContainer = css({ position: 'relative' });

const dropdownTrigger = css({
  height: '36px',
  paddingY: '0',
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
  gap: '2',
  textStyle: 'bodySmall',
  minWidth: '100px',
  '&:hover': {
    borderColor: 'color.border.medium',
  },
});

const dropdownMenu = css({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  minWidth: '100%',
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
    paddingY: '2',
    textStyle: 'bodySmall',
    color: 'color.text.primary',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    '&:hover': {
      background: 'color.background.secondary',
    },
  },
  variants: {
    selected: {
      true: {
        color: 'color.primary',
        fontWeight: 'semibold',
      },
    },
  },
});

const STATUS_OPTIONS = [
  { value: '', label: '全部狀態' },
  { value: 'pending', label: '待審核' },
  { value: 'approved', label: '已通過' },
  { value: 'rejected', label: '已拒絕' },
];

interface StatusDropdownProps {
  value: string;
  onChange: (v: string) => void;
  options?: { value: string; label: string }[];
}

export default function StatusDropdown({ value, onChange, options }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const resolvedOptions = options ?? STATUS_OPTIONS;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = resolvedOptions.find((o) => o.value === value) ?? resolvedOptions[0];

  return (
    <div ref={ref} className={dropdownContainer}>
      <button
        type="button"
        className={dropdownTrigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected.label}</span>
        <ChevronDownIcon
          className={css({
            width: '12px',
            height: '12px',
            transition: 'transform 0.15s ease',
            ...(open ? { transform: 'rotate(180deg)' } : {}),
          })}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className={dropdownMenu} role="listbox">
          {resolvedOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
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
