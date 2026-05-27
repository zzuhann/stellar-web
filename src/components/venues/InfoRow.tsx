import { css } from '@/styled-system/css';

const row = css({
  display: 'flex',
  gap: '12px',
  padding: '11px 0',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
});

const iconWrap = css({
  width: '22px',
  height: '22px',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'color.text.secondary',
  marginTop: '2px',
});

const textWrap = css({
  minWidth: 0,
  flex: 1,
});

const labelText = css({
  fontSize: '11px',
  color: 'color.text.secondary',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
});

const valueText = css({
  marginTop: '2px',
  fontSize: '14px',
  color: 'color.text.primary',
  lineHeight: 1.5,
  wordBreak: 'break-word',
});

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

export default function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className={row}>
      <div className={iconWrap}>{icon}</div>
      <div className={textWrap}>
        <div className={labelText}>{label}</div>
        <div className={valueText}>{value}</div>
      </div>
    </div>
  );
}
