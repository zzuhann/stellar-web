import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { css } from '@/styled-system/css';

// Inline field error (venue-tags §D: color-status-error, 14px, error icon); linked via aria-describedby

const errorText = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1',
  margin: 0,
  textStyle: 'bodySmall',
  color: 'color.status.error',
  '& svg': { width: '16px', height: '16px', flexShrink: 0, marginTop: '0.5' },
});

interface FieldErrorProps {
  id: string;
  message: string | undefined;
}

export default function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} className={errorText}>
      <ExclamationCircleIcon aria-hidden="true" />
      {message}
    </p>
  );
}
