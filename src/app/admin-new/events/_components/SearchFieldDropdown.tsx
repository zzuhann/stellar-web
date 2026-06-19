'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';

const dropdownContainer = css({ position: 'relative', flexShrink: 0 });

const dropdownTrigger = css({
  height: '36px',
  paddingY: '0',
  paddingX: '3',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  background: 'white',
  color: 'color.text.secondary',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '1.5',
  textStyle: 'bodySmall',
  whiteSpace: 'nowrap',
  '&:hover': {
    borderColor: 'color.border.medium',
    color: 'color.text.primary',
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
    whiteSpace: 'nowrap',
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

export type SearchField = 'name' | 'slug' | 'id';

const FIELD_OPTIONS: { value: SearchField; label: string }[] = [
  { value: 'name', label: '名稱' },
  { value: 'slug', label: 'Slug' },
  { value: 'id', label: 'ID' },
];

interface SearchFieldDropdownProps {
  value: SearchField;
  onChange: (v: SearchField) => void;
}

export default function SearchFieldDropdown({ value, onChange }: SearchFieldDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = FIELD_OPTIONS.find((o) => o.value === value) ?? FIELD_OPTIONS[0];

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
          {FIELD_OPTIONS.map((opt) => (
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
