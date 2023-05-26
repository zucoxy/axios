import type { AxiosError, AxiosPromise, AxiosRequestConfig } from 'axios';
export type { AxiosError, AxiosResponse, AxiosRequestConfig, AxiosPromise } from 'axios';

export interface ResType<T = any> {
  code: number;
  data: T;
  msg: string;
  err?: string | null | AxiosError;
  total?: number;
}

export interface RetryAdapterOption {
  times?: number;
  delay?: number;
}

export type ICacheLike<T> = {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
} & ({ del(key: string): void } | { delete(key: string): void });

export interface CacheAdapterOption {
  enabledByDefault?: boolean;
  defaultCache?: ICacheLike<AxiosPromise>;
}

export interface Http {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<ResType<T>>;
  post<T>(url: string, config?: AxiosRequestConfig): Promise<ResType<T>>;
  upload<T>(url: string, config: AxiosRequestConfig): Promise<ResType<T>>;
}

export interface UAxiosRequestConfig {
  npLoading?: boolean; // 请求时是否加载进度条
  retry?: boolean | { times?: number; delay?: number };
  useCache?: boolean;
  payload?: unknown;
  isCancel?: boolean | 'recover'; // 是否自动取消重复的请求。 recover 表示每次取消上一次的请求
}

/**
 * 扩展 axios config 类型声明
 */
declare module 'axios' {
  interface AxiosRequestConfig extends UAxiosRequestConfig {}
}
