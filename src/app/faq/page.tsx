import { Metadata } from 'next';
import FAQPage from '@/components/faq/FAQPage';
import { faqs } from '@/components/faq/faq-data';

export const metadata: Metadata = {
  title: '常見問題 | STELLAR',
  description: 'STELLAR 常見問題解答，包含生咖查詢、活動投稿、帳號功能等說明。',
  alternates: {
    canonical: 'https://www.stellar-zone.com/faq',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.flatMap((section) =>
    section.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answerText,
      },
    }))
  ),
};

export default function FAQRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FAQPage />
    </>
  );
}
