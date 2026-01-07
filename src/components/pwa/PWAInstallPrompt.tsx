'use client';

import { useState, useEffect } from 'react';
import { css } from '../../../styled-system/css';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showOpenAppPrompt, setShowOpenAppPrompt] = useState(false);

  useEffect(() => {
    // 檢查是否為mobile，只在手機顯示 PWA 提示
    const isMobileDevice = () => {
      const userAgent =
        navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera;
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent || '');
    };

    if (!isMobileDevice()) {
      return; // 桌機不顯示 PWA 提示
    }

    // 檢查是否已經安裝 PWA
    const checkIfInstalled = () => {
      // 檢查是否在 standalone 模式運行
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }

      // 檢查是否在 fullscreen 模式運行
      if (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) {
        setIsInstalled(true);
        return true;
      }

      // 檢查是否為 iOS Safari 的 standalone 模式
      if ((window.navigator as unknown as { standalone?: boolean }).standalone === true) {
        setIsInstalled(true);
        return true;
      }

      // 檢查本地儲存的安裝記錄
      const installedRecord = localStorage.getItem('pwa-installed');
      if (installedRecord === 'true') {
        // 已安裝但用瀏覽器開啟，顯示開啟App提示
        setIsInstalled(true);
        setShowOpenAppPrompt(true);
        return true;
      }

      return false;
    };

    checkIfInstalled();

    // 監聽 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // 防止 Chrome 67 及更早版本自動顯示安裝提示
      e.preventDefault();

      // 檢查用戶是否已拒絕過安裝提示
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (dismissed) {
        const dismissedDate = new Date(parseInt(dismissed));
        const today = new Date();
        // 如果是同一天，不再顯示
        if (dismissedDate.toDateString() === today.toDateString()) {
          return;
        }
      }

      // 儲存事件 晚點觸發
      setDeferredPrompt(e);

      // 顯示自定義安裝按鈕 提示用戶安裝
      setShowInstallPrompt(true);
    };

    // 監聽 appinstalled 事件
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // 顯示安裝提示
    await deferredPrompt.prompt();

    // 等待用戶選擇
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      // 用戶接受了安裝提示
    } else {
      // 用戶拒絕了安裝提示
    }

    // 重置 deferredPrompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // 記錄拒絕時間，當天內不再提示
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleOpenApp = () => {
    // 嘗試開啟已安裝的 PWA
    window.location.href = '/?source=pwa';
    setShowOpenAppPrompt(false);
  };

  const handleDismissOpenApp = () => {
    setShowOpenAppPrompt(false);
    // 當天內不再提示
    localStorage.setItem('pwa-open-app-dismissed', Date.now().toString());
  };

  // 檢查是否應該顯示開啟App提示
  const shouldShowOpenAppPrompt = () => {
    if (!showOpenAppPrompt) return false;

    const dismissed = localStorage.getItem('pwa-open-app-dismissed');
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

  // 如果已安裝且在瀏覽器中，顯示開啟App提示
  if (isInstalled && shouldShowOpenAppPrompt()) {
    return (
      <div
        className={css({
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          backgroundColor: 'color.background.primary',
          borderRadius: 'radius.xl',
          boxShadow: 'shadow.lg',
          padding: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          border: '1px solid',
          borderColor: 'color.border.light',
          textAlign: 'center',
          '@media (min-width: 768px)': {
            width: '35%',
            left: 'auto',
            right: '20px',
          },
        })}
      >
        <div>
          <h3
            className={css({
              fontSize: '18px',
              fontWeight: '600',
              color: 'color.text.primary',
              margin: 0,
              marginBottom: '8px',
            })}
          >
            在 STELLAR App 中開啟
          </h3>
          <p
            className={css({
              fontSize: '14px',
              color: 'color.text.secondary',
              margin: 0,
              lineHeight: '1.4',
            })}
          >
            獲得更好的應用程式體驗
          </p>
        </div>

        <div
          className={css({
            display: 'flex',
            gap: '12px',
            width: '100%',
          })}
        >
          <button
            onClick={handleDismissOpenApp}
            className={css({
              backgroundColor: 'transparent',
              color: 'color.text.secondary',
              border: '1px solid',
              borderColor: 'color.border.light',
              borderRadius: 'radius.lg',
              padding: '12px 24px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'color 0.2s',
              width: '100%',
              '&:hover': {
                color: 'color.text.primary',
              },
            })}
          >
            稍後
          </button>
          <button
            onClick={handleOpenApp}
            className={css({
              backgroundColor: 'color.primary',
              color: 'white',
              border: 'none',
              borderRadius: 'radius.lg',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%',
              '&:hover': {
                opacity: 0.9,
              },
            })}
          >
            開啟 App
          </button>
        </div>
      </div>
    );
  }

  // 如果已安裝或不需要顯示提示，則不渲染任何內容
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div
      className={css({
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        backgroundColor: 'color.background.primary',
        borderRadius: 'radius.xl',
        boxShadow: 'shadow.lg',
        padding: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1px solid',
        borderColor: 'color.border.light',
        textAlign: 'center',
        '@media (min-width: 768px)': {
          width: '35%',
          left: 'auto',
          right: '20px',
        },
      })}
    >
      <div>
        <h3
          className={css({
            fontSize: '18px',
            fontWeight: '600',
            color: 'color.text.primary',
            margin: 0,
            marginBottom: '8px',
          })}
        >
          安裝 STELLAR 到主畫面
        </h3>
        <p
          className={css({
            fontSize: '14px',
            color: 'color.text.secondary',
            margin: 0,
            lineHeight: '1.4',
          })}
        >
          安裝到主畫面，可以獲得更好的使用體驗～！
        </p>
      </div>

      <div
        className={css({
          display: 'flex',
          gap: '12px',
          width: '100%',
        })}
      >
        <button
          onClick={handleDismiss}
          className={css({
            backgroundColor: 'transparent',
            color: 'color.text.secondary',
            borderRadius: 'radius.lg',
            padding: '12px 24px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'color 0.2s',
            width: '100%',
            border: '1px solid',
            borderColor: 'color.border.light',
            '&:hover': {
              color: 'color.text.primary',
            },
          })}
        >
          稍後
        </button>
        <button
          onClick={handleInstallClick}
          className={css({
            backgroundColor: 'color.primary',
            color: 'white',
            border: 'none',
            borderRadius: 'radius.lg',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            width: '100%',
            '&:hover': {
              opacity: 0.9,
            },
          })}
        >
          安裝
        </button>
      </div>
    </div>
  );
}
