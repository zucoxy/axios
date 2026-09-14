import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useCancelTokenStore } from '../useCancelToken';

export default {
  onFulfilled: (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // 处理取消请求
    const cancelTokenStore = useCancelTokenStore();
    const { cancelToken } = cancelTokenStore.useCancelToken(config);
    config.cancelToken = cancelToken;
    // 其他
    return config;
  },
  onRejected: (err: AxiosError) => {
    return Promise.reject(err);
  },
};
