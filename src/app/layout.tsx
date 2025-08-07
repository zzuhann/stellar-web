import type { Metadata } from 'next';
import { Noto_Sans_TC } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { QueryProvider } from '@/lib/query-client';
import { Toaster } from 'react-hot-toast';
import StyledComponentsRegistry from '@/lib/styled-components-registry';

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-noto-sans-tc',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'STELLAR | 生咖應援地圖',
  description: '探索台灣各地 K-pop 藝人生日應援咖啡活動，一起參與粉絲應援！',
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
            </AuthProvider>
          </QueryProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
