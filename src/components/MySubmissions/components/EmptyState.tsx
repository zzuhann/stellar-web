import { css } from '@/styled-system/css';

const emptyStateContainer = css({
  textAlign: 'center',
  paddingY: '10',
  paddingX: '5',
  color: 'color.text.secondary',
});

const emptyStateIcon = css({
  textStyle: 'h2',
  marginBottom: '2',
});

const emptyStateTitle = css({
  textStyle: 'h4',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  marginBottom: '2',
  marginTop: '0',
  marginX: '0',
});

const emptyStateDescription = css({
  textStyle: 'bodySmall',
  marginTop: '0',
  marginX: '0',
  marginBottom: '4',
});

type EmptyStateProps = {
  icon: string;
  title: string;
  description?: string;
  cta?: React.ReactNode;
};

const EmptyState = ({ icon, title, description, cta }: EmptyStateProps) => {
  return (
    <div className={emptyStateContainer}>
      <div className={emptyStateIcon}>{icon}</div>
      <h3 className={emptyStateTitle}>{title}</h3>
      {description && <p className={emptyStateDescription}>{description}</p>}
      {cta && cta}
    </div>
  );
};

export default EmptyState;
