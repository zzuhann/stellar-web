import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { formatDate, getWeekStart } from '@/utils/weekHelpers';
import TabNavigation from './TabNavigation';
import { css } from '@/styled-system/css';
import { cva } from '@/styled-system/css';
import { sendGAEvent } from '@next/third-parties/google';
import { useAuth } from '@/lib/auth-context';

const stickyWrapper = css({
  position: 'sticky',
  top: '70px',
  zIndex: 20,
  backdropFilter: 'blur(10px)',
  background: 'rgba(255, 255, 255, 0.96)',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  marginX: '-8',
  paddingX: '8',
  paddingBottom: '3',
  '@media (min-width: 768px)': {
    marginX: '-6',
    paddingX: '6',
  },
});

const weekNavigationRow = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingY: '3',
});

const weekNavigationButton = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: 'radius.md',
    transition: 'all 0.2s ease',
  },
  variants: {
    disabled: {
      true: {
        color: 'color.text.disabled',
        cursor: 'not-allowed',
        opacity: 0.5,
      },
      false: {
        color: 'color.text.primary',
        cursor: 'pointer',
        opacity: 1,
      },
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

const weekInfoContainer = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  flex: 1,
});

const weekLabel = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
});

const weekDateRange = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

const navButtonGroup = css({
  display: 'flex',
  gap: '1',
});

interface WeekNavigationProps {
  currentWeekStart: Date;
  currentWeekEnd: Date;
  isCurrentWeek: boolean;
  activeTab: 'birthday' | 'events';
  onPreviousWeek: (activeTab: 'birthday' | 'events') => void;
  onNextWeek: () => void;
  onTabChange: (tab: 'birthday' | 'events') => void;
}

export default function WeekNavigation({
  currentWeekStart,
  currentWeekEnd,
  isCurrentWeek,
  activeTab,
  onPreviousWeek,
  onNextWeek,
  onTabChange,
}: WeekNavigationProps) {
  const { user } = useAuth();

  const thisWeekStart = getWeekStart(new Date());
  const canGoToPrevious =
    activeTab === 'birthday' || currentWeekStart.getTime() > thisWeekStart.getTime();

  const handlePreviousWeek = () => {
    sendGAEvent('event', 'navigate_previous_week', {
      event_page: '/',
      user_id: user?.uid ?? '',
    });
    onPreviousWeek(activeTab);
  };

  const handleNextWeek = () => {
    sendGAEvent('event', 'navigate_next_week', {
      event_page: '/',
      user_id: user?.uid ?? '',
    });
    onNextWeek();
  };

  return (
    <div className={stickyWrapper}>
      <div className={weekNavigationRow}>
        <div className={weekInfoContainer}>
          <span className={weekLabel}>{isCurrentWeek ? '本週' : '當週'}</span>
          <span className={weekDateRange}>
            {formatDate(currentWeekStart)} - {formatDate(currentWeekEnd)}
          </span>
        </div>

        <div className={navButtonGroup}>
          <button
            className={weekNavigationButton({ disabled: !canGoToPrevious })}
            onClick={handlePreviousWeek}
            disabled={!canGoToPrevious}
            aria-label="前往上一週"
            aria-disabled={!canGoToPrevious}
          >
            <ChevronLeftIcon width={20} height={20} aria-hidden="true" />
          </button>
          <button
            className={weekNavigationButton({ disabled: false })}
            onClick={handleNextWeek}
            aria-label="前往下一週"
          >
            <ChevronRightIcon width={20} height={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
