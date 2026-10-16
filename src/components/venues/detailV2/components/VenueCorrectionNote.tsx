import Link from 'next/link';
import { css } from '@/styled-system/css';
import { STELLAR_INSTAGRAM_URL } from '@/constants/stellarSocial';
import { textLink } from './styles';

const note = css({
  margin: 0,
  paddingX: '4',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
});

export default function VenueCorrectionNote() {
  return (
    <p className={note}>
      資料有誤或想更新？填寫
      <Link href="/contact" className={textLink}>
        聯絡表單
      </Link>
      ，或私訊{' '}
      <a
        href={STELLAR_INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={textLink}
      >
        STELLAR IG
        <span className="sr-only">（開新分頁）</span>
      </a>
      。
    </p>
  );
}
