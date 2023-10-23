import type { AxiosError, AxiosRequestConfig } from 'axios';

export type { AxiosError, AxiosResponse, AxiosRequestConfig, AxiosPromise } from 'axios';

export interface ResType<T = any> {
  code: number;
  data: T;
  msg: string;
  err?: string | null | AxiosError;
  url?: string;
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

export interface Http {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<ResType<T>>;
  post: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<ResType<T>>;
  put<T>(url: string, config?: AxiosRequestConfig): Promise<ResType<T>>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<ResType<T>>;
  upload<T = any>(url: string, config: AxiosRequestConfig): Promise<ResType<T>>;
}

/**
 * 扩展 axios config 类型声明
 */
declare module 'axios' {
  interface AxiosRequestConfig {
    retry?: boolean | { times?: number; delay?: number };
    useCache?: boolean | { expire?: number; max?: number };
    payload?: any;
    isCancel?: boolean | 'recover'; // 是否自动取消重复的请求。 recover 表示每次取消上一次的请求
  }
}
