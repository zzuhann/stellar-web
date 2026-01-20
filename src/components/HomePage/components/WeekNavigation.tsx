import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { formatDate, getWeekStart } from '@/utils/weekHelpers';
import TabNavigation from './TabNavigation';
import { css } from '@/styled-system/css';
import { cva } from '@/styled-system/css';

const weekNavigationContainer = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 16px',
  background: 'color.background.secondary',
  borderRadius: 'radius.lg',
  border: '1px solid',
  borderColor: 'color.border.light',
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
  textAlign: 'center',
  flex: 1,
  margin: '0 16px',
});

const weekInfoTitle = css({
  fontSize: '16px',
  fontWeight: 600,
  color: 'color.text.primary',
  margin: '0 0 4px 0',
});

const weekInfoDateRange = css({
  fontSize: '14px',
  color: 'color.text.secondary',
  margin: 0,
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
  // 計算本週開始時間，用於限制生咖tab的導航
  const thisWeekStart = getWeekStart(new Date());
  const canGoToPrevious =
    activeTab === 'birthday' || currentWeekStart.getTime() > thisWeekStart.getTime();

  return (
    <div>
      <TabNavigation activeTab={activeTab} onTabChange={onTabChange} />
      <div className={weekNavigationContainer}>
        <button
          className={weekNavigationButton({ disabled: !canGoToPrevious })}
          onClick={() => onPreviousWeek(activeTab)}
          disabled={!canGoToPrevious}
          aria-label="前往上一週"
          aria-disabled={!canGoToPrevious}
        >
          <ChevronLeftIcon width={20} height={20} aria-hidden="true" />
        </button>

        <div className={weekInfoContainer}>
          <h2 className={weekInfoTitle}>
            {activeTab === 'birthday'
              ? isCurrentWeek
                ? '本週壽星'
                : '當週壽星'
              : isCurrentWeek
                ? '本週生日應援'
                : '當週生日應援'}
          </h2>
          <p className={weekInfoDateRange}>
            {formatDate(currentWeekStart)} - {formatDate(currentWeekEnd)}
          </p>
        </div>

        <button
          className={weekNavigationButton({ disabled: false })}
          onClick={onNextWeek}
          aria-label="前往下一週"
        >
          <ChevronRightIcon width={20} height={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
