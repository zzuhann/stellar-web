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
    transition: 'background 0.2s ease, color 0.2s ease',
    cursor: 'pointer',
    border: 'none',
    position: 'relative',
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'color.primary',
      outlineOffset: '2px',
    },
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
      <div role="tablist" className={tabNav}>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'event'}
          className={tabButton({ active: activeTab === 'event' })}
          onClick={() => handleTabChange('event')}
        >
          生日應援投稿
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'artist'}
          className={tabButton({ active: activeTab === 'artist' })}
          onClick={() => handleTabChange('artist')}
        >
          藝人投稿
        </button>
      </div>
    </div>
  );
};

export default TabNav;
