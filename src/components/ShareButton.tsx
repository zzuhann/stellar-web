'use client';

import { usePathname } from 'next/navigation';
import { css } from '../../styled-system/css';
import { ShareIcon } from '@/lib/svg';
import { useWebShare } from '@/hooks/useWebShare';
import { useShare } from '@/context/ShareContext';

export default function ShareButton() {
  const { share } = useWebShare();
  const { shareData } = useShare();
  const pathname = usePathname();

  // 檢查是否在 PWA 模式下運行
  const isPWAMode = () => {
    // 檢查是否在 standalone 模式運行
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // 檢查是否在 fullscreen 模式運行
    if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) {
      return true;
    }

    // 檢查是否為 iOS Safari 的 standalone 模式
    if ((window.navigator as unknown as { standalone?: boolean }).standalone === true) {
      return true;
    }

    return false;
  };

  // 檢查是否在允許顯示分享按鈕的頁面
  const shouldShowShareButton = () => {
    // 必須在 PWA 模式下
    if (!isPWAMode()) {
      return false;
    }

    // 匹配 /map/{artistId} 和 /event/{eventId} 路由
    const mapPattern = /^\/map\/[^\/]+$/;
    const eventPattern = /^\/event\/[^\/]+$/;

    return mapPattern.test(pathname) || eventPattern.test(pathname);
  };

  const handleShare = () => {
    share(shareData);
  };

  // 如果不在指定頁面，不渲染按鈕
  if (!shouldShowShareButton()) {
    return null;
  }

  return (
    <button
      onClick={handleShare}
      className={css({
        display: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
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
      <ShareIcon width={20} height={20} color="var(--color-text-primary)" />
    </button>
  );
}
