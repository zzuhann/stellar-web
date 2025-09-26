import { css, cva } from '@/styled-system/css';

const tabContainer = css({
  marginBottom: '16px',
});

const tabNav = css({
  display: 'flex',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'var(--radius-lg)',
  padding: '4px',
});

const tabButton = cva({
  base: {
    flex: 1,
    padding: '8px 16px',
    borderRadius: 'radius.md',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: 'none',
    position: 'relative',
  },
  variants: {
    active: {
      true: {
        background: 'color.primary',
        color: 'white',
        '&:hover': {
          background: 'color.primary',
        },
      },
      false: {
        background: 'transparent',
        color: 'color.text.primary',
        '&:hover': {
          background: 'color.border.light',
        },
      },
    },
  },
});

type TabNavProps = {
  activeTab: 'event' | 'artist';
  handleTabChange: (tab: 'event' | 'artist') => void;
};

const TabNav = ({ activeTab, handleTabChange }: TabNavProps) => {
  return (
    <div className={tabContainer}>
      <nav className={tabNav}>
        <button
          className={tabButton({ active: activeTab === 'event' })}
          onClick={() => handleTabChange('event')}
        >
          生日應援投稿
        </button>
        <button
          className={tabButton({ active: activeTab === 'artist' })}
          onClick={() => handleTabChange('artist')}
        >
          偶像投稿
        </button>
      </nav>
    </div>
  );
};

export default TabNav;
