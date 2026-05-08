import { InstagramIcon, ThreadsIcon } from '@/components/ui/SocialMediaIcons';
import { css } from '@/styled-system/css';
import Link from 'next/link';

const footerContainer = css({
  background: 'color.background.secondary',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  marginTop: 'auto',
});

const footerInner = css({
  maxWidth: '900px',
  margin: '0 auto',
  paddingX: '6',
  paddingTop: '10',
  paddingBottom: '6',
});

const footerGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '8',
  marginBottom: '8',
  '@media (min-width: 640px)': {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
});

const footerCol = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
});

const colTitle = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  margin: '0',
});

const footerLink = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  transition: 'color 0.15s ease',
  '&:hover': {
    color: 'color.text.primary',
  },
  '& svg': {
    width: '14px',
    height: '14px',
    flexShrink: '0',
  },
});

const footerBottom = css({
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  paddingTop: '4',
  textStyle: 'caption',
  color: 'color.text.secondary',
});

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={footerContainer}>
      <div className={footerInner}>
        <div className={footerGrid}>
          <div className={footerCol}>
            <p className={colTitle}>關於 STELLAR</p>
            <Link href="/about" className={footerLink}>
              關於我們
            </Link>
            {/* <Link href="/about#contact" className={footerLink}>
              聯絡我們
            </Link> */}
          </div>

          <div className={footerCol}>
            <p className={colTitle}>使用指南</p>
            <Link href="/guide?tab=submit-event" className={footerLink}>
              投稿活動
            </Link>
            <Link href="/guide?tab=submit-artist" className={footerLink}>
              投稿藝人
            </Link>
            {/* <Link href="/faq" className={footerLink}>
              常見問與答
            </Link> */}
          </div>

          <div className={footerCol}>
            <p className={colTitle}>使用條款</p>
            <Link href="/terms" className={footerLink}>
              服務條款
            </Link>
            <Link href="/privacy" className={footerLink}>
              隱私權政策
            </Link>
          </div>

          <div className={footerCol}>
            <p className={colTitle}>社群</p>
            <a
              href="https://www.instagram.com/_stellar.tw/"
              target="_blank"
              rel="noopener noreferrer"
              className={footerLink}
            >
              <InstagramIcon size={14} />
              _stellar.tw
            </a>
            <a
              href="https://www.threads.net/@_stellar.tw"
              target="_blank"
              rel="noopener noreferrer"
              className={footerLink}
            >
              <ThreadsIcon size={14} />
              _stellar.tw
            </a>
          </div>
        </div>

        <div className={footerBottom}>Copyright © {currentYear} _stellar.tw</div>
      </div>
    </footer>
  );
};

export default Footer;
