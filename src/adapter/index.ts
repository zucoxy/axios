import axios from 'axios';
import retryAdapter from './retryAdapter';
import cacheAdapter from './cacheAdapter';

const axiosAdapter = () =>
  retryAdapter(cacheAdapter(axios.getAdapter(axios.defaults.adapter)), {
    times: 1,
    delay: 500,
  });

export default axiosAdapter;
