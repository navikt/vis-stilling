import { type Samtykke } from './samtykkeSchema.ts';

export const hentSisteSamtykke = (samtykker: readonly Samtykke[]): Samtykke | undefined =>
    samtykker.reduce<Samtykke | undefined>(
        (siste, samtykke) =>
            !siste ||
            new Date(samtykke.deltTidspunkt).getTime() > new Date(siste.deltTidspunkt).getTime()
                ? samtykke
                : siste,
        undefined
    );
