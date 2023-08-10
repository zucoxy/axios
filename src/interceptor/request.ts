import type { AxiosError, AxiosRequestConfig } from 'axios';
import { useCancelTokenStore } from '../useCancelToken';

export default {
  onFulfilled: (config: AxiosRequestConfig): AxiosRequestConfig => {
    // 处理取消请求
    const cancelTokenStore = useCancelTokenStore();
    const { cancelToken } = cancelTokenStore.useCancelToken(config);
    config.cancelToken = cancelToken;
    // 其他
    return config;
  },
  onRejected: (err: AxiosError) => {
    return err;
  },
};
