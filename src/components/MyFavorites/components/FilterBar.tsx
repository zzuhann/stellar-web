import { css } from '@/styled-system/css';
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
};

const FilterBar = ({
  showOnlyActive,
  onShowOnlyActiveChange,
  sortBy,
  onSortByChange,
}: FilterBarProps) => {
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

export default FilterBar;
