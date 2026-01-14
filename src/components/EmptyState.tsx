import { css } from '@/styled-system/css';

const emptyStateContainer = css({
  textAlign: 'center',
  padding: '40px 20px',
  color: 'color.text.secondary',
});

const emptyStateIcon = css({
  fontSize: '32px',
  marginBottom: '8px',
});

const emptyStateTitle = css({
  fontSize: '18px',
  fontWeight: '600',
  color: 'color.text.primary',
  margin: '0 0 8px 0',
});

const emptyStateDescription = css({
  fontSize: '14px',
  margin: '0',
  lineHeight: '1.5',
});

type EmptyStateProps = {
  icon?: string;
  title?: string;
  description?: string | React.ReactNode;
  cta?: React.ReactNode;
  style?: React.CSSProperties;
};

const EmptyState = ({ icon, title, description, cta, style }: EmptyStateProps) => {
  return (
    <div className={emptyStateContainer} style={style}>
      {icon && <div className={emptyStateIcon}>{icon}</div>}
      {title && <h3 className={emptyStateTitle}>{title}</h3>}
      {description &&
        (typeof description === 'string' ? (
          <p className={emptyStateDescription}>{description}</p>
        ) : (
          description
        ))}
      {cta && cta}
    </div>
  );
};

export default EmptyState;
