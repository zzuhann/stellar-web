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
  backgroundImage: 'linear-gradient(to right, #e6e6e6 5%, #cccccc 25%, #e6e6e6 35%)',
  backgroundSize: '1000px 100%',
  animation: 'shimmer 2.5s linear infinite',
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
