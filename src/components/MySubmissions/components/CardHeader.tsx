import { css } from '@/styled-system/css';

const cardHeaderContainer = css({
  padding: '16px',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  background: 'white',
});

const cardHeader = css({
  fontSize: '16px',
  fontWeight: '600',
  color: 'color.text.primary',
  margin: '0 0 4px 0',
});

const cardHeaderDescription = css({
  fontSize: '14px',
  color: 'color.text.secondary',
  margin: '0',
});

type CardHeaderProps = {
  title: string;
  description: string;
};

const CardHeader = ({ title, description }: CardHeaderProps) => {
  return (
    <div className={cardHeaderContainer}>
      <h2 className={cardHeader}>{title}</h2>
      <p className={cardHeaderDescription}>{description}</p>
    </div>
  );
};

export default CardHeader;
