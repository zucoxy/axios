// @ts-ignore
import buildURL from 'axios/lib/helpers/buildURL';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export function buildSortedURL(...args: any[]) {
  const builtURL = buildURL(...args);

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

NProgress.configure({
  // 动画方式
  easing: 'ease',
  // 递增进度条的速度
  speed: 500,
  // 是否显示加载ico
  showSpinner: true,
  // 自动递增间隔
  trickleSpeed: 200,
  // 初始化时的最小百分比
  minimum: 0.3,
});

export const useNProgress = () => {
  return NProgress;
};
