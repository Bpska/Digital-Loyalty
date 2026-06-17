 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }/**
 * Pagination utility — standardizes page/limit parsing and meta generation
 * for all list endpoints.
 */
















const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse and sanitize pagination query parameters from the request.
 *
 * @param query - Express req.query object (or any object with page/limit)
 */
export function parsePagination(query


) {
  const page = Math.max(1, parseInt(String(_nullishCoalesce(query.page, () => ( DEFAULT_PAGE))), 10) || DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(String(_nullishCoalesce(query.limit, () => ( DEFAULT_LIMIT))), 10) || DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Build a pagination meta object to include in list endpoint responses.
 */
export function buildPaginationMeta(
  page,
  limit,
  total
) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Convenience: parse params and build meta in one shot.
 */
export function paginate(
  query,
  total
) {
  const params = parsePagination(query);
  const meta = buildPaginationMeta(params.page, params.limit, total);
  return { params, meta };
}
