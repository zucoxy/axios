import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import LRUCache from 'lru-cache';
import { buildSortedURL } from '../utils';
import type { ICacheLike } from '../types';

function isCacheLike(cache: any): cache is ICacheLike<any> {
  return (
    typeof cache?.get === 'function' &&
    typeof cache?.set === 'function' &&
    (typeof cache?.delete === 'function' || typeof cache?.del === 'function')
  );
}

const FIVE_MINUTE = 1000 * 60 * 5;

function cacheAdapter(adapter: AxiosAdapter): AxiosAdapter {
  // 相同 expire/max 的配置复用同一个缓存实例，避免为每个 url 都新建缓存
  const caches: Record<string, ICacheLike<any>> = {};
  return (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const { url, method, params, data, payload, paramsSerializer, useCache } = config;

    if ((method === 'get' || method === 'post') && useCache) {
      const index = buildSortedURL(url!, payload || params || data, paramsSerializer);

      let cache: ICacheLike<any>;
      if (isCacheLike(useCache)) {
        // 使用调用方传入的自定义缓存
        cache = useCache;
      } else {
        const expire = typeof useCache === 'object' && useCache.expire ? useCache.expire : FIVE_MINUTE;
        const max = typeof useCache === 'object' && useCache.max ? useCache.max : 100;
        const cacheKey = `${expire}|${max}`;
        if (!caches[cacheKey]) caches[cacheKey] = new LRUCache({ ttl: expire, max });
        cache = caches[cacheKey];
      }

      let responsePromise = cache.get(index);

      if (!responsePromise) {
        responsePromise = (async () => {
          try {
            return await adapter(config);
          } catch (reason) {
            'delete' in cache ? cache.delete(index) : cache.del(index);
            throw reason;
          }
        })();
        cache.set(index, responsePromise);
        return responsePromise;
      }
      return responsePromise;
    }
    return adapter(config);
  };
}

export default cacheAdapter;
