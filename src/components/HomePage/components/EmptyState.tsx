import { css } from '@/styled-system/css';

const emptyStateContainer = css({
  textAlign: 'center',
  padding: '40px 20px',
  color: 'color.text.secondary',
});

const emptyStateIcon = css({
  fontSize: '48px',
  marginBottom: '16px',
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
  icon: string;
  title: string;
  description: string;
};

const EmptyState = ({ icon, title, description }: EmptyStateProps) => {
  return (
    <div className={emptyStateContainer}>
      <div className={emptyStateIcon}>{icon}</div>
      <h3 className={emptyStateTitle}>{title}</h3>
      <p className={emptyStateDescription}>{description}</p>
    </div>
  );
};

export default EmptyState;
