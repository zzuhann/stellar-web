'use client';

import { css } from '@/styled-system/css';
import { useState } from 'react';
import Link from 'next/link';
import { usePageView } from '@/hooks/usePageView';
import { faqs } from './faq-data';

const inlineLink = css({
  color: 'color.link',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
  _hover: { color: 'color.linkHover' },
});

// ─── Styles ────────────────────────────────────────────────────────────────

const pageContainer = css({
  minHeight: '100vh',
  background: 'color.background.primary',
});

const inner = css({
  maxWidth: '600px',
  margin: '0 auto',
  paddingTop: '25',
  paddingX: '8',
  paddingBottom: '16',
  '@media (min-width: 768px)': {
    paddingX: '6',
  },
});

const pageTitle = css({
  textStyle: 'h2',
  color: 'color.text.primary',
  letterSpacing: '-0.01em',
  margin: '0 0 8px 0',
});

const pageDesc = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  margin: '0',
  lineHeight: '1.8',
});

const divider = css({
  border: 'none',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  margin: '0',
});

const section = css({
  paddingTop: '10',
  paddingBottom: '2',
});

const sectionLabel = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  margin: '0 0 4px 0',
});

const itemWrapper = css({
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
});

const trigger = css({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '4',
  paddingY: '5',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
});

const questionText = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
  flex: '1',
});

const chevronIcon = css({
  flexShrink: '0',
  color: 'color.text.secondary',
  transition: 'transform 0.25s ease',
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
});

const chevronIconOpen = css({
  transform: 'rotate(180deg)',
});

const panel = css({
  display: 'grid',
  gridTemplateRows: '0fr',
  transition: 'grid-template-rows 0.25s ease',
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
});

const panelOpen = css({
  gridTemplateRows: '1fr',
});

const panelInner = css({
  overflow: 'hidden',
});

const answerText = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  lineHeight: '1.8',
  margin: '0',
  paddingBottom: '5',
});

// ─── Components ────────────────────────────────────────────────────────────

type AccordionItemProps = {
  id: string;
  question: string;
  answer: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
};

function AccordionItem({ id, question, answer, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div className={itemWrapper}>
      <button
        type="button"
        className={trigger}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${id}`}
        id={`faq-trigger-${id}`}
      >
        <span className={questionText}>{question}</span>
        <svg
          className={`${chevronIcon} ${isOpen ? chevronIconOpen : ''}`}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        id={`faq-panel-${id}`}
        role="region"
        aria-labelledby={`faq-trigger-${id}`}
        className={`${panel} ${isOpen ? panelOpen : ''}`}
      >
        <div className={panelInner}>
          <p className={answerText}>{answer}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function FAQPage() {
  usePageView({ eventPage: '/faq' });

  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <main id="main-content" className={pageContainer}>
      <div className={inner}>
        <section aria-label="常見問題">
          <h1 className={pageTitle}>常見問題</h1>
          <p className={pageDesc}>
            找不到答案？歡迎透過
            <Link href="/contact" className={inlineLink}>
              聯絡頁面
            </Link>
            或私訊 Threads{' '}
            <a
              href="https://www.threads.net/@_stellar.tw"
              target="_blank"
              rel="noopener noreferrer"
              className={inlineLink}
            >
              @_stellar.tw
            </a>{' '}
            告訴我們。
          </p>
        </section>

        {faqs.map((faqSection, sectionIndex) => (
          <section key={faqSection.label} aria-label={faqSection.label}>
            {sectionIndex > 0 && <hr className={divider} />}
            <div className={section}>
              <p className={sectionLabel}>{faqSection.label}</p>
              {faqSection.items.map((item, itemIndex) => {
                const id = `${sectionIndex}-${itemIndex}`;
                return (
                  <AccordionItem
                    key={id}
                    id={id}
                    question={item.question}
                    answer={item.answer}
                    isOpen={openItems.has(id)}
                    onToggle={() => toggle(id)}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
