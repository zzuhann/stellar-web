import { css } from '@/styled-system/css';

const loadingContainer = css({
  padding: '60px 20px',
  textAlign: 'center',
  color: 'var(--color-text-secondary)',
  background: 'var(--color-bg-secondary)',
  border: '1px solid var(--color-border-light)',
  borderRadius: 'var(--radius-lg)',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

const spinner = css({
  width: '32px',
  height: '32px',
  border: '3px solid var(--color-border-light)',
  borderTop: '3px solid var(--color-primary)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto 16px',
});

const text = css({
  margin: '0',
  fontSize: '14px',
  fontWeight: 500,
});

type LoadingProps = {
  description: string;
};

const Loading = ({ description }: LoadingProps) => {
  return (
    <div className={loadingContainer}>
      <div className={spinner} />
      <p className={text}>{description}</p>
    </div>
  );
};

export default Loading;
