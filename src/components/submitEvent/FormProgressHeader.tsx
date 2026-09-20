import { css, cva } from '@/styled-system/css';
import { EventFormProgress } from './formProgress';

const progressHeader = css({
  position: 'sticky',
  top: '70px',
  zIndex: '10',
  background: 'color.background.primary',
  paddingY: '3',
  marginBottom: '2',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
});

const progressLabelRow = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '2',
});

const progressLabelText = css({
  textStyle: 'caption',
  fontWeight: 'medium',
  color: 'color.text.secondary',
  margin: '0',
});

const progressCountText = css({
  textStyle: 'caption',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  margin: '0',
});

const progressSegments = css({
  display: 'flex',
  gap: '1',
});

const progressSegment = cva({
  base: {
    flex: '1',
    height: '4px',
    borderRadius: 'radius.sm',
    background: 'color.border.light',
    transition: 'background 0.2s ease',
  },
  variants: {
    filled: {
      true: {
        background: 'color.primary',
      },
    },
  },
});

type FormProgressHeaderProps = {
  progress: EventFormProgress;
};

const FormProgressHeader = ({ progress }: FormProgressHeaderProps) => {
  const { completed, total, segments } = progress;

  return (
    <div className={progressHeader}>
      <div className={progressLabelRow}>
        <p id="form-progress-label" className={progressLabelText}>
          必填欄位完成度
        </p>
        <p id="form-progress-count" className={progressCountText}>
          {completed} / {total}
        </p>
      </div>
      <div
        className={progressSegments}
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-labelledby="form-progress-label form-progress-count"
      >
        {segments.map((filled, index) => (
          <div key={index} className={progressSegment({ filled })} aria-hidden="true" />
        ))}
      </div>
    </div>
  );
};

export default FormProgressHeader;
