import { css, cva } from '@/styled-system/css';
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

type YearViewProps = {
  goToPreviousYearList: () => void;
  goToNextYearList: () => void;
  headerText: string;
  handleYearMonthClick: () => void;
  selectYear: (year: number) => void;
  currentDate: Date;
};

const YearView = ({
  goToPreviousYearList,
  goToNextYearList,
  headerText,
  handleYearMonthClick,
  selectYear,
  currentDate,
}: YearViewProps) => {
  return (
    <>
      <NavigationHeader
        goToPrevious={goToPreviousYearList}
        goToNext={goToNextYearList}
        headerText={headerText}
        isPreviousDisabled={false}
        isNextDisabled={false}
        handleHeaderTextClick={handleYearMonthClick}
      />

      <div className={yearMonthGrid}>
        {Array.from({ length: 12 }, (_, i) => {
          const year = currentDate.getFullYear() - 6 + i;
          return (
            <button
              key={year}
              type="button"
              className={yearMonthButton({
                isSelected: year === new Date().getFullYear(),
              })}
              onClick={() => selectYear(year)}
            >
              {year}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default YearView;
