import { GoogleAnalytics } from '@next/third-parties/google';

import type { Metadata } from 'next';
import { Noto_Sans_TC } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { QueryProvider } from '@/lib/query-client';
import { LoadingProvider } from '@/lib/loading-context';
import StyledToaster from '@/components/StyledToaster';
import Header from '@/components/header';
import FooterWrapper from '@/components/layout/FooterWrapper';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration';
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt';
import { ShareProvider } from '@/context/ShareContext';
import ClarityInit from '@/components/ClarityInit';
import GATracker from '@/components/GATracker';
import WebVitalsReporter from '@/components/WebVitalsReporter';

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-tc',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'STELLAR 台灣生咖地圖 | 生咖、生日應援活動資訊',
    template: '%s | STELLAR 台灣生咖、生日應援地圖',
  },
  description:
    'STELLAR 收錄台灣各地生咖（生日應援咖啡廳）活動，地圖瀏覽、快速找活動。偶像生日快到了？來 STELLAR 找你附近的生咖！',
  keywords: ['生日應援', 'K-POP', '生日咖啡廳', '應援', 'idol', 'PWA', '生咖', 'STELLAR'],
  openGraph: {
    type: 'website',
    title: 'STELLAR 台灣生咖地圖 | 生咖、生日應援活動資訊',
    description:
      'STELLAR 收錄台灣各地生咖（生日應援咖啡廳）活動，地圖瀏覽、快速找活動。偶像生日快到了？來 STELLAR 找你附近的生咖！',
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
    title: 'STELLAR 台灣生咖地圖 | 生咖、生日應援活動資訊',
    description:
      'STELLAR 收錄台灣各地生咖（生日應援咖啡廳）活動，地圖瀏覽、快速找活動。偶像生日快到了？來 STELLAR 找你附近的生咖！',
    images: [{ url: 'https://cdn.stellar-zone.com/images/og-image.png' }],
    creator: '@STELLAR_TW',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="STELLAR" />
        <meta name="facebook-domain-verification" content="njhhuk1cs84mvg4rhfibcyyx009m3d" />
        {/* LCP critical: image CDN + API host preconnect to save TLS handshake (~150-300ms on Mobile) */}
        <link rel="preconnect" href="https://cdn.stellar-zone.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://stellar.zeabur.app" />
        {/* Secondary origins: DNS resolution only */}
        <link rel="dns-prefetch" href="https://pub-b7b01bb9cbef44f2bdd3b7b3a5c1b4b7.r2.dev" />
        <link rel="dns-prefetch" href="https://pub-1ea260dddf7f40e4b473626d08cc1689.r2.dev" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
        <link rel="apple-touch-icon" href="/icon.png?v=2" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png?v=2" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.png?v=2" />
      </head>
      <body className={`antialiased ${notoSansTC.variable}`}>
        <a href="#main-content" className="skip-link">
          跳至主內容
        </a>
        <QueryProvider>
          <AuthProvider>
            <LoadingProvider>
              <ShareProvider>
                <Header />
                {children}
                <Analytics />
                <SpeedInsights />
                <ClarityInit />
                <GATracker />
                <WebVitalsReporter />
                <ServiceWorkerRegistration />
                <PWAInstallPrompt />
                <StyledToaster />
                <FooterWrapper />
              </ShareProvider>
            </LoadingProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
      <GoogleAnalytics gaId="G-4HGC08K6JK" />
    </html>
  );
}
