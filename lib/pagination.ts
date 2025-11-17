/**
 * Pagination utilities for API endpoints
 */

import { NextRequest } from "next/server"

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

/**
 * Parse and validate pagination parameters from request
 */
export function parsePaginationParams(request: NextRequest): PaginationParams {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "50", 10)

  // Validate and clamp values
  const validatedPage = Math.max(1, isNaN(page) ? 1 : page)
  const validatedLimit = Math.min(100, Math.max(1, isNaN(limit) ? 50 : limit))

  return {
    page: validatedPage,
    limit: validatedLimit,
  }
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit)
  const hasMore = page < totalPages

  return {
    page,
    limit,
    total,
    totalPages,
    hasMore,
  }
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: ReturnType<typeof calculatePagination>
): PaginationResult<T> {
  return {
    data,
    pagination,
  }
}

