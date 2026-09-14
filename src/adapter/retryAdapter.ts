import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { isNetworkError } from '../utils';
import type { RetryAdapterOption } from '../types';

function retryAdapter(adapter: AxiosAdapter, retryAdapterOption?: RetryAdapterOption) {
  const defaultTimes = retryAdapterOption?.times === undefined ? 1 : retryAdapterOption.times;
  const defaultInterval = retryAdapterOption?.delay === undefined ? 500 : retryAdapterOption.delay;
  return (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const { retry } = config;
    if (retry) {
      let retryCount = 0;
      const retryOption: RetryAdapterOption = typeof retry === 'object' ? retry : {};
      // 重试次数和延迟按请求计算，避免请求之间互相污染
      const times = Number(retryOption.times) || defaultTimes;
      const interval = Number(retryOption.delay) || defaultInterval;
      const request = async (): Promise<AxiosResponse> => {
        try {
          return await adapter(config);
        } catch (err) {
          retryCount++;
          // 非网络错误或者配置未要求重试，则直接返回错误
          if (!isNetworkError(err) || retryCount > times) {
            return await Promise.reject(err);
          }
          // 延迟执行
          await new Promise(resolve => {
            setTimeout(() => {
              resolve(null);
            }, interval);
          });
          return await request();
        }
      };
      return request();
    } else {
      return adapter(config);
    }
  };
}

export default retryAdapter;
