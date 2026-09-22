import { Samtykke } from '../api/deling-av-cv/useHentSamtykke.ts';

export interface Samtykkestatus {
    harSamtykket: boolean;
    harUbesvartForespørsel: boolean;
    harUtløptForespørsel: boolean;
    harSvartNei: boolean;
    harTrukketSamtykke: boolean;
}

export const lesSamtykkestatus = (samtykke: Samtykke | undefined): Samtykkestatus => {
    const status: Samtykkestatus = {
        harSamtykket: false,
        harUbesvartForespørsel: false,
        harUtløptForespørsel: false,
        harSvartNei: false,
        harTrukketSamtykke: false,
    };
    if (samtykke) {
        if (samtykke.trukket) {
            status.harTrukketSamtykke = true;
        }

        if (samtykke.svar) {
            if (samtykke.svar.harSvartJa) {
                status.harSamtykket = true;
            } else {
                status.harSvartNei = true;
            }
        } else if (new Date(samtykke.svarfrist).getTime() < Date.now()) {
            status.harUtløptForespørsel = true;
        } else {
            status.harUbesvartForespørsel = true;
        }
    } else {
        // Har ikke forespørsel
    }

    return status;
};
