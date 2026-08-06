import { css, cva } from '@/styled-system/css';
import { HOURS, MINUTES } from './utils';

const columns = css({
  display: 'flex',
  gap: '2',
});

const column = css({
  flex: '1',
  maxHeight: '200px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5',
});

const columnLabel = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  textAlign: 'center',
  paddingBottom: '1',
  position: 'sticky',
  top: '0',
  background: 'color.background.primary',
});

const optionButton = cva({
  base: {
    width: '100%',
    paddingY: '1.5',
    textAlign: 'center',
    border: 'none',
    borderRadius: 'radius.md',
    background: 'transparent',
    color: 'color.text.primary',
    textStyle: 'bodySmall',
    fontVariantNumeric: 'tabular-nums',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    '&:hover': {
      background: 'color.background.secondary',
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: '0 0 0 2px var(--colors-alpha-primary-20)',
    },
  },
  variants: {
    isSelected: {
      true: {
        background: 'color.primary',
        color: 'white',
        fontWeight: 'semibold',
        '&:hover': {
          background: 'color.primary',
        },
      },
    },
  },
});

interface TimeViewProps {
  hour: string;
  minute: string;
  onSelectHour: (hour: string) => void;
  onSelectMinute: (minute: string) => void;
}

export default function TimeView({ hour, minute, onSelectHour, onSelectMinute }: TimeViewProps) {
  return (
    <div className={columns}>
      <div className={column} role="listbox" aria-label="選擇小時">
        <div className={columnLabel}>時</div>
        {HOURS.map((h) => (
          <button
            key={h}
            type="button"
            role="option"
            aria-selected={hour === h}
            className={optionButton({ isSelected: hour === h })}
            onClick={() => onSelectHour(h)}
          >
            {h}
          </button>
        ))}
      </div>
      <div className={column} role="listbox" aria-label="選擇分鐘">
        <div className={columnLabel}>分</div>
        {MINUTES.map((m) => (
          <button
            key={m}
            type="button"
            role="option"
            aria-selected={minute === m}
            className={optionButton({ isSelected: minute === m })}
            onClick={() => onSelectMinute(m)}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
