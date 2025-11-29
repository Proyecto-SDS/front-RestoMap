import { useMemo, useState } from 'react';
import { calculateTotalPages, paginateItems } from '../utils/pagination';

export interface UsePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  paginatedItems: T[];
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export function usePagination<T>(
  items: T[],
  itemsPerPage: number
): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => calculateTotalPages(items.length, itemsPerPage),
    [items.length, itemsPerPage]
  );

  const paginatedItems = useMemo(
    () => paginateItems(items, currentPage, itemsPerPage),
    [items, currentPage, itemsPerPage]
  );

  const setPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    setPage(currentPage + 1);
  };

  const prevPage = () => {
    setPage(currentPage - 1);
  };

  return {
    currentPage,
    totalPages,
    paginatedItems,
    setPage,
    nextPage,
    prevPage,
  };
}
