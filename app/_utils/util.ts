import {
    erLokalt,
    skalMocke as pakkeSkalMocke,
} from '@navikt/toi-next-frontend/miljo';

export const skalMocke = pakkeSkalMocke();
export const isLocal = erLokalt();
export const erVeileder = process.env.ER_VEILEDER === 'true';

const PERSONVERN_PROD = 'https://www.nav.no/min-cv/personvern#deling-av-cv-med-arbeidsgivere';
const PERSONVERN_DEV =
    'https://www.ansatt.dev.nav.no/min-cv/personvern#deling-av-cv-med-arbeidsgivere';

export const hentPersonvernlenke = (cluster = process.env.NAIS_CLUSTER_NAME): string =>
    cluster === 'prod-gcp' ? PERSONVERN_PROD : PERSONVERN_DEV;
