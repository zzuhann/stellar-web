import { css, cx } from '@/styled-system/css';

const track = css({
  height: '3px',
  borderRadius: '2px',
  background: 'gray.100',
  overflow: 'hidden',
});

const bar = css({
  height: '100%',
  borderRadius: '2px',
  background: 'color.primary',
  transition: 'width 0.18s ease-out',
});

// Stands in for the hidden native scrollbar on horizontal strips; value is 0..1
export default function ScrollProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cx(track, className)}>
      <div className={bar} style={{ width: `${Math.max(8, value * 100)}%` }} />
    </div>
  );
}
