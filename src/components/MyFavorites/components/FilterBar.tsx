import { css } from '@/styled-system/css';
import FormDropdown from '@/components/forms/FormDropdown';
import type { SortByOption } from '../queryState';

const container = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
  minWidth: 0,
  '& [role="listbox"]': { maxWidth: '100%' },
  '& [role="option"]': { whiteSpace: 'normal', overflowWrap: 'anywhere' },
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
  { value: 'favorited-desc', label: '加入時間：由新到舊' },
  { value: 'favorited-asc', label: '加入時間：由舊到新' },
  { value: 'startTime-asc', label: '活動時間：由早到晚' },
  { value: 'startTime-desc', label: '活動時間：由晚到早' },
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
      <FormDropdown
        label="排序方式"
        value={sortBy}
        options={sortOptions}
        onChange={onSortByChange}
      />
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
