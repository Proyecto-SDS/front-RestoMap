import { useMemo } from 'react';
import { applySorting, SortFunctions, SortOption } from '../utils/sorting';

export function useSortedData<T>(
  data: T[],
  sortOption: SortOption,
  sortFunctions: SortFunctions<T>
): T[] {
  return useMemo(() => {
    return applySorting(data, sortOption, sortFunctions);
  }, [data, sortOption, sortFunctions]);
}
