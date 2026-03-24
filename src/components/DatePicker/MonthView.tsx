import { css, cva } from '@/styled-system/css';
import { MONTHS } from './constant';
import NavigationHeader from './NavigationHeader';

const yearMonthGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '2',
  marginTop: '2',
});

const yearMonthButton = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingY: '2',
    paddingX: '1',
    border: '1px solid',
    borderColor: 'color.border.light',
    borderRadius: 'radius.md',
    background: 'color.background.primary',
    color: 'color.text.primary',
    textStyle: 'caption',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'color.background.secondary',
      borderColor: 'color.border.medium',
    },
    '@media (max-width: 410px)': {
      paddingY: '1.5',
      paddingX: '0.5',
    },
  },
  variants: {
    isSelected: {
      true: {
        background: 'color.primary',
        color: 'white',
        fontWeight: 'semibold',
        '&:hover': {
          background: 'color.primary',
        },
      },
    },
  },
});

type MonthViewProps = {
  goToPreviousYear: () => void;
  goToNextYear: () => void;
  headerText: string;
  handleYearMonthClick: () => void;
  selectMonth: (month: number) => void;
};

const MonthView = ({
  goToPreviousYear,
  goToNextYear,
  headerText,
  handleYearMonthClick,
  selectMonth,
}: MonthViewProps) => {
  return (
    <>
      <NavigationHeader
        goToPrevious={goToPreviousYear}
        goToNext={goToNextYear}
        headerText={headerText}
        isPreviousDisabled={false}
        isNextDisabled={false}
        handleHeaderTextClick={handleYearMonthClick}
      />

      <div className={yearMonthGrid} role="listbox" aria-label="選擇月份">
        {MONTHS.map((month, index) => {
          const isCurrentMonth = index === new Date().getMonth();
          return (
            <button
              key={index}
              type="button"
              role="option"
              className={yearMonthButton({
                isSelected: isCurrentMonth,
              })}
              onClick={() => selectMonth(index)}
              aria-selected={isCurrentMonth}
              aria-label={month}
            >
              {month}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default MonthView;
