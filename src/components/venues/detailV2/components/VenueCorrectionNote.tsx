import Link from 'next/link';
import { css, cx } from '@/styled-system/css';
import { STELLAR_INSTAGRAM_URL, STELLAR_THREADS_URL } from '@/constants/stellarSocial';
import type { VenueCorrectionContactType } from '@/lib/analytics/venues';
import { inlineHitArea, textLink } from './styles';

const note = css({
  margin: 0,
  paddingX: '4',
  textStyle: 'caption',
  color: 'color.text.secondary',
});

interface VenueCorrectionNoteProps {
  onClickLink: (contactType: VenueCorrectionContactType) => void;
}

export default function VenueCorrectionNote({ onClickLink }: VenueCorrectionNoteProps) {
  return (
    <p className={note}>
      資料有誤、想更新相關資訊，可填寫
      <Link
        href="/contact"
        className={cx(textLink, inlineHitArea)}
        onClick={() => onClickLink('form')}
      >
        聯絡表單
      </Link>
      ，或私訊{' '}
      <a
        href={STELLAR_INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cx(textLink, inlineHitArea)}
        onClick={() => onClickLink('instagram')}
      >
        STELLAR IG
        <span className="sr-only">（開新分頁）</span>
      </a>
      ／
      <a
        href={STELLAR_THREADS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cx(textLink, inlineHitArea)}
        onClick={() => onClickLink('threads')}
      >
        Threads
        <span className="sr-only">（開新分頁）</span>
      </a>
      。
    </p>
  );
}
