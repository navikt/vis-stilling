import { SamtykkeStatus, type Samtykke } from '../samtykke/samtykkeSchema.ts';

// Hva samtykkeboksen skal vise. Utledes fra samtykkeStatus fra backend.
export type Samtykkevisning =
    | 'INGEN_FORESPØRSEL'
    | 'UBESVART'
    | 'SVARFRIST_UTLØPT'
    | 'SAMTYKKE_UTLØPT'
    | 'SAMTYKKET'
    | 'SVART_NEI'
    | 'TRUKKET'
    | 'AVBRUTT_FORESPØRSEL';

export const lesSamtykkevisning = (samtykke: Samtykke | undefined): Samtykkevisning => {
    if (!samtykke) return 'INGEN_FORESPØRSEL';
    switch (samtykke.samtykkeStatus) {
        case SamtykkeStatus.OPPRETTET:
            return 'UBESVART';
        case SamtykkeStatus.SAMTYKKE_GITT:
            return 'SAMTYKKET';
        case SamtykkeStatus.SAMTYKKE_AVSLÅTT:
            return 'SVART_NEI';
        case SamtykkeStatus.SAMTYKKE_TRUKKET:
            return 'TRUKKET';
        case SamtykkeStatus.SAMTYKKE_UTLØPT:
            return 'SAMTYKKE_UTLØPT';
        case SamtykkeStatus.SAMTYKKE_SVARFRIST_UTLØPT:
            // Backend bruker også denne statusen når aktiviteten er avbrutt.
            if (samtykke.tilstand === 'AVBRUTT') return 'AVBRUTT_FORESPØRSEL';
            return 'SVARFRIST_UTLØPT';
    }
};
