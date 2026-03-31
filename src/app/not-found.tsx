import Link from 'next/link';
import { css } from '@/styled-system/css';

const container = css({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'gray.50',
  flexDirection: 'column',
  gap: '4',
  padding: '5',
});

const title = css({
  textStyle: 'display',
  margin: 0,
  color: 'color.text.primary',
});

const description = css({
  textStyle: 'h4',
  margin: 0,
  color: 'color.text.secondary',
});

const homeLink = css({
  paddingY: '3',
  paddingX: '6',
  background: 'color.primary',
  color: 'white',
  textDecoration: 'none',
  borderRadius: 'radius.md',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  transition: 'background 0.2s ease',
  '&:hover': {
    background: 'stellarBlue.600',
  },
});

export default function NotFound() {
  return (
    <div className={container}>
      <h1 className={title}>404</h1>
      <p className={description}>頁面不存在</p>
      <Link href="/" className={homeLink}>
        回到首頁
      </Link>
    </div>
  );
}
