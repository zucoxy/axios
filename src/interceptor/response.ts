import type { AxiosError, AxiosResponse } from 'axios';
import { isNetworkError } from '../utils';
import { useCancelTokenStore } from '../useCancelToken';

export default {
  onFulfilled: (response: AxiosResponse): AxiosResponse => {
    // 每次请求完成，删除当前响应接口的取消请求令牌
    const { deleteResponseApi, getRequestKey } = useCancelTokenStore();
    deleteResponseApi(getRequestKey(response.config));
    return response;
  },
  onRejected: (err: AxiosError) => {
    // 请求已结束，清理该请求自己的取消令牌；同 key 的新请求已接管时不清理
    const cancelTokenStore = useCancelTokenStore();
    cancelTokenStore.isOwner(err.config) &&
      cancelTokenStore.deleteResponseApi(cancelTokenStore.getRequestKey(err.config));
    // 请求被取消
    if ((err as any)?.__CANCEL__) {
      throw {
        msg: '取消了请求',
        isCancel: true,
        err
      } as unknown as AxiosError;
    }
    // 请求超时
    if (isNetworkError(err) && err.request?.status === 0) {
      console.error('网络超时，请重试！');
      throw {
        msg: err.response?.statusText,
        url: err.config?.url,
        err: err as any
      } as unknown as AxiosError;
    }
    // 统一处理错误信息
    if (err?.isAxiosError) {
      throw {
        code: err.response?.status,
        url: err.config?.url,
        err,
        msg: err.response?.statusText
      } as unknown as AxiosError;
    }
    throw err;
  }
};
