import type { ReactNode } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { css, cx } from '@/styled-system/css';
import {
  checkMark,
  chip,
  choiceCard,
  choiceDescription,
  choiceTitle,
  plainCheckRow,
  radioMark,
  srOnly,
} from '../styles';

// Native inputs stay in the tab order (visually hidden); the label is the visible control

const cardText = css({ display: 'flex', flexDirection: 'column', gap: '0.5', minWidth: 0 });
const cardIcon = css({
  width: '28px',
  height: '28px',
  flexShrink: 0,
  color: 'color.primary',
  '& svg': { width: '28px', height: '28px' },
});
const expandedBox = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  paddingX: '4',
  paddingBottom: '3',
});

const radioCardWrap = css({
  borderRadius: 'radius.lg',
  border: '1px solid',
  borderColor: 'color.border.medium',
  background: 'color.background.primary',
  '&[data-checked="true"]': {
    borderWidth: '2px',
    borderColor: 'color.primary',
    background: 'alpha.primary.10',
  },
  '& > label': { border: 'none', background: 'transparent' },
  // Keep content still when the wrapper border thickens to 2px
  '&[data-checked="true"] > label': {
    padding: 'calc(token(spacing.3) - 1px) calc(token(spacing.4) - 1px)',
  },
});

interface CheckCardProps {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckCard({ id, title, description, icon, checked, onChange }: CheckCardProps) {
  return (
    <label htmlFor={id} className={choiceCard()} data-checked={checked}>
      <input
        id={id}
        type="checkbox"
        className={srOnly}
        checked={checked}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={cardIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={cardText}>
        <span id={`${id}-title`} className={choiceTitle}>
          {title}
        </span>
        <span id={`${id}-description`} className={choiceDescription}>
          {description}
        </span>
      </span>
      <span className={checkMark} aria-hidden="true">
        <CheckIcon strokeWidth={2.5} />
      </span>
    </label>
  );
}

interface RadioCardProps {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onSelect: () => void;
  // Shown inside the card while selected (e.g. the account input, the limited-offer date)
  children?: ReactNode;
}

export function RadioCard({ id, name, label, checked, onSelect, children }: RadioCardProps) {
  return (
    // The wrapper carries the checked state so the expanded area shares one tint
    <div className={radioCardWrap} data-checked={checked}>
      <label htmlFor={id} className={choiceCard()}>
        <input
          id={id}
          type="radio"
          name={name}
          className={srOnly}
          checked={checked}
          onChange={onSelect}
        />
        <span className={choiceTitle}>{label}</span>
        <span className={radioMark} aria-hidden="true" />
      </label>
      {checked && children && <div className={expandedBox}>{children}</div>}
    </div>
  );
}

interface ChipProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Chip({ id, label, checked, onChange }: ChipProps) {
  return (
    <label htmlFor={id} className={chip} data-checked={checked}>
      <input
        id={id}
        type="checkbox"
        className={srOnly}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <CheckIcon aria-hidden="true" strokeWidth={2.5} />
      {label}
    </label>
  );
}

interface PlainCheckProps {
  id: string;
  label: string;
  checked: boolean;
  className?: string;
  onChange: (checked: boolean) => void;
}

export function PlainCheck({ id, label, checked, className, onChange }: PlainCheckProps) {
  return (
    <label htmlFor={id} className={cx(plainCheckRow, className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
