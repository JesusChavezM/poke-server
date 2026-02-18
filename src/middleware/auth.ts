import { Request, Response, NextFunction } from 'express';
import { verifySession, SessionPayload } from '../auth/createSession';
import jwt from 'jsonwebtoken';

export function requireAuth(req: Request & { user?: SessionPayload }, res: Response, next: NextFunction) {
  try {
    const header = (req.headers.authorization || '') as string;
    if (!header) return res.status(401).json({ error: 'missing authorization header' });
    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'invalid authorization format' });
    const token = parts[1];
    if (!token) return res.status(401).json({ error: 'no token provided' });
    const decoded = verifySession(token) as SessionPayload;
    req.user = decoded;
    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      console.warn('JWT expired:', err.message);
      return res.status(401).json({ error: 'token expired' });
    }
    console.error('requireAuth verify error:', err);
    return res.status(401).json({ error: 'invalid or expired token' });
  }
}
