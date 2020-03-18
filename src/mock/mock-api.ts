import fetchMock from 'fetch-mock';
import * as stilling from './stilling.json';

const basePath = '/arbeid/stilling';

fetchMock.get(url => url.startsWith(`${basePath}/api`), stilling);
