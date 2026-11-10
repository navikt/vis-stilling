import { DelingAvCv } from '../api-routes-with-obo.ts';

export const samtykkeEndepunkt = (stillingsId: string) =>
    `${DelingAvCv.internUrl}/samtykker/${encodeURIComponent(stillingsId)}`;

export const samtykkeEndepunktVeileder = (stillingsId: string) =>
    `${DelingAvCv.internUrl}/foresporsler/kandidat/${encodeURIComponent(stillingsId)}`;