import { Metadata } from 'next';
import TermsPage from '@/components/TermsPage';

export const metadata: Metadata = {
  title: '服務條款',
  description:
    'STELLAR 用戶使用協議，規範 STELLAR 團隊與用戶的關係，包含帳號使用、個人資料保護、用戶內容授權等條款。',
};

export default function TermsRoute() {
  return <TermsPage />;
}
