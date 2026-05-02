import { css } from '@/styled-system/css';
import Link from 'next/link';

const container = css({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '1',
  paddingX: '5',
  paddingY: '2',
});

const linkStyle = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  textDecoration: 'none',
  '&:hover': { color: 'color.text.primary' },
});

const currentStyle = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  maxWidth: '180px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
});

const separatorStyle = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  opacity: 0.5,
  userSelect: 'none',
  flexShrink: 0,
});

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const BASE_URL = 'https://www.stellar-zone.com';

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${BASE_URL}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="breadcrumb" className={container}>
        {items.map((crumb, index) => (
          <span key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {index > 0 && (
              <span className={separatorStyle} aria-hidden="true">
                /
              </span>
            )}
            {crumb.href ? (
              <Link href={crumb.href} className={linkStyle}>
                {crumb.label}
              </Link>
            ) : (
              <span className={currentStyle} aria-current="page">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
