'use client';

import { InstagramIcon } from '@/components/ui/SocialMediaIcons';
import { css } from '@/styled-system/css';

const footerContainer = css({
  background: 'color.background.secondary',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  padding: '12px 20px',
  marginTop: 'auto',
});

const footerContent = css({
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  maxWidth: '500px',
});

const copyrightText = css({
  fontSize: '12px',
  color: 'color.text.secondary',
});

const socialLinks = css({
  display: 'flex',
  flexDirection: 'column',
});

const socialLink = css({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'color.text.secondary',
  textDecoration: 'none',
  fontSize: '12px',
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
        <div className={copyrightText}>Copyright © {currentYear} _stellar.tw</div>

        <div className={socialLinks}>
          <a
            className={socialLink}
            href="https://www.instagram.com/_stellar.tw"
            target="_blank"
            rel="noopener noreferrer"
          >
            <InstagramIcon size={16} />
            _stellar.tw
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
