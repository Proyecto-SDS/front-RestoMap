export interface PaginationResult<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export function paginateItems<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number
): T[] {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
}

export function calculateTotalPages(
  totalItems: number,
  itemsPerPage: number
): number {
  return Math.ceil(totalItems / itemsPerPage);
}

export function isValidPage(page: number, totalPages: number): boolean {
  return page >= 1 && page <= totalPages;
}

export function getPaginationInfo<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number
): PaginationResult<T> {
  const totalPages = calculateTotalPages(items.length, itemsPerPage);
  const validPage = isValidPage(currentPage, totalPages) ? currentPage : 1;
  const paginatedItems = paginateItems(items, validPage, itemsPerPage);

  return {
    items: paginatedItems,
    totalPages,
    currentPage: validPage,
    totalItems: items.length,
  };
}
