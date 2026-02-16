import type { Response } from 'express';
import type { ApiResult } from 'src/types/api';

export function sendResult<T>(res: Response, result: ApiResult<T>) {
  return res.status(result.status).json({
    status: result.status,
    title: result.title ?? (result.status >= 200 && result.status < 300 ? 'OK' : 'Error'),
    message: result.message ?? '',
    data: result.data ?? null,
  });
}
