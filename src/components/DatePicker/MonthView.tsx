import { css, cva } from '@/styled-system/css';
import { MONTHS } from './constant';
import NavigationHeader from './NavigationHeader';

const yearMonthGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '8px',
  marginTop: '8px',
});

const yearMonthButton = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 4px',
    border: '1px solid',
    borderColor: 'color.border.light',
    borderRadius: 'radius.md',
    background: 'color.background.primary',
    color: 'color.text.primary',
    fontSize: '13px',
    fontWeight: '400',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'color.background.secondary',
      borderColor: 'color.border.medium',
    },
    '@media (max-width: 410px)': {
      fontSize: '12px',
      padding: '6px 2px',
    },
  },
  variants: {
    isSelected: {
      true: {
        background: 'color.primary',
        color: 'white',
        fontWeight: '600',
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

      <div className={yearMonthGrid}>
        {MONTHS.map((month, index) => (
          <button
            key={index}
            type="button"
            className={yearMonthButton({
              isSelected: index === new Date().getMonth(),
            })}
            onClick={() => selectMonth(index)}
          >
            {month}
          </button>
        ))}
      </div>
    </>
  );
};

export default MonthView;
