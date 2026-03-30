import { css } from '@/styled-system/css';

const cardHeaderContainer = css({
  padding: '4',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  background: 'white',
});

const cardHeader = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
  marginBottom: '1',
  marginTop: '0',
  marginX: '0',
});

const cardHeaderDescription = css({
  textStyle: 'bodySmall',
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
