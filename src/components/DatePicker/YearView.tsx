import { css, cva } from '@/styled-system/css';
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

      <div className={yearMonthGrid} role="listbox" aria-label="選擇年份">
        {Array.from({ length: 12 }, (_, i) => {
          const year = currentDate.getFullYear() - 6 + i;
          const isCurrentYear = year === new Date().getFullYear();
          return (
            <button
              key={year}
              type="button"
              role="option"
              className={yearMonthButton({
                isSelected: isCurrentYear,
              })}
              onClick={() => selectYear(year)}
              aria-selected={isCurrentYear}
              aria-label={`${year}年`}
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
