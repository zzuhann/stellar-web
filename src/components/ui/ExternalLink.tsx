'use client';

import { sendGAEvent } from '@next/third-parties/google';
import { useAuth } from '@/lib/auth-context';
import { ReactNode } from 'react';

type Platform = 'instagram' | 'threads' | 'x' | 'location' | 'calendar';

interface ExternalLinkProps {
  href: string;
  platform: Platform;
  eventPage: string;
  contentId: string;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const ExternalLink = ({
  href,
  platform,
  eventPage,
  contentId,
  children,
  style,
  className,
}: ExternalLinkProps) => {
  const { user } = useAuth();

  const handleClick = () => {
    sendGAEvent('event', `click_${platform}`, {
      event_page: eventPage,
      user_id: user?.uid ?? '',
      content_id: contentId,
    });
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={style}
      className={className}
    >
      {children}
    </a>
  );
};

export default ExternalLink;
