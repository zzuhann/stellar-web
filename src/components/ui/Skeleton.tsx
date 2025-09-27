import { css } from '@/styled-system/css';
import { CSSProperties } from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: CSSProperties;
  className?: string;
}

const skeletonBase = css({
  display: 'block',
  backgroundColor: '#e6e6e6',
  position: 'relative',
  overflow: 'hidden',

  '&::after': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, #cccccc, transparent)',
    transform: 'translateX(-100%)',
    animation: 'shimmer 1.8s ease-in-out infinite',
    willChange: 'transform',
  },
});

export default function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  style,
  className,
}: SkeletonProps) {
  const formatValue = (value: string | number) => {
    return typeof value === 'number' ? `${value}px` : value;
  };

  const skeletonStyle: CSSProperties = {
    width: formatValue(width),
    height: formatValue(height),
    borderRadius: formatValue(borderRadius),
    ...style,
  };

  return <div className={`${skeletonBase} ${className || ''}`} style={skeletonStyle} />;
}
