import { useQueryState } from '@/hooks/useQueryState';

export type SortByOption = 'favorited-desc' | 'favorited-asc' | 'startTime-asc' | 'startTime-desc';

export const useShowOnlyActive = () => {
  return useQueryState('showOnlyActive', {
    defaultValue: false,
  });
};

export const useSortBy = () => {
  return useQueryState('sortBy', {
    defaultValue: 'favorited-desc' as SortByOption,
    parse: (value): SortByOption => {
      const validOptions: SortByOption[] = [
        'favorited-desc',
        'favorited-asc',
        'startTime-asc',
        'startTime-desc',
      ];
      return validOptions.includes(value as SortByOption)
        ? (value as SortByOption)
        : 'favorited-desc';
    },
  });
};

export const useArtistId = () =>
  useQueryState('artistId', {
    defaultValue: '',
    parse: (value) => value,
  });
