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
        padding: '16px 20px',
        margin: '0 20px 0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        position: 'relative',
      })}
    >
      <div className={css({ flex: 1 })}>
        <h4
          className={css({
            fontSize: '14px',
            fontWeight: '600',
            color: 'color.text.primary',
            margin: '0 0 4px 0',
            lineHeight: '1.4',
            textAlign: 'center',
          })}
        >
          \ 把 STELLAR 變成 App 吧！ /
        </h4>
        <div
          className={css({
            fontSize: '13px',
            color: 'color.text.secondary',
            margin: 0,
            lineHeight: '1.4',
            textAlign: 'center',
            marginTop: '12px',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              justifyContent: 'center',
            })}
          >
            在 Safari 中點擊分享按鈕
            {
              <span className={css({ display: 'inline-block', marginRight: '4px' })}>
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
          top: '10px',
          right: '10px',
          backgroundColor: 'transparent',
          border: 'none',
          color: 'color.text.secondary',
          fontSize: '16px',
          cursor: 'pointer',
          padding: '4px',
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
