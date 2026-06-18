function _nullishCoalesce(lhs, rhsFn) {
  if (lhs != null) {
    return lhs;
  } else {
    return rhsFn();
  }
}

/**
 * Resolves the real client IP address, handling proxy headers such as X-Forwarded-For.
 * 
 * @param {import('express').Request} req 
 * @returns {string} Real client IP address
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return _nullishCoalesce(req.socket.remoteAddress, () => 'unknown');
}
