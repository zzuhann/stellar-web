import { css, cva } from '@/styled-system/css';

const tabContainer = css({
  marginBottom: '4',
});

const tabNav = css({
  display: 'flex',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'var(--radius-lg)',
  padding: '1',
});

const tabButton = cva({
  base: {
    flex: 1,
    paddingY: '2',
    paddingX: '4',
    borderRadius: 'radius.md',
    textStyle: 'bodySmall',
    fontWeight: 'semibold',
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
