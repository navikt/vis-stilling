import fetchMock from 'fetch-mock';
import stilling from './eksempler/stilling.json';
import annenStilling from './eksempler/annen-stilling.json';
import upublisertStilling from './eksempler/upublisert-stilling.json';

const basePath = '/arbeid/stilling';

fetchMock
    .get(`${basePath}/api/1`, stilling)
    .get(`${basePath}/api/2`, annenStilling)
    .get(`${basePath}/api/3`, upublisertStilling)
    .get(url => url.startsWith(`${basePath}/api`), annenStilling);
