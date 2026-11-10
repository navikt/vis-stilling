const delingAvCvBasepath = '/arbeid/stilling/api/deling-av-cv';

export const samtykkeEndepunkt = (stillingsId: string) =>
    `${delingAvCvBasepath}/samtykker/${encodeURIComponent(stillingsId)}`;

export const samtykkeEndepunktVeileder = (stillingsId: string) =>
    `${delingAvCvBasepath}/foresporsler/kandidat/${encodeURIComponent(stillingsId)}`;
