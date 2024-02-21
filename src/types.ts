import type { AxiosError, AxiosRequestConfig } from 'axios';

export type { AxiosError, AxiosResponse, AxiosRequestConfig, AxiosPromise } from 'axios';

export interface ResType<T = any> {
  // 错误状态码
  code: number;
  // 返回值
  data: T;
  // 返回信息
  msg: string;
  // 错误数据
  err?: string | null | AxiosError;
  // 接口异常时的请求地址
  url?: string;
  // 列表类接口统计数
  total?: number;
}

export interface RetryAdapterOption {
  // 重试的次数
  times?: number;
  // 重试时的延迟
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
  patch<T>(url: string, config?: AxiosRequestConfig): Promise<ResType<T>>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<ResType<T>>;
  upload<T = any>(url: string, config: AxiosRequestConfig): Promise<ResType<T>>;
}

/**
 * 扩展 axios config 类型声明
 */
declare module 'axios' {
  interface AxiosRequestConfig {
    // 配置接口超时是否需要自动重新发起请求
    retry?: boolean | { times?: number; delay?: number };
    // 配置接口是否使用缓存。 expire：缓存存储时长（ms） max: 最大缓存接口数
    useCache?: boolean | { expire?: number; max?: number };
    // data
    payload?: any;
    // restful api id
    id?: string | number;
    // 是否自动取消重复的请求。 recover 表示每次取消上一次的请求
    isCancel?: boolean | 'recover';
  }
}
