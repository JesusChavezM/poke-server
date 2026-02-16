export type ApiResult<T> = {
  status: number;
  title?: string;
  message?: string;
  data?: T | null;
};
