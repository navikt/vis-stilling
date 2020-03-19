import fetchMock from 'fetch-mock';
import stilling from './stilling.json';

const basePath = '/arbeid/stilling';

fetchMock.get(url => url.startsWith(`${basePath}/api`), stilling);
