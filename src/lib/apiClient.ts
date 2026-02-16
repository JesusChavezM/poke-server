import type { ApiResult } from 'src/types/api';
const BASE = process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2';

async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit,
  timeout = 8000
): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    clearTimeout(id);

    const status = res.status;

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      return {
        status,
        title: res.statusText || (status === 404 ? 'Not Found' : 'Error'),
        message: text || res.statusText || `HTTP ${status}`,
        data: null,
      };
    }
    const json = (await res.json()) as T;

    return {
      status,
      title: 'OK',
      message: '',
      data: json,
    };
  } catch (err: any) {
    clearTimeout(id);
    if (err?.name === 'AbortError') {
      return { status: 504, title: 'Timeout', message: 'Request timed out', data: null };
    }
    return {
      status: 502,
      title: 'Network Error',
      message: err?.message ?? String(err),
      data: null,
    };
  }
}

export async function getFromPokeApi<T>(path: string): Promise<ApiResult<T>> {
  const url = `${BASE}${path}`;
  return fetchJson<T>(url);
}
