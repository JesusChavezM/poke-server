import type { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code ?? 'ERROR',
      details: err.details ?? undefined,
    });
  }
  console.error('[UNHANDLED ERROR]', err);
  return res.status(500).json({
    error: 'Internal server error',
  });
}
