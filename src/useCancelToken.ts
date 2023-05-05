import type { AxiosRequestConfig, CancelToken } from 'axios';
import axios from 'axios';
import { buildSortedURL } from './utils';

const cancelApiMap = new Map(); // 正在请求的 接口 map
let key = ''; // 最近一条正在请求的接口 key

export const useCancelTokenStore = () => {
  let cancelToken: CancelToken; // axios.config.cancelToken

  /** 生成 cancelToken 和对应的 index */
  const useCancelToken = (config?: AxiosRequestConfig) => {
    if (!config) return { cancelToken };
    const { url, params, paramsSerializer, isCancel } = config || {};
    const index = buildSortedURL(url, params, paramsSerializer);
    // 自动跳过和正在请求队列中重复的请求
    let cancelFlag = false;
    if (cancelApiMap.has(index)) {
      cancelFlag = true;
    }
    cancelFlag && isCancel === 'recover' && cancel(index);
    cancelToken = new axios.CancelToken(c => {
      cancelApiMap.set(index, c);
    });
    key = index;
    cancelFlag && isCancel && typeof isCancel === 'boolean' && cancel(index);
    return { cancelToken };
  };

  /** 取消当前请求 */
  const cancel = (cancelOption?: { key?: string; msg?: string }) => {
    const cancelFn = cancelApiMap.get(cancelOption?.key || key);
    cancelFn?.(cancelOption?.msg);
  };

  /** 取消所有正在请求的接口 */
  const cancelAll = () => {
    for (const apiMap of cancelApiMap) {
      apiMap[1]();
    }
  };

  /** 删除刚请求响应完成的请求 */
  const deleteResponseApi = () => {
    if (cancelApiMap.has(key)) {
      cancelApiMap.delete(key);
      key = '';
    }
  };
  return {
    cancelApiMap,
    key,
    useCancelToken,
    cancel,
    cancelAll,
    deleteResponseApi,
  };
};
