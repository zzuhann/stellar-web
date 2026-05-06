import { ThreadsIcon } from '@/components/ui/SocialMediaIcons';
import { css } from '@/styled-system/css';
import Link from 'next/link';

const footerContainer = css({
  background: 'color.background.secondary',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  paddingY: '3',
  paddingX: '5',
  marginTop: 'auto',
});

const footerContent = css({
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '4',
  maxWidth: '500px',
});

const copyrightText = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  display: 'flex',
  flexDirection: 'column',
  gap: '1',
});

const copyrightItem = css({
  display: 'flex',
  alignItems: 'center',
  minHeight: '24px',
});

const socialLinks = css({
  display: 'flex',
  flexDirection: 'column',
});

const socialLink = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  color: 'color.text.secondary',
  textDecoration: 'none',
  textStyle: 'caption',
  borderRadius: 'radius.md',
  transition: 'all 0.2s ease',
  '& svg': {
    width: '16px',
    height: '16px',
  },
});

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={footerContainer}>
      <div className={footerContent}>
        <div className={copyrightText}>
          <div className={copyrightItem}>Copyright © {currentYear} _stellar.tw</div>
          <Link
            href="/terms"
            className={css({
              textDecoration: 'underline',
              display: 'flex',
              alignItems: 'center',
              minHeight: '24px',
            })}
          >
            服務條款
          </Link>
          <Link
            href="/privacy"
            className={css({
              textDecoration: 'underline',
              display: 'flex',
              alignItems: 'center',
              minHeight: '24px',
            })}
          >
            隱私權政策
          </Link>
        </div>

        <div className={socialLinks}>
          <a
            href="https://www.threads.net/@_stellar.tw"
            target="_blank"
            rel="noopener noreferrer"
            className={socialLink}
          >
            <ThreadsIcon size={16} />
            _stellar.tw
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
