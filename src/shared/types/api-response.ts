export type ApiResponse<T> =
  | { success: true; message: string; data: T; pagination?: Pagination }
  | {
      success: false;
      message: string;
      error: {
        code: string;
        reason?: string;
        details?: [{ message?: string; field?: string }];
      };
    };

/**
 * Pagination metadata information for paginated API responses.
 *
 * @property page - The current page number (starting from 1).
 * @property limit - The maximum number of items per page.
 * @property total - The total number of items available across all pages.
 * @property totalPages - The total number of pages that contain results.
 * @property hasNext - True if there is a page after the current page.
 * @property hasPrev - True if there is a page before the current page.
 */
export interface Pagination {
  /** Current page number (starting from 1) */
  page: number;
  /** Maximum number of items per page */
  limit: number;
  /** Total number of items available */
  total: number;
  /** Total number of pages available */
  totalPages: number;
  /** Is there a next page? */
  hasNext: boolean;
  /** Is there a previous page? */
  hasPrev: boolean;
}

export type PaginatedResponse<T> = ApiResponse<T> & { pagination: Pagination };
