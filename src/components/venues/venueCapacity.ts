import type { CapacityRange } from '@/types';

export type CapacityFilter = 'all' | CapacityRange;

export const CAPACITY_RANGE_LABEL: Record<string, string> = {
  '20以下': '20人以下',
  '20-40': '20-40人',
  '40-60': '40-60人',
  '60以上': '60人以上',
};

export const CAPACITY_OPTIONS: { id: CapacityFilter; label: string }[] = [
  { id: 'all', label: '不限' },
  { id: '20以下', label: '20人以下' },
  { id: '20-40', label: '20-40人' },
  { id: '40-60', label: '40-60人' },
  { id: '60以上', label: '60人以上' },
];
