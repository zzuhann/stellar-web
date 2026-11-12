import { css } from '@/styled-system/css';
import FormDropdown from '@/components/forms/FormDropdown';
import type { SortByOption } from '../queryState';

const container = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
  minWidth: 0,
  '& [role="listbox"]': { maxWidth: '100%' },
  '& [role="option"]': { whiteSpace: 'normal', overflowWrap: 'anywhere' },
});
const toolbar = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '4',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
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
