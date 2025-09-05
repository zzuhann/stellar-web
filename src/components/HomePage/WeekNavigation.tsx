import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { WeekNavigationContainer, WeekNavigationButton, WeekInfo } from './styles';
import { formatDate, getWeekStart } from '@/utils/weekHelpers';
import TabNavigation from './TabNavigation';

interface WeekNavigationProps {
  currentWeekStart: Date;
  currentWeekEnd: Date;
  isCurrentWeek: boolean;
  activeTab: 'birthday' | 'events';
  onPreviousWeek: () => void;
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
      <WeekNavigationContainer>
        <WeekNavigationButton
          onClick={onPreviousWeek}
          $disabled={!canGoToPrevious}
          style={{ opacity: canGoToPrevious ? 1 : 0.5 }}
        >
          <ChevronLeftIcon />
        </WeekNavigationButton>

        <WeekInfo>
          <div className="title">
            {activeTab === 'birthday'
              ? isCurrentWeek
                ? '本週壽星'
                : '當週壽星'
              : isCurrentWeek
                ? '本週生日應援'
                : '當週生日應援'}
          </div>
          <div className="date-range">
            {formatDate(currentWeekStart)} - {formatDate(currentWeekEnd)}
          </div>
        </WeekInfo>

        <WeekNavigationButton onClick={onNextWeek}>
          <ChevronRightIcon />
        </WeekNavigationButton>
      </WeekNavigationContainer>
    </div>
  );
}
