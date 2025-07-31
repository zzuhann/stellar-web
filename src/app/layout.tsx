import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { QueryProvider } from '@/lib/query-client';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: '台灣生咖地圖 | K-pop 藝人應援咖啡活動平台',
  description: '探索台灣各地 K-pop 藝人生日應援咖啡活動，一起參與粉絲應援！',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${inter.variable} antialiased`}>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
