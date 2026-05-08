'use client';

import { useEffect, useRef, useState } from 'react';
import { css } from '@/styled-system/css';

type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
  delay?: number;
};

const card = css({
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  padding: '6',
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
  transition: 'opacity 0.5s ease, transform 0.5s ease, box-shadow 0.2s ease',
  '&[data-visible="false"]': {
    opacity: '0',
    transform: 'translateY(24px)',
  },
  '&[data-visible="true"]': {
    opacity: '1',
    transform: 'translateY(0)',
  },
  '&:hover': {
    boxShadow: 'shadow.md',
  },
});

const iconStyle = css({
  fontSize: '26px',
  lineHeight: '1',
});

const titleStyle = css({
  textStyle: 'bodyStrong',
  color: 'color.text.primary',
  margin: '0',
});

const descStyle = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  margin: '0',
  lineHeight: '1.75',
});

const FeatureCard = ({ icon, title, description, delay = 0 }: FeatureCardProps) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [delay]);

  return (
    <div ref={ref} className={card} data-visible={String(visible)}>
      <div className={iconStyle} aria-hidden="true">
        {icon}
      </div>
      <h3 className={titleStyle}>{title}</h3>
      <p className={descStyle}>{description}</p>
    </div>
  );
};

export default FeatureCard;
