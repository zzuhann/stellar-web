import { Metadata } from 'next';
import ContactPage from '@/components/contact/ContactPage';

export const metadata: Metadata = {
  title: '聯絡我們 | STELLAR',
  description: '若有任何問題或建議，或希望移除作品，請填寫下方表單與 STELLAR 聯絡。',
  alternates: {
    canonical: 'https://www.stellar-zone.com/contact',
  },
};

export default function ContactRoute() {
  return <ContactPage />;
}
