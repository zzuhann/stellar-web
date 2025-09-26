import { css } from '@/styled-system/css';

const ctaButton = css({
  padding: '12px 24px',
  borderRadius: 'radius.lg',
  fontSize: '14px',
  fontWeight: 600,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  background: 'color.primary',
  borderColor: 'color.primary',
  color: 'white',
  maxWidth: '60%',
  margin: '0 auto',
});

type CTAButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
};

export default function CTAButton({ children, onClick }: CTAButtonProps) {
  return (
    <button className={ctaButton} onClick={onClick}>
      {children}
    </button>
  );
}
