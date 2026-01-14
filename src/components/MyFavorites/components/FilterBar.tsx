import { useState, useMemo } from 'react';
import { css } from '@/styled-system/css';
import { Artist } from '@/types';

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

type FilterBarProps = {
  status: 'notEnded' | 'all';
  onStatusChange: (status: 'notEnded' | 'all') => void;
  sort: 'favoritedAt' | 'startTime';
  onSortChange: (sort: 'favoritedAt' | 'startTime') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (sortOrder: 'asc' | 'desc') => void;
  selectedArtistIds: string[];
  onArtistIdsChange: (artistIds: string[]) => void;
  availableArtists: Artist[];
};

const FilterBar = ({
  status,
  onStatusChange,
  sort,
  onSortChange,
  sortOrder,
  onSortOrderChange,
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
        <div className={filterLabel}>活動狀態</div>
        <div className={filterControl}>
          <select
            className={selectInput}
            value={status}
            onChange={(e) => onStatusChange(e.target.value as 'notEnded' | 'all')}
          >
            <option value="notEnded">未結束</option>
            <option value="all">全部</option>
          </select>
        </div>
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
            value={sort}
            onChange={(e) => onSortChange(e.target.value as 'favoritedAt' | 'startTime')}
          >
            <option value="favoritedAt">收藏時間</option>
            <option value="startTime">活動開始時間</option>
          </select>
          <select
            className={selectInput}
            value={sortOrder}
            onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
          >
            <option value="desc">倒序</option>
            <option value="asc">正序</option>
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
