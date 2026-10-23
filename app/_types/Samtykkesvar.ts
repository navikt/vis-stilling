import type { Samtykke } from '../api/deling-av-cv/useHentSamtykke.ts';

export type Samtykkestatus =
    'INGEN_FORESPØRSEL' | 'UBESVART' | 'UTLØPT' | 'SAMTYKKET' | 'SVART_NEI' | 'TRUKKET';

export const lesSamtykkestatus = (samtykke: Samtykke | undefined): Samtykkestatus => {
    if (!samtykke) return 'INGEN_FORESPØRSEL';
    if (samtykke.trukket) return 'TRUKKET';
    if (samtykke.svar) return samtykke.svar.harSvartJa ? 'SAMTYKKET' : 'SVART_NEI';
    return samtykke.svarfrist.getTime() < Date.now() ? 'UTLØPT' : 'UBESVART';
};
