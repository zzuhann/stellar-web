'use client';

import { usePathname } from 'next/navigation';
import { useSiteChromeStore } from '@/store/useSiteChromeStore';
import Footer from './Footer';

export default function FooterWrapper() {
  const pathname = usePathname();
  const chromeHidden = useSiteChromeStore((state) => state.hidden);
  if (chromeHidden || pathname.startsWith('/map/')) return null;
  return <Footer />;
}
