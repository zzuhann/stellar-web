import { css, cva } from '@/styled-system/css';
import { WEEK_DAYS } from './constant';
import { getDaysInMonth, isDisabled, isSelected, isToday } from './utils';
import NavigationHeader from './NavigationHeader';

const weekDaysHeader = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '4px',
  marginBottom: '8px',
});

const weekDay = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: '500',
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
  gap: '4px',
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
    fontSize: '13px',
    fontWeight: '400',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover:not(:disabled)': {
      background: 'color.background.secondary',
    },
    '&:focus': {
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(90, 125, 154, 0.2)',
    },
    '@media (max-width: 410px)': {
      width: '28px',
      height: '28px',
      fontSize: '12px',
    },
  },
  variants: {
    isSelected: {
      true: {
        background: 'color.primary',
        color: 'white',
        fontWeight: '600',
        '&:hover:not(:disabled)': {
          background: 'color.primary',
        },
      },
    },
    isToday: {
      true: {
        background: 'color.background.secondary',
        fontWeight: '600',
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

  return (
    <>
      <NavigationHeader
        goToPrevious={goToPreviousMonth}
        goToNext={goToNextMonth}
        headerText={monthYearText}
        isPreviousDisabled={
          !!(
            min &&
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1) < new Date(min)
          )
        }
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

      <div className={daysGrid}>
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          return (
            <button
              key={index}
              type="button"
              className={dayButton({
                isSelected: isSelected(day, value),
                isToday: isToday(day),
                isOtherMonth: !isCurrentMonth,
                isDisabled: isDisabled({ date: day, min, max }),
              })}
              onClick={() => handleDateSelect(day, handleClose)}
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
