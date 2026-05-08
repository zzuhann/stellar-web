import { Metadata } from 'next';
import GuidePage from '@/components/guide/GuidePage';
import { guideSections } from '@/data/guide';

export const metadata: Metadata = {
  title: '投稿方式',
  description:
    '了解如何在 STELLAR 投稿生咖、生日應援與藝人、團體，只需要幾個步驟就可以完成投稿囉！',
  alternates: {
    canonical: 'https://www.stellar-zone.com/guide',
  },
};

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function GuideRoute({ searchParams }: Props) {
  const { tab } = await searchParams;
  const activeId = guideSections.some((s) => s.id === tab) ? tab : guideSections[0].id;

  return <GuidePage activeId={activeId ?? guideSections[0].id} />;
}
