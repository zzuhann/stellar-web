'use client';

import { useState, useEffect } from 'react';
import { Popover } from '@headlessui/react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import CalendarView from './CalendarView';
import { formatDisplayDate, isDisabled } from './utils';
import YearView from './YearView';
import MonthView from './MonthView';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

const datePickerContainer = css({
  position: 'relative',
  width: '100%',
});

const dateInput = cva({
  base: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid',
    borderColor: 'color.border.light',
    borderRadius: 'radius.lg',
    background: 'color.background.primary',
    color: 'color.text.primary',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    opacity: '1',
    '&:hover:not(:disabled)': {
      borderColor: 'color.border.medium',
    },
    '&:focus': {
      outline: 'none',
      borderColor: 'color.primary',
      boxShadow: '0 0 0 3px rgba(90, 125, 154, 0.1)',
    },
    '@media (min-width: 768px)': {
      padding: '14px 18px',
      fontSize: '15px',
    },
  },
  variants: {
    error: {
      true: {
        borderColor: '#ef4444',
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

const dateDisplay = css({
  color: 'color.text.primary',
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
  marginTop: '4px',
  background: 'color.background.primary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  boxShadow: 'shadow.lg',
  padding: '12px',
  minWidth: '280px',
  maxWidth: '100vw',
  '@media (max-width: 410px)': {
    left: '-8px',
    right: '-8px',
    padding: '8px',
  },
});

export default function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = '選擇日期',
  disabled = false,
  error = false,
}: DatePickerProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      return new Date(value);
    }
    return new Date();
  });

  const [viewMode, setViewMode] = useState<'calendar' | 'year' | 'month'>('calendar');

  const handleDateSelect = (date: Date, close: () => void) => {
    if (isDisabled({ date, min, max })) return;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    onChange(dateString);
    close();
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToPreviousYearList = () => {
    setCurrentDate(new Date(currentDate.getFullYear() - 12, 0, 1));
  };

  const goToNextYearList = () => {
    setCurrentDate(new Date(currentDate.getFullYear() + 12, 0, 1));
  };

  const goToPreviousYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1));
  };

  const goToNextYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1));
  };

  const handleYearMonthClick = () => {
    setViewMode(viewMode === 'calendar' ? 'year' : 'calendar');
  };

  const selectYear = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setViewMode('month');
  };

  const selectMonth = (month: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
    setViewMode('calendar');
  };

  // 當 value 改變時更新 currentDate
  useEffect(() => {
    if (value) {
      setCurrentDate(new Date(value));
    }
  }, [value]);

  return (
    <div className={datePickerContainer}>
      <Popover>
        {({ open: _open, close }) => (
          <>
            <Popover.Button
              className={dateInput({ error, disabled })}
              type="button"
              aria-label="選擇日期"
            >
              <div>
                {value ? (
                  <span className={dateDisplay}>{formatDisplayDate(value)}</span>
                ) : (
                  <span className={placeholderText}>{placeholder}</span>
                )}
              </div>
              <CalendarIcon width={18} height={18} color="var(--color-text-secondary)" />
            </Popover.Button>

            <Popover.Panel className={popoverPanel}>
              {viewMode === 'calendar' && (
                <CalendarView
                  currentDate={currentDate}
                  value={value}
                  min={min}
                  max={max}
                  goToPreviousMonth={goToPreviousMonth}
                  goToNextMonth={goToNextMonth}
                  handleYearMonthClick={handleYearMonthClick}
                  handleDateSelect={handleDateSelect}
                  handleClose={close}
                />
              )}

              {viewMode === 'year' && (
                <YearView
                  goToPreviousYearList={goToPreviousYearList}
                  goToNextYearList={goToNextYearList}
                  headerText={`${currentDate.getFullYear() - 6} - ${currentDate.getFullYear() + 5}`}
                  handleYearMonthClick={handleYearMonthClick}
                  selectYear={selectYear}
                  currentDate={currentDate}
                />
              )}

              {viewMode === 'month' && (
                <MonthView
                  goToPreviousYear={goToPreviousYear}
                  goToNextYear={goToNextYear}
                  headerText={currentDate.getFullYear().toString()}
                  handleYearMonthClick={handleYearMonthClick}
                  selectMonth={selectMonth}
                />
              )}
            </Popover.Panel>
          </>
        )}
      </Popover>
    </div>
  );
}
