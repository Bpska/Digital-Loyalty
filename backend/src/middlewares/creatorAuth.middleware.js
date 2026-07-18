import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { Responses } from '../utils/response.js';

export function authenticateCreator(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.cookies && req.cookies.creatorToken) {
      token = req.cookies.creatorToken;
    }

    if (!token) {
      Responses.unauthorized(res, 'No creator token provided');
      return;
    }

    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (payload.role !== 'CREATOR') {
      Responses.forbidden(res, 'Access denied: not a creator');
      return;
    }

    req.creator = payload;
    next();
  } catch (err) {
    Responses.unauthorized(res, 'Invalid or expired creator token');
  }
}
