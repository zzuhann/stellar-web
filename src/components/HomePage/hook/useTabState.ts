import { useQueryState } from '@/hooks/useQueryState';
import { getWeekStart } from '@/utils/weekHelpers';
import useWeekNavigation from './useWeekNavigation';
import { useQueryStateContextMergeUpdates } from '@/hooks/useQueryStateContext';
import { sendGAEvent } from '@next/third-parties/google';
import { useAuth } from '@/lib/auth-context';

const useTabState = () => {
  const { currentWeekStart, setCurrentWeekStart } = useWeekNavigation();
  const { mergeUpdates } = useQueryStateContextMergeUpdates();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useQueryState('tab', {
    defaultValue: 'birthday' as 'birthday' | 'events',
    parse: (value) => {
      return value === 'birthday' || value === 'events' ? value : 'birthday';
    },
  });

  const handleTabChange = (tab: 'birthday' | 'events') => {
    // GA4 埋點
    const eventName = tab === 'birthday' ? 'switch_to_artist_tab' : 'switch_to_event_tab';
    sendGAEvent('event', eventName, {
      event_page: '/',
      user_id: user?.uid ?? '',
    });

    // 如果切換到生咖tab且當前在看過去的週，需要同時更新 tab 和 week
    if (tab === 'events') {
      const thisWeekStart = getWeekStart(new Date());
      if (currentWeekStart.getTime() < thisWeekStart.getTime()) {
        mergeUpdates(() => {
          setActiveTab(tab);
          setCurrentWeekStart(thisWeekStart);
        });
        return;
      }
    }

    // 其他情況只需要更新 tab
    setActiveTab(tab);
  };

  return {
    activeTab,
    handleTabChange,
  };
};

export default useTabState;
