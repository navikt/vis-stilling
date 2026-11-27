import { type Samtykke } from './samtykkeSchema.ts';

export const hentSisteSamtykke = (samtykker: readonly Samtykke[]): Samtykke | undefined => {
    const siste = samtykker.reduce<Samtykke | undefined>(
        (siste, samtykke) =>
            !siste ||
            new Date(samtykke.deltTidspunkt).getTime() > new Date(siste.deltTidspunkt).getTime()
                ? samtykke
                : siste,
        undefined
    );
    // Hvis nyeste forespørsel er fra den gamle løsningen (brukerAkas = false) skal det ikke vises noe
    return siste?.brukerAkas ? siste : undefined;
};
