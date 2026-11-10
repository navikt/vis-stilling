import { initNaisAPMClient } from '@nais/apm/react';
import { DEKORATØR_URLER } from '@navikt/toi-next-frontend/apm';

import { filtrerApmHendelse } from './app/_felles/utils/apm';

initNaisAPMClient({
    namespace: 'toi',
    tracing: true,
    sessionReplay: { enabled: false },
    screenshotOnError: false,
    beforeSend: filtrerApmHendelse,
    faro: { ignoreUrls: [...DEKORATØR_URLER] },
});
