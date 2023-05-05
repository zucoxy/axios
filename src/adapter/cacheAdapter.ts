import type { AxiosAdapter, AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import LRUCache from 'lru-cache';
import { buildSortedURL } from "../utils";
import type { CacheAdapterOption, ICacheLike } from "../types";

function isCacheLike(cache: any): cache is ICacheLike<any> {
  return (
    typeof cache.get === 'function' &&
    typeof cache.set === 'function' &&
    (typeof cache.delete === 'function' || typeof cache.del === 'function')
  );
}

const FIVE_MINUTE = 1000 * 60 * 5;

const cacheAdapter = (adapter: AxiosAdapter, cacheAdapterOption?: CacheAdapterOption): AxiosAdapter => {
  const enabledByDefault = cacheAdapterOption?.enabledByDefault;
  const defaultCache = cacheAdapterOption?.defaultCache || new LRUCache({ ttl: FIVE_MINUTE, max: 100 });
  return (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    const { url, method, params, data, paramsSerializer } = config;
    const useCache = config.useCache !== void 0 && config.useCache !== null ? config.useCache : enabledByDefault;

    if ((method === 'get' || method === 'post') && useCache) {
      const cache: ICacheLike<AxiosPromise> = isCacheLike(useCache) ? useCache : defaultCache;

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
};

export default cacheAdapter;
