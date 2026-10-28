'use client';

import { useRef, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';
import type { TransitType } from '@/types';
import {
  MAX_TRANSIT_ROWS,
  TRANSIT_TYPE_OPTIONS,
  createTransitRow,
  normalizeWalkMinutes,
  type TransitRowErrors,
  type TransitRowValue,
} from '@/utils/transitStops';
import FieldError from './FieldError';
import FormDropdown from './FormDropdown';

// Transit stop rows used by the store form step 1 and the admin form (venue-tags §D, §E)

const fieldsetStyle = css({
  margin: 0,
  padding: 0,
  border: 'none',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
});

const legendStyle = css({
  padding: 0,
  marginBottom: '1',
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
});

const hintStyle = css({ margin: 0, textStyle: 'bodySmall', color: 'color.text.secondary' });

const rowBox = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  padding: '3',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
});

const firstLine = css({ display: 'flex', gap: '2', alignItems: 'flex-start' });
const typeCol = css({ width: '104px', flexShrink: 0 });
const stationCol = css({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
});

const secondLine = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  textStyle: 'body',
  color: 'color.text.primary',
});

const inputStyle = css({
  width: '100%',
  minHeight: '44px',
  paddingY: '2',
  paddingX: '3',
  border: '1px solid',
  borderColor: 'color.border.medium',
  borderRadius: 'radius.md',
  background: 'color.background.primary',
  color: 'color.text.primary',
  textStyle: 'body',
  '&::placeholder': { color: 'color.text.secondary' },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.primary', outlineOffset: '1px' },
  '&[aria-invalid="true"]': { borderColor: 'color.status.error' },
});

const minutesInput = css({ width: '64px', textAlign: 'center' });

const iconButton = css({
  width: '44px',
  height: '44px',
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderRadius: 'radius.md',
  background: 'transparent',
  color: 'color.text.secondary',
  cursor: 'pointer',
  '&:hover': { background: 'color.background.secondary', color: 'color.text.primary' },
  '&:active': { background: 'gray.100' },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.primary' },
  '& svg': { width: '20px', height: '20px' },
});

const removeButton = css({ marginLeft: 'auto' });

interface TransitStopsFieldProps {
  idPrefix: string;
  legend: ReactNode;
  hint?: string;
  rows: TransitRowValue[];
  errors: Record<string, TransitRowErrors>;
  disabled?: boolean;
  // part tells the parent which inline error the edit may clear ('other' clears nothing)
  onChange: (
    rows: TransitRowValue[],
    edited: { rowId: string; part: 'type' | 'station' | 'other' }
  ) => void;
}

export default function TransitStopsField({
  idPrefix,
  legend,
  hint,
  rows,
  errors,
  disabled,
  onChange,
}: TransitStopsFieldProps) {
  const addRef = useRef<HTMLButtonElement>(null);
  const hintId = `${idPrefix}-hint`;

  function update(
    rowId: string,
    patch: Partial<TransitRowValue>,
    part: 'type' | 'station' | 'other'
  ) {
    onChange(
      rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
      { rowId, part }
    );
  }

  function remove(rowId: string) {
    const remaining = rows.filter((row) => row.id !== rowId);
    // Always keep one row on screen; an all-blank row means "no transit".
    // Commit first: at the row limit the add button only renders after this removal
    flushSync(() =>
      onChange(remaining.length > 0 ? remaining : [createTransitRow()], { rowId, part: 'other' })
    );
    addRef.current?.focus();
  }

  return (
    <fieldset
      className={fieldsetStyle}
      aria-describedby={hint ? hintId : undefined}
      disabled={disabled}
    >
      <legend className={legendStyle}>{legend}</legend>
      {rows.map((row, index) => {
        const n = index + 1;
        const rowErrors = errors[row.id] ?? {};
        const typeErrorId = `${idPrefix}-${row.id}-type-error`;
        const stationErrorId = `${idPrefix}-${row.id}-station-error`;
        return (
          <div key={row.id} className={rowBox} data-transit-row={row.id}>
            <div className={firstLine}>
              <div className={typeCol} data-error-field={`transit.${row.id}.type`}>
                <FormDropdown<TransitType>
                  label={`交通方式 ${n} 類型`}
                  placeholder="類型"
                  value={row.type}
                  options={TRANSIT_TYPE_OPTIONS}
                  invalid={!!rowErrors.type}
                  describedBy={rowErrors.type ? typeErrorId : undefined}
                  onChange={(type) => update(row.id, { type }, 'type')}
                />
              </div>
              <div className={stationCol} data-error-field={`transit.${row.id}.station`}>
                <input
                  type="text"
                  className={inputStyle}
                  placeholder="站名"
                  aria-label={`交通方式 ${n} 站名`}
                  value={row.station}
                  maxLength={100}
                  aria-invalid={rowErrors.station ? 'true' : undefined}
                  aria-describedby={rowErrors.station ? stationErrorId : undefined}
                  onChange={(e) => update(row.id, { station: e.target.value }, 'station')}
                />
              </div>
            </div>
            <FieldError id={typeErrorId} message={rowErrors.type} />
            <FieldError id={stationErrorId} message={rowErrors.station} />
            <div className={secondLine}>
              <span aria-hidden="true">步行</span>
              {/* No maxLength: it would truncate pasted "步行10分鐘" before digits are filtered */}
              <input
                type="text"
                inputMode="numeric"
                className={`${inputStyle} ${minutesInput}`}
                aria-label={`交通方式 ${n} 步行分鐘`}
                value={row.walkMinutes}
                onChange={(e) =>
                  update(row.id, { walkMinutes: normalizeWalkMinutes(e.target.value) }, 'other')
                }
              />
              <span aria-hidden="true">分鐘</span>
              <button
                type="button"
                className={`${iconButton} ${removeButton}`}
                aria-label="移除這個交通方式"
                onClick={() => remove(row.id)}
              >
                <XMarkIcon aria-hidden="true" />
              </button>
            </div>
          </div>
        );
      })}
      {rows.length < MAX_TRANSIT_ROWS && (
        <button
          ref={addRef}
          type="button"
          className={iconButton}
          aria-label="新增交通方式"
          onClick={() => onChange([...rows, createTransitRow()], { rowId: '', part: 'other' })}
        >
          <PlusIcon aria-hidden="true" />
        </button>
      )}
      {hint && (
        <p id={hintId} className={hintStyle}>
          {hint}
        </p>
      )}
    </fieldset>
  );
}
