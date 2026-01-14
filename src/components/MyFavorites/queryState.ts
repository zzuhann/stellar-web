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

export const useArtistIds = () => {
  return useQueryState('artistIds', {
    defaultValue: '',
    parse: (value) => value || '',
  });
};

export const usePage = () => {
  return useQueryState('page', {
    defaultValue: 1,
    parse: (value) => {
      const parsed = parseInt(value);
      return isNaN(parsed) || parsed < 1 ? 1 : parsed;
    },
  });
};
