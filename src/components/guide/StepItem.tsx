import { css } from '@/styled-system/css';
import Image from 'next/image';
import Link from 'next/link';
import { GuideStep, IntroSegment } from '@/data/guide';

const stepContainer = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
  '@media (min-width: 768px)': {
    flexDirection: 'row',
    gap: '8',
    alignItems: 'flex-start',
  },
});

const imageCol = css({
  flexShrink: '0',
  '@media (min-width: 768px)': {
    width: '260px',
  },
});

const imageWrapper = css({
  position: 'relative',
  width: '100%',
  aspectRatio: '4/5',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  '@media (min-width: 768px)': {
    width: '260px',
    aspectRatio: '4/5',
  },
});

const imagePlaceholder = css({
  position: 'absolute',
  inset: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'color.text.tertiary',
  textStyle: 'bodySmall',
});

const textCol = css({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
  '@media (min-width: 768px)': {
    paddingTop: '2',
  },
});

const stepNumberBadge = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: 'radius.circle',
  background: 'color.primary',
  color: 'white',
  textStyle: 'bodySmall',
  fontWeight: 'bold',
  flexShrink: '0',
});

const stepHeader = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
});

const stepTitle = css({
  textStyle: 'h4',
  color: 'color.text.primary',
  margin: '0',
});

const stepDescription = css({
  textStyle: 'body',
  color: 'color.text.secondary',
  lineHeight: '1.8',
  margin: '0',
});

const descriptionLink = css({
  color: 'color.primary',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
});

const renderDescription = (description: GuideStep['description']) => {
  if (typeof description === 'string') return description;
  return (description as IntroSegment[]).map((seg, i) =>
    seg.type === 'link' ? (
      <Link key={i} href={seg.href} className={descriptionLink}>
        {seg.content}
      </Link>
    ) : (
      <span key={i}>{seg.content}</span>
    )
  );
};

type StepItemProps = {
  step: GuideStep;
  index: number;
};

const StepItem = ({ step, index }: StepItemProps) => {
  return (
    <li className={stepContainer}>
      <div className={imageCol}>
        <div className={imageWrapper}>
          {step.imageSrc ? (
            <Image
              src={step.imageSrc}
              alt={step.imageAlt ?? step.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 260px"
            />
          ) : (
            <div className={imagePlaceholder}>圖片</div>
          )}
        </div>
      </div>

      <div className={textCol}>
        <div className={stepHeader}>
          <span className={stepNumberBadge} aria-hidden="true">
            {index + 1}
          </span>
          <h3 className={stepTitle}>{step.title}</h3>
        </div>
        <p className={stepDescription}>{renderDescription(step.description)}</p>
      </div>
    </li>
  );
};

export default StepItem;
