import type { AxiosError, AxiosResponse } from 'axios';
import { isNetworkError } from '../utils';
import { useCancelTokenStore } from '../useCancelToken';

export default {
  onFulfilled: (response: AxiosResponse): AxiosResponse => {
    // 每次请求完成，删除当前响应接口的取消请求令牌
    const { deleteResponseApi } = useCancelTokenStore();
    deleteResponseApi();
    // 统一处理错误信息
    if ((response as unknown as AxiosError)?.isAxiosError) {
      const axiosErr = response as unknown as AxiosError;
      throw {
        code: axiosErr.response?.status,
        url: axiosErr.config?.url,
        err: axiosErr,
        msg: axiosErr.response?.statusText,
      } as unknown as AxiosError;
    }
    if ((response as any)?.__CANCEL__) {
      throw {
        msg: '取消了请求',
        err: response,
      } as unknown as AxiosError;
    }
    return response;
  },
  onRejected: (err: AxiosError) => {
    // 处理取消请求时的错误
    const cancelTokenStore = useCancelTokenStore();
    cancelTokenStore.useCancelToken(err.config);
    !err.message && cancelTokenStore.deleteResponseApi();
    // 请求超时
    if (isNetworkError(err) && err.request?.status === 0) {
      console.error('网络超时，请重试！');
      throw {
        msg: err.response?.statusText,
        url: err.config?.url,
        err: err as any,
      } as unknown as AxiosError;
    }
    return err;
  },
};
