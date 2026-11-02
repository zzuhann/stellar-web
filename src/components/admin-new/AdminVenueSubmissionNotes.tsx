'use client';

import { useState } from 'react';
import { css } from '@/styled-system/css';
import type { VenueConditionAnswers } from '@/types';
import { buildFeeAnswerLines, buildSubmissionSupplement } from './adminVenueSubmission';

// 「店家投稿時補充」and「店家投稿時的回答」(venue-tags §E). Before confirmation the supplement
// sits on top and the answers are expanded; afterwards both fold into the answers.

const box = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  padding: '4',
  borderRadius: 'radius.lg',
  background: 'gray.50',
});

const boxTitle = css({ margin: 0, textStyle: 'bodyStrong', color: 'color.text.primary' });
const noteText = css({
  margin: 0,
  textStyle: 'bodySmall',
  color: 'color.text.primary',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
});
const line = css({ margin: 0, textStyle: 'bodySmall', color: 'color.text.primary' });
const footer = css({ margin: 0, textStyle: 'caption', color: 'color.text.secondary' });

const details = css({
  padding: '4',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
});

const summary = css({
  minHeight: '44px',
  display: 'flex',
  alignItems: 'center',
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
  cursor: 'pointer',
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.primary' },
});

const answerList = css({ display: 'flex', flexDirection: 'column', gap: '1' });

function Supplement({ answers }: { answers: VenueConditionAnswers }) {
  const supplement = buildSubmissionSupplement(answers);
  if (!supplement) return null;
  return (
    <section className={box} aria-labelledby="venue-submission-supplement-title">
      <h3 id="venue-submission-supplement-title" className={boxTitle}>
        店家投稿時補充
      </h3>
      {supplement.note && <p className={noteText}>{supplement.note}</p>}
      {supplement.remarks.map((remark) => (
        <p key={remark} className={line}>
          {remark}
        </p>
      ))}
      <p className={footer}>{supplement.footer}</p>
    </section>
  );
}

interface AdminVenueSubmissionNotesProps {
  answers: VenueConditionAnswers;
  pending: boolean;
}

export default function AdminVenueSubmissionNotes({
  answers,
  pending,
}: AdminVenueSubmissionNotesProps) {
  const [open, setOpen] = useState(pending);

  return (
    <>
      {pending && <Supplement answers={answers} />}
      <details className={details} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary className={summary}>店家投稿時的回答</summary>
        {!pending && <Supplement answers={answers} />}
        <div className={answerList}>
          {buildFeeAnswerLines(answers).map((text) => (
            <p key={text} className={line}>
              {text}
            </p>
          ))}
        </div>
      </details>
    </>
  );
}
