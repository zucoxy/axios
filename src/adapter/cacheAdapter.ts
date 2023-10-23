import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios';
import LRUCache from 'lru-cache';
import { buildSortedURL } from '../utils';
import type { ICacheLike } from '../types';

function isCacheLike(cache: any): cache is ICacheLike<any> {
  return (
    typeof cache.get === 'function' &&
    typeof cache.set === 'function' &&
    (typeof cache.delete === 'function' || typeof cache.del === 'function')
  );
}

const FIVE_MINUTE = 1000 * 60 * 5;

function cacheAdapter(adapter: AxiosAdapter): AxiosAdapter {
  return (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    const { url, method, params, data, paramsSerializer, useCache } = config;
    const expire = typeof useCache === 'object' ? useCache.expire : FIVE_MINUTE;
    const max = typeof useCache === 'object' ? useCache.max : 100;
    const lruOpt = { ttl: expire || FIVE_MINUTE, max };
    const defaultCache = new LRUCache(lruOpt);

    if ((method === 'get' || method === 'post') && useCache) {
      const cache = isCacheLike(useCache) ? useCache : defaultCache;

      const index = buildSortedURL(url, params || data, paramsSerializer);
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
