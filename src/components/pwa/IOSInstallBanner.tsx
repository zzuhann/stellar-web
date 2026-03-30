'use client';

import { useState, useEffect } from 'react';
import { css } from '../../../styled-system/css';
import { ShareIcon } from '@/lib/svg';
import { isPWAMode } from '@/utils/pwa';

export default function IOSInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const checkIfShouldShow = () => {
      // 檢查是否為 iOS 設備
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (!isIOS) return false;

      // 檢查是否已經在 PWA 模式
      if (isPWAMode()) return false;

      // 檢查是否已經拒絕過 banner
      const dismissed = localStorage.getItem('ios-install-banner-dismissed');
      if (dismissed) {
        const dismissedDate = new Date(parseInt(dismissed));
        const today = new Date();
        // 如果是同一天，不再顯示
        if (dismissedDate.toDateString() === today.toDateString()) {
          return false;
        }
      }

      return true;
    };

    if (checkIfShouldShow()) {
      setShowBanner(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    // 記錄拒絕時間，當天內不再提示
    localStorage.setItem('ios-install-banner-dismissed', Date.now().toString());
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className={css({
        background: 'color.background.secondary',
        border: '1px solid',
        borderColor: 'color.border.light',
        borderRadius: 'radius.lg',
        paddingY: '4',
        paddingX: '5',
        marginX: '5',
        marginTop: '0',
        marginBottom: '0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '3',
        position: 'relative',
      })}
    >
      <div className={css({ flex: 1 })}>
        <h4
          className={css({
            textStyle: 'bodySmall',
            fontWeight: 'semibold',
            color: 'color.text.primary',
            marginBottom: '1',
            marginTop: '0',
            marginX: '0',
            textAlign: 'center',
          })}
        >
          \ 把 STELLAR 變成 App 吧！ /
        </h4>
        <div
          className={css({
            textStyle: 'bodySmall',
            color: 'color.text.secondary',
            margin: 0,
            textAlign: 'center',
            marginTop: '3',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '1',
              justifyContent: 'center',
            })}
          >
            在 Safari 中點擊分享按鈕
            {
              <span className={css({ display: 'inline-block', marginRight: '1' })}>
                <ShareIcon aria-hidden="true" width={16} height={16} />
              </span>
            }
          </div>
          <p>選擇「加入主畫面」來安裝 STELLAR App</p>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className={css({
          position: 'absolute',
          top: '2.5',
          right: '2.5',
          backgroundColor: 'transparent',
          border: 'none',
          color: 'color.text.secondary',
          textStyle: 'body',
          cursor: 'pointer',
          padding: '1',
          lineHeight: 1,
          transition: 'color 0.2s',
          flexShrink: 0,
          borderRadius: 'radius.sm',
          '&:hover': {
            color: 'color.text.primary',
            backgroundColor: 'color.border.light',
          },
        })}
        aria-label="關閉"
      >
        ×
      </button>
    </div>
  );
}
