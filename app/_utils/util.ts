import {
    erLokalt,
    skalMocke as pakkeSkalMocke,
} from '@navikt/toi-next-frontend/miljo';

export const skalMocke = pakkeSkalMocke();
export const isLocal = erLokalt();

