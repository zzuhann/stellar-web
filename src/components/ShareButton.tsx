'use client';

import { usePathname } from 'next/navigation';
import { css } from '../../styled-system/css';
import { ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import { useWebShare } from '@/hooks/useWebShare';
import { useShare } from '@/context/ShareContext';
import { isPWAMode } from '@/utils/pwa';
import { useAuth } from '@/lib/auth-context';
import { sendGAEvent } from '@next/third-parties/google';

export default function ShareButton() {
  const { share } = useWebShare();
  const { shareData } = useShare();
  const pathname = usePathname();
  const { user } = useAuth();

  const shouldShow =
    isPWAMode() && (/^\/map\/[^/]+$/.test(pathname) || /^\/event\/[^/]+$/.test(pathname));

  const handleShare = () => {
    // 從 pathname 取得 contentId
    const pathParts = pathname.split('/');
    const contentId = pathParts[pathParts.length - 1] || '';

    sendGAEvent('event', 'share_event', {
      event_page: pathname.startsWith('/event/') ? '/event/[id]' : '/map/[artistId]',
      user_id: user?.uid ?? '',
      content_id: contentId,
    });

    share(shareData);
  };

  // 如果不在指定頁面，不渲染按鈕
  if (!shouldShow) {
    return null;
  }

  return (
    <button
      onClick={handleShare}
      className={css({
        display: 'none',
        cursor: 'pointer',
        transition: 'opacity 0.2s ease',
        position: 'relative',
        '&:hover': {
          opacity: 0.9,
        },
        '@media (max-width: 768px)': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      })}
    >
      <ArrowUpOnSquareIcon width={20} height={20} color="var(--color-text-primary)" />
    </button>
  );
}
