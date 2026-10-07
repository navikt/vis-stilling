import { initNaisAPMClient } from '@nais/apm/react';

import { filtrerApmHendelse } from './app/_utils/apm';

initNaisAPMClient({
    namespace: 'toi',
    tracing: true,
    sessionReplay: { enabled: false },
    screenshotOnError: false,
    beforeSend: filtrerApmHendelse,
});
