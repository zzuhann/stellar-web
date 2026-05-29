import Link from 'next/link';
import { css } from '@/styled-system/css';

const ctaButton = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5',
  paddingY: '3',
  paddingX: '6',
  borderRadius: 'radius.lg',
  textStyle: 'button',
  fontWeight: 'semibold',
  transition: 'background 0.2s ease, border-color 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  background: 'color.primary',
  borderColor: 'color.primary',
  color: 'white',
  maxWidth: '60%',
  margin: '0 auto',
  textAlign: 'center',
  textDecoration: 'none',
});

type CommonProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  ariaLabel?: string;
};

type ButtonModeProps = CommonProps & {
  href?: undefined;
  onClick: () => void;
};

type LinkModeProps = CommonProps & {
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

type CTAButtonProps = ButtonModeProps | LinkModeProps;

export default function CTAButton(props: CTAButtonProps) {
  // Link 模式：SSR 時就是 anchor，hydration 前點擊也能直接導航，
  // 避免 hydration race 造成的 dead click（issue #25）
  if (props.href !== undefined) {
    const { href, onClick, children, style, ariaLabel } = props;
    return (
      <Link
        href={href}
        className={ctaButton}
        onClick={onClick}
        style={style}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    );
  }

  const { onClick, children, style, ariaLabel } = props;
  return (
    <button className={ctaButton} onClick={onClick} style={style} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
