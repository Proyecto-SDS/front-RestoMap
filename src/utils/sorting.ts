export type SortOption = string;

export interface SortFunctions<T> {
  [key: string]: (a: T, b: T) => number;
}

export const sortByDateDesc = (dateA: string, dateB: string): number => {
  return new Date(dateB).getTime() - new Date(dateA).getTime();
};

export const sortByDateAsc = (dateA: string, dateB: string): number => {
  return new Date(dateA).getTime() - new Date(dateB).getTime();
};

export const sortByRatingDesc = (ratingA: number, ratingB: number): number => {
  return ratingB - ratingA;
};

export const sortByRatingAsc = (ratingA: number, ratingB: number): number => {
  return ratingA - ratingB;
};

export const sortAlphabeticalAsc = (nameA: string, nameB: string): number => {
  return nameA.localeCompare(nameB);
};

export const sortAlphabeticalDesc = (nameA: string, nameB: string): number => {
  return nameB.localeCompare(nameA);
};

export function applySorting<T>(
  data: T[],
  sortOption: SortOption,
  sortFunctions: SortFunctions<T>
): T[] {
  const sortFn = sortFunctions[sortOption];
  if (!sortFn) {
    return data;
  }
  return [...data].sort(sortFn);
}
