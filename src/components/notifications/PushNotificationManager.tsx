'use client';

import { notificationsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { getServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function PushNotificationManager() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkExistingSubscription();
    }
  }, []);

  async function checkExistingSubscription() {
    try {
      const registration = await getServiceWorkerRegistration();
      if (registration) {
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
      }
    } catch {
      setError('請重新整理頁面後再試');
    }
  }

  async function subscribeToPush() {
    setIsLoading(true);
    setError('');

    try {
      const registration = await getServiceWorkerRegistration();
      if (!registration) {
        throw new Error('Service Worker 未就緒');
      }
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''),
      });
      setSubscription(sub);
      const serializedSub = JSON.parse(JSON.stringify(sub));
      await notificationsApi.subscribe({
        userId: user?.uid || '',
        subscription: serializedSub,
        platform: navigator.userAgent,
      });
    } catch {
      const isBrave = navigator.userAgent.includes('Brave');
      if (isBrave) {
        setError(
          'Brave 瀏覽器需要額外設定：請前往 設定 -> 隱私權和安全性 -> 開啟「使用 Google 服務來推播訊息」'
        );
      } else {
        setError('開啟通知失敗，可能是瀏覽器或網路問題，可以嘗試使用其他瀏覽器');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribeFromPush() {
    setIsLoading(true);
    setError('');

    try {
      await subscription?.unsubscribe();
      setSubscription(null);
      await notificationsApi.unsubscribe(user?.uid || '');
    } catch {
      setError('關閉通知失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  }

  async function sendTestNotification() {
    if (!subscription) return;

    setIsLoading(true);
    setError('');

    try {
      await notificationsApi.sendApprovalNotification({
        userId: user?.uid || '',
        type: 'artist',
        submissionId: '',
        title: 'Test Notification',
        message: message,
      });
      setMessage('');
    } catch {
      setError('發送測試通知失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div>
      <h3>Push Notifications</h3>

      {error && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            marginBottom: '16px',
            color: '#c33',
          }}
        >
          {error}
        </div>
      )}

      {subscription ? (
        <>
          <p>✅ 已成功開啟通知</p>
          <button onClick={unsubscribeFromPush} disabled={isLoading} style={{ marginRight: '8px' }}>
            {isLoading ? '處理中...' : '關閉通知'}
          </button>
          <div style={{ marginTop: '16px' }}>
            <input
              type="text"
              placeholder="輸入測試通知訊息"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ marginRight: '8px', padding: '8px' }}
            />
            <button onClick={sendTestNotification} disabled={isLoading || !message.trim()}>
              {isLoading ? '發送中...' : '發送測試'}
            </button>
          </div>
        </>
      ) : (
        <>
          <p>尚未開啟通知</p>
          <button onClick={subscribeToPush} disabled={isLoading}>
            {isLoading ? '開啟中...' : '開啟通知'}
          </button>
        </>
      )}
    </div>
  );
}

export default PushNotificationManager;
