import { css, cva } from '@/styled-system/css';

const tabNav = css({
  display: 'flex',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  padding: '1',
});

const tabButton = cva({
  base: {
    flex: 1,
    paddingY: '2',
    paddingX: '4',
    borderRadius: 'radius.md',
    textStyle: 'button',
    fontWeight: 'semibold',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1',
  },
  variants: {
    active: {
      true: {
        background: 'color.background.primary',
        color: 'color.text.primary',
        boxShadow: 'shadow.sm',
      },
      false: {
        background: 'transparent',
        color: 'color.text.secondary',
        '&:hover': {
          background: 'color.border.light',
        },
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});

interface TabNavigationProps {
  activeTab: 'birthday' | 'events';
  onTabChange: (tab: 'birthday' | 'events') => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      onTabChange('events');
    } else if (e.key === 'ArrowRight') {
      onTabChange('birthday');
    } else if (e.key === 'Home') {
      e.preventDefault();
      onTabChange('events');
    } else if (e.key === 'End') {
      e.preventDefault();
      onTabChange('birthday');
    }
  };

  return (
    <nav className={tabNav} role="tablist" aria-label="內容分類">
      <button
        role="tab"
        aria-selected={activeTab === 'events'}
        aria-controls="events-panel"
        id="events-tab"
        tabIndex={activeTab === 'events' ? 0 : -1}
        className={tabButton({ active: activeTab === 'events' })}
        onClick={() => onTabChange('events')}
        onKeyDown={handleKeyDown}
      >
        生日應援
      </button>
      <button
        role="tab"
        aria-selected={activeTab === 'birthday'}
        aria-controls="birthday-panel"
        id="birthday-tab"
        tabIndex={activeTab === 'birthday' ? 0 : -1}
        className={tabButton({ active: activeTab === 'birthday' })}
        onClick={() => onTabChange('birthday')}
        onKeyDown={handleKeyDown}
      >
        壽星
      </button>
    </nav>
  );
}
