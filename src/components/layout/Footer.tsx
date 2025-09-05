'use client';

import { InstagramIcon } from '@/components/ui/SocialMediaIcons';
import styled from 'styled-components';

// Styled Components
const FooterContainer = styled.footer`
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-light);
  padding: 12px 20px;
  margin-top: auto;
`;

const FooterContent = styled.div`
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  max-width: 500px;
`;

const CopyrightText = styled.div`
  font-size: 12px;
  color: var(--color-text-secondary);
`;

const SocialLinks = styled.div`
  display: flex;
  flex-direction: column;
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 12px;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <CopyrightText>Copyright © {currentYear} _stellar.tw</CopyrightText>

        <SocialLinks>
          <SocialLink
            href="https://www.instagram.com/_stellar.tw"
            target="_blank"
            rel="noopener noreferrer"
          >
            <InstagramIcon size={16} />
            _stellar.tw
          </SocialLink>
        </SocialLinks>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
