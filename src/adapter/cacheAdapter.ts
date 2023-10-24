import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios';
import LRUCache from 'lru-cache';
import { buildSortedURL } from '../utils';
import type { ICacheLike } from '../types';

function isCacheLike(cache: any): cache is ICacheLike<any> {
  return cache?.expire && cache?.max;
}

const FIVE_MINUTE = 1000 * 60 * 5;

function cacheAdapter(adapter: AxiosAdapter): AxiosAdapter {
  const lruOpt = { ttl: FIVE_MINUTE, max: 100 };
  const defaultCache = new LRUCache(lruOpt);
  // 保存自定义的缓存对象
  const configCache: Record<string, ICacheLike<any>> = {};
  return (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    const { url, method, params, data, paramsSerializer, useCache } = config;
    const expire = typeof useCache === 'object' && useCache.expire ? useCache.expire : FIVE_MINUTE;
    const max = typeof useCache === 'object' && useCache.max ? useCache.max : 100;

    if ((method === 'get' || method === 'post') && useCache) {
      const index = buildSortedURL(url, params || data, paramsSerializer);
      if (!configCache[index]) {
        configCache[index] = new LRUCache({ ttl: expire, max });
      }
      const cache = isCacheLike(useCache) ? configCache[index] : defaultCache;

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
