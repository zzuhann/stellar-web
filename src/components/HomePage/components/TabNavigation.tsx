import { css, cva } from '@/styled-system/css';

const tabContainer = css({
  marginBottom: '8px',
});

const tabNav = css({
  display: 'flex',
  background: 'var(--color-bg-secondary)',
  border: '1px solid var(--color-border-light)',
  borderRadius: 'var(--radius-lg)',
  padding: '4px',
});

const tabButton = cva({
  base: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  variants: {
    active: {
      true: {
        background: 'var(--color-primary)',
        color: 'white',
        '&:hover': {
          background: 'var(--color-primary)',
        },
      },
      false: {
        background: 'transparent',
        color: 'var(--color-text-primary)',
        '&:hover': {
          background: 'var(--color-border-light)',
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
  return (
    <div className={tabContainer}>
      <nav className={tabNav}>
        <button
          className={tabButton({ active: activeTab === 'birthday' })}
          onClick={() => onTabChange('birthday')}
        >
          壽星
        </button>
        <button
          className={tabButton({ active: activeTab === 'events' })}
          onClick={() => onTabChange('events')}
        >
          生日應援
        </button>
      </nav>
    </div>
  );
}
