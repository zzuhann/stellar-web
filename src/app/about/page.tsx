import { Metadata } from 'next';
import AboutPage from '@/components/about/AboutPage';

export const metadata: Metadata = {
  title: '關於 STELLAR',
  description:
    '把台灣的生咖集結起來。STELLAR 是台灣 K-pop 生咖、生日應援查找平台，讓追星族輕鬆找到感興趣的活動。',
  alternates: {
    canonical: 'https://www.stellar-zone.com/about',
  },
};

export default function AboutRoute() {
  return <AboutPage />;
}
