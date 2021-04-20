import fetchMock from 'fetch-mock';
import stilling from './eksempler/stilling.json';
import annenStilling from './eksempler/annen-stilling.json';
import upublisertStilling from './eksempler/upublisert-stilling.json';

const basePath = '/arbeid/stilling';

fetchMock
    .get(`${basePath}/api/3446abca-2b01-4409-b2fb-0af0f668d204`, stilling)
    .get(`${basePath}/api/821451e5-1515-4730-adcf-77632dff0e5e`, annenStilling)
    .get(`${basePath}/api/a7ade3d9-4468-4cbc-8125-7903615f5e05`, upublisertStilling)
    .get(url => url.startsWith(`${basePath}/api`), annenStilling);
