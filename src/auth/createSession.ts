import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET as RAW_JWT_SECRET } from '../config';

if (!RAW_JWT_SECRET) throw new Error('JWT_SECRET is not defined. Set process.env.JWT_SECRET');

const JWT_SECRET: Secret = RAW_JWT_SECRET as Secret;

export type SessionPayload = {
  uid: string;
  iat?: number;
  exp?: number;
  [k: string]: unknown;
};

export function createSession(userId: string): string {
  return jwt.sign({ uid: userId } as JwtPayload, JWT_SECRET, { algorithm: 'HS256', expiresIn: '30d' });
}

export function verifySession(token: string): SessionPayload {
  const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid token payload');
  }
  return decoded as SessionPayload;
}
