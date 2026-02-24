import { css } from '@/styled-system/css';

const loadingContainer = css({
  padding: '60px 20px',
  textAlign: 'center',
  color: 'color.text.secondary',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
});

const spinner = css({
  width: '32px',
  height: '32px',
  border: '3px solid',
  borderColor: 'color.border.light',
  borderTop: '3px solid',
  borderTopColor: 'color.primary',
  borderRadius: 'radius.circle',
  animation: 'spin 1s linear infinite',
  margin: '0 auto 16px',
});

const text = css({
  margin: '0',
  fontSize: '14px',
  fontWeight: 500,
});

type LoadingProps = {
  description?: string;
  height?: string;
  style?: React.CSSProperties;
};

const Loading = ({ description, height = '100%', style }: LoadingProps) => {
  return (
    <div
      className={loadingContainer}
      style={{ height, ...style }}
      aria-label="載入中"
      aria-live="polite"
    >
      <div className={spinner} aria-hidden="true" />
      {description && <p className={text}>{description}</p>}
    </div>
  );
};

export default Loading;
