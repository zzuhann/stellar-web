import { Metadata } from 'next';
import PrivacyPage from '@/components/PrivacyPage';

export const metadata: Metadata = {
  title: '隱私權政策',
  description:
    'STELLAR 隱私權政策，說明我們如何蒐集、處理及利用您的個人資料，包含蒐集目的、資料類別、您的權利等事項。',
  alternates: {
    canonical: 'https://www.stellar-zone.com/privacy',
  },
};

export default function PrivacyRoute() {
  return <PrivacyPage />;
}
