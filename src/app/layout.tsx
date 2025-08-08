import type { Metadata } from 'next';
import { Noto_Sans_TC } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { QueryProvider } from '@/lib/query-client';
import { Toaster } from 'react-hot-toast';
import StyledComponentsRegistry from '@/lib/styled-components-registry';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-noto-sans-tc',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'STELLAR | 生咖應援地圖',
    template: '%s | STELLAR 生咖應援地圖',
  },
  description: '在 STELLAR 尋找在你附近的生咖應援吧！',
  keywords: ['生咖', 'K-POP', '生日咖啡廳', '應援', 'idol'],
  openGraph: {
    type: 'website',
    title: 'STELLAR | 生咖應援地圖',
    description: '在 STELLAR 尋找在你附近的生咖應援吧！',
    images: [{ url: 'https://pub-1ea260dddf7f40e4b473626d08cc1689.r2.dev/images/og-image.png' }],
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STELLAR | 生咖應援地圖',
    description: '在 STELLAR 尋找在你附近的生咖應援吧！',
    images: [{ url: 'https://pub-1ea260dddf7f40e4b473626d08cc1689.r2.dev/images/og-image.png' }],
    creator: '@STELLAR_TW',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${notoSansTC.variable} antialiased`}>
        <StyledComponentsRegistry>
          <QueryProvider>
            <AuthProvider>
              <Header />
              {children}
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
            </AuthProvider>
          </QueryProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
