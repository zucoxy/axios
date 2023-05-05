import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios';
import { isNetworkError } from '../utils';
import type { RetryAdapterOption } from '../types';

function retryAdapter(adapter: AxiosAdapter, retryAdapterOption?: RetryAdapterOption) {
  let times = retryAdapterOption?.times === undefined ? 1 : retryAdapterOption.times;
  let interval = retryAdapterOption?.delay === undefined ? 500 : retryAdapterOption.delay;
  return (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    const { retry } = config;
    if (retry) {
      let retryCount = 0;
      if (typeof retry === 'object') {
        times = Number(retry.times) || times;
        interval = Number(retry.delay) || interval;
      }
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
