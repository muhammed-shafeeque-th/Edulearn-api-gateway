import { Pagination } from '../types';

export function mapPaginationResponse<
  T extends { pageSize: number; page: number },
>(pagination: T, totalItems?: number): Pagination {
  const total =
    typeof totalItems === 'number' &&
    Number.isFinite(totalItems) &&
    totalItems > 0
      ? Math.floor(totalItems)
      : 0;
  const pageSize =
    typeof pagination.pageSize === 'number' &&
    Number.isFinite(pagination.pageSize) &&
    pagination.pageSize > 0
      ? Math.floor(pagination.pageSize)
      : 10; // Default to 10 per page for UX
  const page =
    typeof pagination.page === 'number' &&
    Number.isFinite(pagination.page) &&
    pagination.page > 0
      ? Math.floor(pagination.page)
      : 1;

  const totalPages =
    pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;

  const safePage = Math.min(page, totalPages);

  return {
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
    limit: pageSize,
    page: safePage,
    total,
    totalPages,
  };
}
