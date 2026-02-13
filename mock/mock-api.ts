import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';

import annenStilling from './eksempler/annen-stilling.json';
import slettetStilling from './eksempler/slettet-stilling.json';
import stilling from './eksempler/stilling.json';
import upublisertStilling from './eksempler/upublisert-stilling.json';
import formatertStilling from './eksempler/formatert-stilling.json';

const basePath = '/arbeid/stilling';

const handlers = [
    http.get(`${basePath}/api/${stilling.uuid}`, () => HttpResponse.json(stilling)),
    http.get(`${basePath}/api/${annenStilling.uuid}`, () => HttpResponse.json(annenStilling)),
    http.get(`${basePath}/api/${formatertStilling.uuid}`, () => HttpResponse.json(formatertStilling)),
    http.get(`${basePath}/api/${upublisertStilling.uuid}`, () =>
        HttpResponse.json(upublisertStilling)
    ),
    http.get(`${basePath}/api/${slettetStilling.uuid}`, () => HttpResponse.json(slettetStilling)),
    http.get(`${basePath}/api/:rest*`, () => HttpResponse.json(annenStilling)),
];

const worker = setupWorker(...handlers);

void worker
    .start({
        serviceWorker: {
            url: `${basePath}/mockServiceWorker.js`,
        },
        onUnhandledRequest: 'bypass',
    })
    .catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.error('Kunne ikke starte MSW', error);
    });
