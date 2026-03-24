import { css, cva } from '@/styled-system/css';
import { WEEK_DAYS } from './constant';
import { getDaysInMonth, isDisabled, isSelected, isToday } from './utils';
import NavigationHeader from './NavigationHeader';

const weekDaysHeader = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '1',
  marginBottom: '2',
});

const weekDay = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textStyle: 'caption',
  fontWeight: 'medium',
  color: 'color.text.secondary',
  height: '32px',
  width: '32px',
  '@media (max-width: 410px)': {
    height: '28px',
    width: '28px',
  },
});

const daysGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '1',
});

const dayButton = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: 'radius.md',
    background: 'transparent',
    color: 'color.text.primary',
    textStyle: 'caption',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover:not(:disabled)': {
      background: 'color.background.secondary',
    },
    '&:focus': {
      outline: 'none',
      boxShadow: '0 0 0 2px var(--colors-alpha-primary-20)',
    },
    '@media (max-width: 410px)': {
      width: '28px',
      height: '28px',
      textStyle: 'caption',
    },
  },
  variants: {
    isSelected: {
      true: {
        background: 'color.primary',
        color: 'white',
        fontWeight: 'semibold',
        '&:hover:not(:disabled)': {
          background: 'color.primary',
        },
      },
    },
    isToday: {
      true: {
        background: 'color.background.secondary',
        fontWeight: 'semibold',
      },
    },
    isOtherMonth: {
      true: {
        color: 'color.text.disabled',
      },
    },
    isDisabled: {
      true: {
        color: 'color.text.disabled',
        cursor: 'not-allowed',
      },
    },
  },
});

type CalendarViewProps = {
  currentDate: Date;
  min?: string;
  max?: string;
  value: string;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  handleYearMonthClick: () => void;
  handleDateSelect: (date: Date, close: () => void) => void;
  handleClose: () => void;
};

const CalendarView = ({
  currentDate,
  min,
  max,
  value,
  goToPreviousMonth,
  goToNextMonth,
  handleYearMonthClick,
  handleDateSelect,
  handleClose,
}: CalendarViewProps) => {
  const days = getDaysInMonth(currentDate);
  const monthYearText = currentDate.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
  });

  const lastDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
  let isPreviousDisabled = false;
  if (min) {
    const lastOnly = new Date(
      lastDayOfPreviousMonth.getFullYear(),
      lastDayOfPreviousMonth.getMonth(),
      lastDayOfPreviousMonth.getDate()
    );
    const minDate = new Date(min);
    const minOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    isPreviousDisabled = lastOnly < minOnly;
  }

  return (
    <>
      <NavigationHeader
        goToPrevious={goToPreviousMonth}
        goToNext={goToNextMonth}
        headerText={monthYearText}
        isPreviousDisabled={isPreviousDisabled}
        isNextDisabled={
          !!(
            max &&
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1) > new Date(max)
          )
        }
        handleHeaderTextClick={handleYearMonthClick}
      />

      <div className={weekDaysHeader}>
        {WEEK_DAYS.map((day) => (
          <div key={day} className={weekDay}>
            {day}
          </div>
        ))}
      </div>

      <div className={daysGrid} role="grid" aria-label="日曆">
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const dayDisabled = isDisabled({ date: day, min, max });
          const daySelected = isSelected(day, value);
          const fullDateLabel = day.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          return (
            <button
              key={index}
              type="button"
              className={dayButton({
                isSelected: daySelected,
                isToday: !daySelected && isToday(day),
                isOtherMonth: !isCurrentMonth,
                isDisabled: dayDisabled,
              })}
              onClick={() => handleDateSelect(day, handleClose)}
              disabled={dayDisabled}
              aria-label={fullDateLabel}
              aria-selected={daySelected}
              aria-disabled={dayDisabled}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default CalendarView;
