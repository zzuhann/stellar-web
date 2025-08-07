import { Metadata } from 'next';
import ArtistHomePage from '@/components/layout/ArtistHomePage';

export const metadata: Metadata = {
  title: 'STELLAR | 生咖應援地圖',
  description: '探索台灣各地 K-pop 藝人生日應援咖啡活動，一起參與粉絲應援！',
};

export default function Home() {
  return <ArtistHomePage />;
}
