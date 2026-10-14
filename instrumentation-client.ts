import { initNaisAPMClient } from '@nais/apm/react';

import { filtrerApmHendelse } from './app/_utils/apm';

const DEKORATØR_URLER = [
    /^https:\/\/dekoratoren\.ekstern\.dev\.nav\.no\//,
    /^https:\/\/dekoratoren-beta\.intern\.dev\.nav\.no\//,
    /^https:\/\/dekoratoren-beta-tms\.intern\.dev\.nav\.no\//,
    /^https:\/\/www\.nav\.no\/dekoratoren\//,
];

initNaisAPMClient({
    namespace: 'toi',
    tracing: true,
    sessionReplay: { enabled: false },
    screenshotOnError: false,
    beforeSend: filtrerApmHendelse,
    faro: {
        ignoreUrls: DEKORATØR_URLER,
    },
});
