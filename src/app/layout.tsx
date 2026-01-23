import { GoogleAnalytics } from '@next/third-parties/google';

import type { Metadata } from 'next';
import { Noto_Sans_TC } from 'next/font/google'; // 改用 CSS 引入
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { QueryProvider } from '@/lib/query-client';
import { LoadingProvider } from '@/lib/loading-context';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/header';
import Footer from '@/components/layout/Footer';
import { Analytics } from '@vercel/analytics/next';
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration';
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt';
import { ShareProvider } from '@/context/ShareContext';
import AnonymousTestBanner from '@/components/debug/AnonymousTestBanner';
import { Suspense } from 'react';

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-noto-sans-tc',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'STELLAR | 台灣生日應援地圖',
    template: '%s | STELLAR 台灣生日應援地圖',
  },
  description: '在 STELLAR 尋找在你附近的生日應援吧！',
  keywords: ['生日應援', 'K-POP', '生日咖啡廳', '應援', 'idol', 'PWA'],
  openGraph: {
    type: 'website',
    title: 'STELLAR | 台灣生日應援地圖',
    description: '在 STELLAR 尋找在你附近的生日應援吧！',
    images: [{ url: 'https://cdn.stellar-zone.com/images/og-image.png' }],
  },
  icons: {
    icon: [
      { url: '/icon.png?v=2' },
      { url: '/icon-192x192.png?v=2', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png?v=2', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icon.png?v=2',
    apple: [
      { url: '/icon.png?v=2' },
      { url: '/icon-192x192.png?v=2', sizes: '192x192', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'STELLAR',
    startupImage: [
      {
        url: '/icon.png?v=2',
        media:
          '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icon.png?v=2',
        media:
          '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/icon.png?v=2',
        media:
          '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STELLAR | 台灣生咖應援地圖',
    description: '在 STELLAR 尋找在你附近的生日應援吧！',
    images: [{ url: 'https://cdn.stellar-zone.com/images/og-image.png' }],
    creator: '@STELLAR_TW',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="STELLAR" />
        <link rel="apple-touch-icon" href="/icon.png?v=2" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png?v=2" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png?v=2" />
      </head>
      <body className={`antialiased ${notoSansTC.variable}`}>
        <QueryProvider>
          <AuthProvider>
            <LoadingProvider>
              <ShareProvider>
                <Suspense fallback={<div style={{ height: '70px' }} />}>
                  <AnonymousTestBanner />
                  <Header />
                </Suspense>
                {children}
                <Analytics />
                <ServiceWorkerRegistration />
                <PWAInstallPrompt />
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#fff',
                      color: '#333',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      padding: '12px 16px',
                      maxWidth: '400px',
                    },
                    success: {
                      style: {
                        border: '1px solid #10b981',
                        color: '#065f46',
                      },
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#ffffff',
                      },
                    },
                    error: {
                      style: {
                        border: '1px solid #ef4444',
                        color: '#991b1b',
                      },
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#ffffff',
                      },
                    },
                  }}
                />
                <Footer />
              </ShareProvider>
            </LoadingProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
      <GoogleAnalytics gaId="G-4HGC08K6JK" />
    </html>
  );
}
