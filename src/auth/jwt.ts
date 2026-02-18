import jwt, { JwtPayload, SignOptions, Secret } from 'jsonwebtoken';
import { JWT_SECRET as RAW_JWT_SECRET } from '../config';

const JWT_SECRET: Secret = ((): Secret => {
  if (!RAW_JWT_SECRET) throw new Error('JWT_SECRET no definido en environment variables');
  return RAW_JWT_SECRET as Secret;
})();

export type SessionPayload = { uid: string } & Record<string, unknown>;

export function sign(payload: SessionPayload, expiresIn = 9999): string {
  const opts: SignOptions = { expiresIn };
  return jwt.sign(payload as JwtPayload, JWT_SECRET, opts);
}

export function verify(token: string): SessionPayload {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (!decoded || typeof decoded === 'string') {
    throw new Error('Token inválido');
  }
  return decoded as SessionPayload;
}
