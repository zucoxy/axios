import axios from 'axios';
import axiosAdapter from './adapter';
import request from './interceptor/request';
import response from './interceptor/response';
import type { Http, ResType } from './types';

const instance = axios.create({
  timeout: 15000,
  headers: {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json;charset=UTF-8'
  },
  adapter: axiosAdapter()
});

// 请求拦截
instance.interceptors.request.use(request.onFulfilled, request.onRejected);

// 响应拦截
instance.interceptors.response.use(response.onFulfilled, response.onRejected);

const http: Http = {
  get(url, config) {
    return new Promise((resolve, reject) => {
      instance.get(url, config).then(
        res => resolve(res?.data || {}),
        e => resolve(e)
      );
    });
  },
  post(url, config) {
    return new Promise((resolve, reject) => {
      instance.post<ResType>(url, config?.payload, config).then(
        res => resolve(res?.data || {}),
        e => resolve(e)
      );
    });
  },
  put(url, config) {
    return new Promise((resolve, reject) => {
      instance.put(url, config == null ? undefined : config.payload, config).then(
        res => resolve(res?.data || {}),
        e => resolve(e)
      );
    });
  },
  delete(url, config) {
    return new Promise((resolve, reject) => {
      instance.delete(url, config).then(
        res => resolve(res?.data || {}),
        e => resolve(e)
      );
    });
  },
  upload(url, config) {
    return new Promise((resolve, reject) => {
      instance
        .post<ResType>(url, config.payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          ...config
        })
        .then(
          res => resolve(res?.data || {}),
          e => resolve(e)
        );
    });
  }
};
export default http;

export { instance };

export * from './useCancelToken';
export * from './types';
export * from './utils';
