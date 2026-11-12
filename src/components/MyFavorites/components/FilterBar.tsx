import { css } from '@/styled-system/css';
import FormDropdown from '@/components/forms/FormDropdown';
import type { SortByOption } from '../queryState';

const container = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
  minWidth: 0,
  '& [role="listbox"]': {
    width: 'max-content',
    minWidth: '200px',
    maxWidth: 'min(320px, calc(100vw - 32px))',
    padding: '1',
    borderRadius: 'radius.lg',
    borderColor: 'color.border.light',
    boxShadow: 'shadow.md',
    overflowX: 'hidden',
  },
  '& [role="option"]': {
    position: 'relative',
    display: 'block',
    textStyle: 'bodySmall',
    paddingX: '3',
    paddingRight: '8',
    borderRadius: 'radius.sm',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '&[aria-selected="true"]': {
      background: 'color.background.secondary',
      color: 'color.primary',
      '&::after': {
        content: '"✓"',
        position: 'absolute',
        right: '3',
        top: '50%',
        transform: 'translateY(-50%)',
      },
    },
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'color.primary',
      outlineOffset: '-2px',
    },
  },
});
const toolbar = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '4',
});
const artistControl = css({
  minWidth: '0',
  flex: '1',
  '& > div > button': {
    border: 'none',
    paddingX: '0',
    background: 'transparent',
    textStyle: 'bodySmall',
    fontWeight: 'semibold',
    justifyContent: 'flex-start',
  },
});
const sortControl = css({
  width: '120px',
  flexShrink: '0',
  '& [role="listbox"]': { left: 'auto', right: '0', minWidth: '180px' },
  '& > div > button': {
    border: 'none',
    paddingX: '0',
    background: 'transparent',
    textStyle: 'bodySmall',
    color: 'color.text.secondary',
    justifyContent: 'flex-end',
  },
});
const checkboxLabel = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  minHeight: '44px',
  textStyle: 'bodySmall',
  cursor: 'pointer',
});
const checkbox = css({ width: '18px', height: '18px', accentColor: 'color.primary' });
const sortOptions: { value: SortByOption; label: string }[] = [
  { value: 'favorited-desc', label: '最新加入' },
  { value: 'favorited-asc', label: '最早加入' },
  { value: 'startTime-asc', label: '活動由近到遠' },
  { value: 'startTime-desc', label: '活動由遠到近' },
];
interface FilterBarProps {
  artists: { id: string; name: string }[];
  artistId: string;
  onArtistChange: (id: string) => void;
  showOnlyActive: boolean;
  onShowOnlyActiveChange: (show: boolean) => void;
  sortBy: SortByOption;
  onSortByChange: (sortBy: SortByOption) => void;
}
export default function FilterBar({
  artists,
  artistId,
  onArtistChange,
  showOnlyActive,
  onShowOnlyActiveChange,
  sortBy,
  onSortByChange,
}: FilterBarProps) {
  return (
    <div className={container}>
      <div className={toolbar}>
        <div className={artistControl}>
          <FormDropdown
            label="顯示藝人"
            value={artistId}
            placeholder="此藝人已不在清單中"
            options={[
              { value: '', label: '全部藝人' },
              ...artists.map((artist) => ({ value: artist.id, label: artist.name })),
            ]}
            onChange={onArtistChange}
          />
        </div>
        <div className={sortControl}>
          <FormDropdown
            label="排序方式"
            value={sortBy}
            options={sortOptions}
            onChange={onSortByChange}
          />
        </div>
      </div>
      <label className={checkboxLabel}>
        <input
          className={checkbox}
          type="checkbox"
          checked={showOnlyActive}
          onChange={(event) => onShowOnlyActiveChange(event.target.checked)}
        />
        只顯示未結束的應援
      </label>
    </div>
  );
}
