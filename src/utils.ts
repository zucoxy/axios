// @ts-ignore
import buildURL from 'axios/lib/helpers/buildURL.js';

export function buildSortedURL(url: string, params?: any, options?: any) {
  const builtURL = buildURL(url, params, options);

  const [urlPath, queryString] = builtURL.split('?');

  if (queryString) {
    const paramsPair = queryString.split('&');
    return `${urlPath}?${paramsPair.sort().join('&')}`;
  }

  return builtURL;
}

// 判断是否为网络错误
export const isNetworkError = (error: any) => {
  return (
    Object.prototype.toString.call(error) === '[object Error]' &&
    (error.message.startsWith('timeout') || error.message.startsWith('Network Error'))
  );
};
