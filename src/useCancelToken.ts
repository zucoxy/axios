import type { AxiosRequestConfig, CancelToken } from 'axios';
import axios from 'axios';
import { buildSortedURL } from './utils';

type CancelFn = (message?: string) => void;

const cancelApiMap = new Map<string, CancelFn>(); // 正在请求的 接口 map
const entryTokens = new Map<string, CancelToken | undefined>(); // 记录每个 key 当前属于哪个 cancelToken
let key = ''; // 最近一条正在请求的接口 key

/** 根据 config 生成请求的唯一标识 */
const getRequestKey = (config?: AxiosRequestConfig) => {
  if (!config) return '';
  const { url, params, paramsSerializer } = config;
  return buildSortedURL(url!, params, paramsSerializer);
};

export const useCancelTokenStore = () => {
  let cancelToken: CancelToken; // axios.config.cancelToken

  /** 生成 cancelToken 和对应的 index */
  const useCancelToken = (config?: AxiosRequestConfig) => {
    if (!config) return { cancelToken };
    const { isCancel } = config;
    const index = getRequestKey(config);
    // 自动跳过和正在请求队列中重复的请求
    const cancelFlag = cancelApiMap.has(index);
    cancelFlag && isCancel === 'recover' && cancel({ key: index });
    let cancelFn: CancelFn | undefined;
    cancelToken = new axios.CancelToken(c => {
      cancelFn = c;
    });
    if (isCancel !== false && cancelFn) {
      cancelApiMap.set(index, cancelFn);
      entryTokens.set(index, cancelToken);
    }
    key = index;
    cancelFlag && isCancel && typeof isCancel === 'boolean' && cancel({ key: index });
    return { cancelToken };
  };

  /** 取消当前请求 */
  const cancel = (cancelOption?: { key?: string; msg?: string }) => {
    const target = cancelOption?.key || key;
    const cancelFn = cancelApiMap.get(target);
    if (!cancelFn) return;
    cancelFn(cancelOption?.msg);
    // 请求已被取消，立即从队列移除；取消错误不带 config，无法走响应拦截器清理
    deleteResponseApi(target);
  };

  /** 取消所有正在请求的接口 */
  const cancelAll = () => {
    for (const cancelFn of cancelApiMap.values()) {
      cancelFn();
    }
    cancelApiMap.clear();
    entryTokens.clear();
    key = '';
  };

  /** 该请求当前是否还持有自己的取消令牌（同 key 的新请求会接管） */
  const isOwner = (config?: AxiosRequestConfig) => {
    if (!config) return false;
    return entryTokens.get(getRequestKey(config)) === config.cancelToken;
  };

  /** 删除请求响应完成的请求，默认删除最近一次请求 */
  const deleteResponseApi = (targetKey?: string) => {
    const target = targetKey === undefined ? key : targetKey;
    if (cancelApiMap.has(target)) {
      cancelApiMap.delete(target);
      entryTokens.delete(target);
      if (target === key) key = '';
    }
  };

  return {
    cancelApiMap,
    key,
    getRequestKey,
    isOwner,
    useCancelToken,
    cancel,
    cancelAll,
    deleteResponseApi,
  };
};
