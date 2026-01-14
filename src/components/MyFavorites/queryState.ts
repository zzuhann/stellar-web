import { useQueryState } from '@/hooks/useQueryState';

export const useStatus = () => {
  return useQueryState('status', {
    defaultValue: 'notEnded' as 'notEnded' | 'all',
    parse: (value) => {
      return value === 'notEnded' || value === 'all' ? value : 'notEnded';
    },
  });
};

export const useSort = () => {
  return useQueryState('sort', {
    defaultValue: 'favoritedAt' as 'favoritedAt' | 'startTime',
    parse: (value) => {
      return value === 'favoritedAt' || value === 'startTime' ? value : 'favoritedAt';
    },
  });
};

export const useSortOrder = () => {
  return useQueryState('sortOrder', {
    defaultValue: 'desc' as 'asc' | 'desc',
    parse: (value) => {
      return value === 'asc' || value === 'desc' ? value : 'desc';
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
