'use client';

import { useState } from 'react';
import { Popover } from '@headlessui/react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import TimeView from './TimeView';
import { formatTimeString, parseTimeString } from './utils';

interface TimePickerProps {
  value: string; // 'HH:mm'，空字串代表未選擇
  onChange: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

const timePickerContainer = css({
  position: 'relative',
  width: '100%',
});

const timeInput = cva({
  base: {
    width: '100%',
    paddingY: '3',
    paddingX: '4',
    border: '1px solid',
    borderColor: 'color.border.light',
    borderRadius: 'radius.lg',
    background: 'color.background.primary',
    color: 'color.text.primary',
    textStyle: 'bodySmall',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    opacity: '1',
    '&:hover:not(:disabled)': {
      borderColor: 'color.border.medium',
    },
    '&:focus-visible': {
      outline: 'none',
      borderColor: 'color.primary',
      boxShadow: '0 0 0 3px var(--colors-alpha-primary-10)',
    },
    '@media (min-width: 768px)': {
      padding: '14px 18px',
      textStyle: 'body',
    },
  },
  variants: {
    error: {
      true: {
        borderColor: 'red.600',
      },
    },
    disabled: {
      true: {
        cursor: 'not-allowed',
        opacity: '0.6',
      },
    },
  },
});

const timeDisplay = css({
  color: 'color.text.primary',
  fontVariantNumeric: 'tabular-nums',
});

const placeholderText = css({
  color: 'color.text.secondary',
});

const popoverPanel = css({
  position: 'absolute',
  top: '100%',
  left: '0',
  right: '0',
  zIndex: '50',
  marginTop: '1',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  boxShadow: 'shadow.lg',
  padding: '3',
  minWidth: '200px',
  maxWidth: '100vw',
  '@media (max-width: 410px)': {
    left: '-2',
    right: '-2',
    padding: '2',
  },
});

export default function TimePicker({
  value,
  onChange,
  placeholder = '選擇時間',
  disabled = false,
  error = false,
}: TimePickerProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [hour, setHour] = useState(() => parseTimeString(value).hour);
  const [minute, setMinute] = useState(() => parseTimeString(value).minute);

  // React 官方建議的「render 期間依 prop 變化調整 state」寫法（比照 DatePicker 既有邏輯，
  // 見 DatePicker/index.tsx 的 prevValue pattern）：用 prevValue 守衛避免無窮迴圈，
  // 換來的好處是不用多一次 useEffect + re-render 才能同步 value prop
  if (prevValue !== value) {
    setPrevValue(value);
    const next = parseTimeString(value);
    setHour(next.hour);
    setMinute(next.minute);
  }

  const handleSelectHour = (h: string) => {
    const newMinute = minute || '00';
    setHour(h);
    setMinute(newMinute);
    onChange(formatTimeString(h, newMinute));
  };

  const handleSelectMinute = (m: string) => {
    const newHour = hour || '00';
    setHour(newHour);
    setMinute(m);
    onChange(formatTimeString(newHour, m));
  };

  return (
    <div className={timePickerContainer}>
      <Popover>
        <Popover.Button
          className={timeInput({ error, disabled })}
          type="button"
          aria-label="選擇時間"
          aria-invalid={error}
          disabled={disabled}
        >
          <div>
            {value ? (
              <span className={timeDisplay}>{value}</span>
            ) : (
              <span className={placeholderText}>{placeholder}</span>
            )}
          </div>
          <ClockIcon
            width={18}
            height={18}
            color="var(--color-text-secondary)"
            aria-hidden="true"
          />
        </Popover.Button>

        <Popover.Panel className={popoverPanel}>
          <TimeView
            hour={hour}
            minute={minute}
            onSelectHour={handleSelectHour}
            onSelectMinute={handleSelectMinute}
          />
        </Popover.Panel>
      </Popover>
    </div>
  );
}
