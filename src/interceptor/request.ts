import type { AxiosRequestConfig } from 'axios';
import { useCancelTokenStore } from '../useCancelToken';
import { useNProgress } from '../utils';

const NProgress = useNProgress();

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
