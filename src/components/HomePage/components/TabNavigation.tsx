import { TabContainer, TabNav, TabButton } from './styles';

interface TabNavigationProps {
  activeTab: 'birthday' | 'events';
  onTabChange: (tab: 'birthday' | 'events') => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <TabContainer>
      <TabNav>
        <TabButton $active={activeTab === 'birthday'} onClick={() => onTabChange('birthday')}>
          壽星
        </TabButton>
        <TabButton $active={activeTab === 'events'} onClick={() => onTabChange('events')}>
          生日應援
        </TabButton>
      </TabNav>
    </TabContainer>
  );
}
