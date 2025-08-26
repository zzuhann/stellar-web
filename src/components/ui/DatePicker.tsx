'use client';

import { useState, useEffect } from 'react';
import { Popover } from '@headlessui/react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import styled from 'styled-components';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

const DatePickerContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DateInput = styled.button<{ $error?: boolean; $disabled?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${(props) => (props.$error ? '#ef4444' : 'var(--color-border-light)')};
  border-radius: var(--radius-lg);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(props) => (props.$disabled ? 0.6 : 1)};

  &:hover:not(:disabled) {
    border-color: var(--color-border-medium);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(90, 125, 154, 0.1);
  }

  @media (min-width: 768px) {
    padding: 14px 18px;
    font-size: 15px;
  }
`;

const DateDisplay = styled.span`
  color: var(--color-text-primary);
`;

const PlaceholderText = styled.span`
  color: var(--color-text-secondary);
`;

const CalendarIconStyled = styled(CalendarIcon)`
  width: 18px;
  height: 18px;
  color: var(--color-text-secondary);
`;

const PopoverPanel = styled(Popover.Panel)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 4px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 12px;
  min-width: 280px;
  max-width: 100vw;

  @media (max-width: 410px) {
    left: -8px;
    right: -8px;
    padding: 8px;
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const MonthYearDisplay = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-secondary);
  }
`;

const NavigationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-secondary);
    border-color: var(--color-border-medium);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const YearMonthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
`;

const YearMonthButton = styled.button<{ $isSelected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: ${(props) =>
    props.$isSelected ? 'var(--color-primary)' : 'var(--color-bg-primary)'};
  color: ${(props) => (props.$isSelected ? 'white' : 'var(--color-text-primary)')};
  font-size: 13px;
  font-weight: ${(props) => (props.$isSelected ? '600' : '400')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.$isSelected ? 'var(--color-primary)' : 'var(--color-bg-secondary)'};
    border-color: var(--color-border-medium);
  }

  @media (max-width: 410px) {
    font-size: 12px;
    padding: 6px 2px;
  }
`;

const WeekDaysHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
`;

const WeekDay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  height: 32px;
  width: 32px;

  @media (max-width: 410px) {
    height: 28px;
    width: 28px;
  }
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const DayButton = styled.button<{
  $isSelected?: boolean;
  $isToday?: boolean;
  $isOtherMonth?: boolean;
  $isDisabled?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  background: ${(props) => {
    if (props.$isSelected) return 'var(--color-primary)';
    if (props.$isToday) return 'var(--color-bg-secondary)';
    return 'transparent';
  }};
  color: ${(props) => {
    if (props.$isSelected) return 'white';
    if (props.$isOtherMonth) return 'var(--color-text-disabled)';
    if (props.$isDisabled) return 'var(--color-text-disabled)';
    return 'var(--color-text-primary)';
  }};
  font-size: 13px;
  font-weight: ${(props) => (props.$isSelected || props.$isToday ? '600' : '400')};
  cursor: ${(props) => (props.$isDisabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${(props) => {
      if (props.$isSelected) return 'var(--color-primary)';
      return 'var(--color-bg-secondary)';
    }};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(90, 125, 154, 0.2);
  }

  @media (max-width: 410px) {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
`;

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

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

  // 當 value 改變時更新 currentDate
  useEffect(() => {
    if (value) {
      setCurrentDate(new Date(value));
    }
  }, [value]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!value) return false;
    const selectedDate = new Date(value);
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isDisabled = (date: Date) => {
    if (min) {
      const minDate = new Date(min);
      // 只比較日期部分，忽略時間
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
      if (dateOnly < minDateOnly) return true;
    }
    if (max) {
      const maxDate = new Date(max);
      // 只比較日期部分，忽略時間
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const maxDateOnly = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
      if (dateOnly > maxDateOnly) return true;
    }
    return false;
  };

  const handleDateSelect = (date: Date, close: () => void) => {
    if (isDisabled(date)) return;

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

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthYearText = currentDate.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <DatePickerContainer>
      <Popover>
        {({ open: _open, close }) => (
          <>
            <Popover.Button as={DateInput} $error={error} $disabled={disabled} type="button">
              <div>
                {value ? (
                  <DateDisplay>{formatDisplayDate(value)}</DateDisplay>
                ) : (
                  <PlaceholderText>{placeholder}</PlaceholderText>
                )}
              </div>
              <CalendarIconStyled />
            </Popover.Button>

            <PopoverPanel>
              {viewMode === 'calendar' && (
                <>
                  <CalendarHeader>
                    <NavigationButton
                      type="button"
                      onClick={goToPreviousMonth}
                      disabled={
                        !!(
                          min &&
                          new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1) <
                            new Date(min)
                        )
                      }
                    >
                      <ChevronLeftIcon />
                    </NavigationButton>
                    <MonthYearDisplay onClick={handleYearMonthClick}>
                      {monthYearText}
                    </MonthYearDisplay>
                    <NavigationButton
                      type="button"
                      onClick={goToNextMonth}
                      disabled={
                        !!(
                          max &&
                          new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1) >
                            new Date(max)
                        )
                      }
                    >
                      <ChevronRightIcon />
                    </NavigationButton>
                  </CalendarHeader>

                  <WeekDaysHeader>
                    {weekDays.map((day) => (
                      <WeekDay key={day}>{day}</WeekDay>
                    ))}
                  </WeekDaysHeader>

                  <DaysGrid>
                    {days.map((day, index) => {
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                      return (
                        <DayButton
                          key={index}
                          type="button"
                          onClick={() => handleDateSelect(day, close)}
                          $isSelected={isSelected(day)}
                          $isToday={isToday(day)}
                          $isOtherMonth={!isCurrentMonth}
                          $isDisabled={isDisabled(day)}
                        >
                          {day.getDate()}
                        </DayButton>
                      );
                    })}
                  </DaysGrid>
                </>
              )}

              {viewMode === 'year' && (
                <>
                  <CalendarHeader>
                    <NavigationButton
                      type="button"
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear() - 12, 0, 1))}
                    >
                      <ChevronLeftIcon />
                    </NavigationButton>
                    <MonthYearDisplay onClick={handleYearMonthClick}>
                      {currentDate.getFullYear() - 6} - {currentDate.getFullYear() + 5}
                    </MonthYearDisplay>
                    <NavigationButton
                      type="button"
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear() + 12, 0, 1))}
                    >
                      <ChevronRightIcon />
                    </NavigationButton>
                  </CalendarHeader>

                  <YearMonthGrid>
                    {Array.from({ length: 12 }, (_, i) => {
                      const year = currentDate.getFullYear() - 6 + i;
                      return (
                        <YearMonthButton
                          key={year}
                          type="button"
                          onClick={() => selectYear(year)}
                          $isSelected={year === new Date().getFullYear()}
                        >
                          {year}
                        </YearMonthButton>
                      );
                    })}
                  </YearMonthGrid>
                </>
              )}

              {viewMode === 'month' && (
                <>
                  <CalendarHeader>
                    <NavigationButton
                      type="button"
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1))}
                    >
                      <ChevronLeftIcon />
                    </NavigationButton>
                    <MonthYearDisplay onClick={handleYearMonthClick}>
                      {currentDate.getFullYear()}
                    </MonthYearDisplay>
                    <NavigationButton
                      type="button"
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1))}
                    >
                      <ChevronRightIcon />
                    </NavigationButton>
                  </CalendarHeader>

                  <YearMonthGrid>
                    {[
                      '一月',
                      '二月',
                      '三月',
                      '四月',
                      '五月',
                      '六月',
                      '七月',
                      '八月',
                      '九月',
                      '十月',
                      '十一月',
                      '十二月',
                    ].map((month, index) => (
                      <YearMonthButton
                        key={index}
                        type="button"
                        onClick={() => selectMonth(index)}
                        $isSelected={index === new Date().getMonth()}
                      >
                        {month}
                      </YearMonthButton>
                    ))}
                  </YearMonthGrid>
                </>
              )}
            </PopoverPanel>
          </>
        )}
      </Popover>
    </DatePickerContainer>
  );
}
