import 'server-only';

import { skalMocke as pakkeSkalMocke } from '@navikt/toi-next-frontend/miljo';

export const skalMocke = pakkeSkalMocke();
export const erVeileder = process.env.ER_VEILEDER === 'true';

const PERSONVERN_PROD = 'https://www.nav.no/min-cv/personvern#deling-av-cv-med-arbeidsgivere';
const PERSONVERN_DEV =
    'https://www.ansatt.dev.nav.no/min-cv/personvern#deling-av-cv-med-arbeidsgivere';
const PERSONVERN_VEILEDER_PROD = 'https://cv-veileder.intern.nav.no/min-cv/personvern';
const PERSONVERN_VEILEDER_DEV = 'https://cv-veileder.intern.dev.nav.no/min-cv/personvern';

export const hentPersonvernlenke = (cluster = process.env.NAIS_CLUSTER_NAME): string => {
    if (cluster === 'prod-gcp') {
        return erVeileder ? PERSONVERN_VEILEDER_PROD : PERSONVERN_PROD;
    }

    return erVeileder ? PERSONVERN_VEILEDER_DEV : PERSONVERN_DEV;
};

// samtykke til deling av CV skal ikke vises i prod
export const ikkeErProd = (cluster = process.env.NAIS_CLUSTER_NAME): boolean =>
    cluster !== 'prod-gcp';
