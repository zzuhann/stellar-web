import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';

const calendarHeader = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px',
});

const navigationButton = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  background: 'color.background.primary',
  color: 'color.text.primary',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'color.background.secondary',
    borderColor: 'color.border.medium',
  },
  '&:disabled': {
    opacity: '0.5',
    cursor: 'not-allowed',
  },
});

const monthYearDisplay = css({
  fontSize: '16px',
  fontWeight: '600',
  color: 'color.text.primary',
  margin: '0',
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: 'radius.md',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'color.background.secondary',
  },
});

type NavigationHeaderProps = {
  goToPrevious: () => void;
  goToNext: () => void;
  headerText: string;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
  handleHeaderTextClick: () => void;
};

const NavigationHeader = ({
  goToPrevious,
  goToNext,
  headerText,
  isPreviousDisabled,
  isNextDisabled,
  handleHeaderTextClick,
}: NavigationHeaderProps) => {
  return (
    <div className={calendarHeader}>
      <button
        type="button"
        className={navigationButton}
        onClick={goToPrevious}
        disabled={isPreviousDisabled}
        aria-label="上一個"
      >
        <ChevronLeftIcon width={16} height={16} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={`${headerText}，點擊可切換年月檢視`}
        className={monthYearDisplay}
        onClick={handleHeaderTextClick}
      >
        {headerText}
      </button>
      <button
        type="button"
        className={navigationButton}
        onClick={goToNext}
        disabled={isNextDisabled}
        aria-label="下一個"
      >
        <ChevronRightIcon width={16} height={16} aria-hidden="true" />
      </button>
    </div>
  );
};

export default NavigationHeader;
