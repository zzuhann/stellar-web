import { css } from '@/styled-system/css';

const emptyStateContainer = css({
  textAlign: 'center',
  paddingY: '10',
  paddingX: '5',
  color: 'color.text.secondary',
});

const emptyStateIcon = css({
  fontSize: '32px',
  marginBottom: '2',
});

const emptyStateTitle = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
  marginBottom: '2',
  marginX: '0',
  marginTop: '0',
});

const emptyStateDescription = css({
  textStyle: 'bodySmall',
  margin: '0',
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
      {icon && (
        <div className={emptyStateIcon} aria-hidden="true">
          {icon}
        </div>
      )}
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
