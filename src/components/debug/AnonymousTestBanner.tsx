'use client';

import { useAuth } from '@/lib/auth-context';
import { css } from '@/styled-system/css';
import { useState } from 'react';
import { useAnonymousLoginEnabled } from '@/hooks/useAnonymousLoginEnabled';

const banner = css({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  backgroundColor: '#fef3c7',
  borderBottom: '2px solid #f59e0b',
  padding: '12px 16px',
  fontSize: '13px',
  lineHeight: '1.5',
});

const container = css({
  maxWidth: '1200px',
  margin: '0 auto',
});

const header = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '8px',
});

const title = css({
  fontWeight: '700',
  color: '#92400e',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

const closeButton = css({
  background: 'none',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  padding: '0',
  lineHeight: '1',
  color: '#92400e',
  '&:hover': {
    color: '#78350f',
  },
});

const uidBox = css({
  backgroundColor: '#fff',
  padding: '8px 12px',
  borderRadius: '6px',
  fontFamily: 'monospace',
  fontSize: '12px',
  color: '#1f2937',
  marginBottom: '8px',
  overflowX: 'auto',
  wordBreak: 'break-all',
});

const instructions = css({
  color: '#92400e',
  fontSize: '12px',
});

const AnonymousTestBanner = () => {
  const { user } = useAuth();
  const { isEnabled } = useAnonymousLoginEnabled();
  const [isVisible, setIsVisible] = useState(true);

  if (!user?.isAnonymous || !isVisible || !isEnabled) {
    return null;
  }

  return (
    <div className={banner}>
      <div className={container}>
        <div className={header}>
          <div className={title}>
            <span>🧪</span>
            <span>測試模式 - 匿名用戶</span>
          </div>
          <button className={closeButton} onClick={() => setIsVisible(false)} aria-label="關閉">
            ×
          </button>
        </div>

        <div className={uidBox}>
          <strong>UID:</strong> {user.uid}
        </div>

        <div className={instructions}>
          <div>
            <strong>測試 1：</strong>關閉此 in-app browser，再重新開啟，看 UID 是否相同
          </div>
          <div>
            <strong>測試 2：</strong>關閉後用一般瀏覽器開啟網站，看 UID 是否相同
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnonymousTestBanner;
