const uuidMønster = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const uuid = new RegExp(`^${uuidMønster}$`, 'i');
// UUID med ekstra tegn etter, f.eks. punktum eller «æ» fra lenker der teksten etter id-en har blitt med.
const uuidMedEkstraTegn = new RegExp(`^(${uuidMønster})(?![0-9a-f])`, 'i');

export type TolketStillingsId =
    | { type: 'gyldig'; stillingsId: string }
    | { type: 'omdiriger'; stillingsId: string }
    | { type: 'ugyldig' };

export const erGyldigStillingsId = (stillingsId: string | undefined | null): boolean =>
    typeof stillingsId === 'string' && uuid.test(stillingsId);

const dekod = (verdi: string): string => {
    try {
        return decodeURIComponent(verdi);
    } catch {
        return verdi;
    }
};

export const tolkStillingsId = (råStillingsId: string | undefined | null): TolketStillingsId => {
    if (!råStillingsId) {
        return { type: 'ugyldig' };
    }

    const stillingsId = dekod(råStillingsId).trim();

    if (erGyldigStillingsId(stillingsId)) {
        return stillingsId === råStillingsId
            ? { type: 'gyldig', stillingsId }
            : { type: 'omdiriger', stillingsId };
    }

    const treff = uuidMedEkstraTegn.exec(stillingsId);
    if (treff) {
        return { type: 'omdiriger', stillingsId: treff[1] };
    }

    return { type: 'ugyldig' };
};
