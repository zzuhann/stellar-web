import { useState, useMemo } from 'react';
import { css } from '@/styled-system/css';
import { Artist } from '@/types';
import { SortByOption } from '../queryState';

const filterBarContainer = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px',
  background: 'white',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
});

const filterRow = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  '@media (min-width: 768px)': {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const filterLabel = css({
  fontSize: '14px',
  fontWeight: '600',
  color: 'color.text.primary',
  minWidth: '80px',
});

const filterControl = css({
  flex: 1,
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
});

const selectInput = css({
  flex: 1,
  minWidth: '120px',
  padding: '8px 12px',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  fontSize: '14px',
  background: 'white',
  color: 'color.text.primary',
  cursor: 'pointer',
  '&:focus': {
    outline: 'none',
    borderColor: 'color.primary',
  },
});

const multiSelectContainer = css({
  position: 'relative',
  flex: 1,
});

const multiSelectButton = css({
  width: '100%',
  padding: '8px 12px',
  borderRadius: 'radius.md',
  border: '1px solid',
  borderColor: 'color.border.light',
  fontSize: '14px',
  background: 'white',
  color: 'color.text.primary',
  cursor: 'pointer',
  textAlign: 'left',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '&:focus': {
    outline: 'none',
    borderColor: 'color.primary',
  },
});

const multiSelectDropdown = css({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  right: 0,
  background: 'white',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  maxHeight: '200px',
  overflowY: 'auto',
  zIndex: 10,
});

const multiSelectOption = css({
  padding: '8px 12px',
  fontSize: '14px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '&:hover': {
    background: '#f3f4f6',
  },
});

const checkbox = css({
  width: '16px',
  height: '16px',
  cursor: 'pointer',
});

const checkboxLabel = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  color: 'color.text.primary',
  cursor: 'pointer',
  userSelect: 'none',
});

type FilterBarProps = {
  showOnlyActive: boolean;
  onShowOnlyActiveChange: (show: boolean) => void;
  sortBy: SortByOption;
  onSortByChange: (sortBy: SortByOption) => void;
  selectedArtistIds: string[];
  onArtistIdsChange: (artistIds: string[]) => void;
  availableArtists: Artist[];
};

const FilterBar = ({
  showOnlyActive,
  onShowOnlyActiveChange,
  sortBy,
  onSortByChange,
  selectedArtistIds,
  onArtistIdsChange,
  availableArtists,
}: FilterBarProps) => {
  const handleArtistToggle = (artistId: string) => {
    if (selectedArtistIds.includes(artistId)) {
      onArtistIdsChange(selectedArtistIds.filter((id) => id !== artistId));
    } else {
      onArtistIdsChange([...selectedArtistIds, artistId]);
    }
  };

  const selectedArtistNames = useMemo(() => {
    if (selectedArtistIds.length === 0) return '全部藝人';
    if (selectedArtistIds.length === 1) {
      const artist = availableArtists.find((a) => a.id === selectedArtistIds[0]);
      return artist?.stageName || '未知藝人';
    }
    return `已選 ${selectedArtistIds.length} 位藝人`;
  }, [selectedArtistIds, availableArtists]);

  return (
    <div className={filterBarContainer}>
      <div className={filterRow}>
        <label className={checkboxLabel}>
          <input
            type="checkbox"
            className={checkbox}
            checked={showOnlyActive}
            onChange={(e) => onShowOnlyActiveChange(e.target.checked)}
          />
          <span>只顯示未結束的應援</span>
        </label>
      </div>

      {availableArtists.length > 0 && (
        <div className={filterRow}>
          <div className={filterLabel}>篩選藝人</div>
          <div className={filterControl}>
            <ArtistMultiSelect
              selectedArtistIds={selectedArtistIds}
              availableArtists={availableArtists}
              onArtistToggle={handleArtistToggle}
              selectedArtistNames={selectedArtistNames}
            />
          </div>
        </div>
      )}

      <div className={filterRow}>
        <div className={filterLabel}>排序方式</div>
        <div className={filterControl}>
          <select
            className={selectInput}
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortByOption)}
          >
            <option value="favorited-desc">收藏時間：由新到舊</option>
            <option value="favorited-asc">收藏時間：由舊到新</option>
            <option value="startTime-asc">活動時間：由早到晚</option>
            <option value="startTime-desc">活動時間：由晚到早</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// 藝人多選組件
const ArtistMultiSelect = ({
  selectedArtistIds,
  availableArtists,
  onArtistToggle,
  selectedArtistNames,
}: {
  selectedArtistIds: string[];
  availableArtists: Artist[];
  onArtistToggle: (artistId: string) => void;
  selectedArtistNames: string;
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className={multiSelectContainer}>
      <button
        type="button"
        className={multiSelectButton}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span>{selectedArtistNames}</span>
        <span>{dropdownOpen ? '▲' : '▼'}</span>
      </button>

      {dropdownOpen && (
        <div className={multiSelectDropdown}>
          {availableArtists.map((artist) => (
            <label key={artist.id} className={multiSelectOption}>
              <input
                type="checkbox"
                className={checkbox}
                checked={selectedArtistIds.includes(artist.id)}
                onChange={() => onArtistToggle(artist.id)}
              />
              <span>{artist.stageName}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
