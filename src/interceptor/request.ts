import type { AxiosRequestConfig } from 'axios';
import { NProgress } from '../progress';
import { useCancelTokenStore } from '../useCancelToken';

export default {
  onFulfilled: (config: AxiosRequestConfig): AxiosRequestConfig => {
    config.npLoading && NProgress.start();
    // 处理取消请求
    const cancelTokenStore = useCancelTokenStore();
    const { cancelToken } = cancelTokenStore.useCancelToken(config);
    config.cancelToken = cancelToken;
    // 其他
    return config;
  },
  onRejected: (err: any) => {
    NProgress.done();
    return err;
  },
};
