'use client';

import { css, cva } from '@/styled-system/css';

const segmentGroup = css({
  display: 'flex',
  flexShrink: 0,
});

const segmentBtn = cva({
  base: {
    height: '36px',
    paddingX: '3',
    border: '1px solid',
    borderColor: 'color.border.light',
    background: 'white',
    color: 'color.text.secondary',
    cursor: 'pointer',
    textStyle: 'bodySmall',
    whiteSpace: 'nowrap',
    transition: 'background 0.15s ease, color 0.15s ease',
    marginLeft: '-1px',
    position: 'relative',
    '&:first-child': {
      borderRadius: 'radius.md 0 0 radius.md',
      marginLeft: '0',
    },
    '&:last-child': {
      borderRadius: '0 radius.md radius.md 0',
    },
    '&:hover': {
      color: 'color.text.primary',
      zIndex: 1,
    },
  },
  variants: {
    active: {
      true: {
        background: 'stellarBlue.50',
        borderColor: 'stellarBlue.400',
        color: 'stellarBlue.600',
        fontWeight: 'semibold',
        zIndex: 2,
        '&:hover': {
          color: 'stellarBlue.600',
        },
      },
    },
  },
});

export type SearchField = 'name' | 'slug' | 'id';

const DEFAULT_LABELS: Record<SearchField, string> = {
  name: '名稱',
  slug: 'Slug',
  id: 'ID',
};

const FIELDS: SearchField[] = ['name', 'slug', 'id'];

interface SearchFieldDropdownProps {
  value: SearchField;
  onChange: (v: SearchField) => void;
  labels?: Partial<Record<SearchField, string>>;
}

export default function SearchFieldDropdown({ value, onChange, labels }: SearchFieldDropdownProps) {
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };

  return (
    <div className={segmentGroup} role="group" aria-label="搜尋欄位">
      {FIELDS.map((field) => (
        <button
          key={field}
          type="button"
          className={segmentBtn({ active: value === field })}
          onClick={() => onChange(field)}
          aria-pressed={value === field}
        >
          {resolvedLabels[field]}
        </button>
      ))}
    </div>
  );
}
