import { css } from '@/styled-system/css';

const row = css({
  display: 'flex',
  gap: '3',
  paddingY: '3',
  paddingX: '0',
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
  marginTop: '0.5',
});

const textWrap = css({
  minWidth: 0,
  flex: 1,
});

const labelText = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
});

const valueText = css({
  marginTop: '0.5',
  textStyle: 'bodySmall',
  color: 'color.text.primary',
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
