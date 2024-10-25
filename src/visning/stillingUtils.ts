import { Annonsestatus, Location, Properties, Stilling } from '../Stilling';

export const stillingInneholderPåkrevdeFelter = (data: Stilling): boolean => {
    if (data.employer === null) return false;
    if (Object.keys(data.properties).length === 0) return false;

    return true;
};

export const stillingenErPublisert = (stilling: Stilling) => {
    if (stilling.status !== Annonsestatus.Inaktiv) {
        return true;
    }

    if (stilling.deactivatedByExpiry === false) {
        return false;
    }

    return true;
};

export const normaliserNavn = (navn: string) => {
    if (navn && navn.length > 0) {
        return navn[0] + (navn.length > 1 ? navn.substring(1).toLowerCase() : '');
    } else {
        return '';
    }
};

export const hentKommuneOgEllerBy = (location: Location) => {
    if (location?.municipal) {
        return normaliserNavn(location.municipal);
    }
    return null;
};

export const formaterDato = (dato: Date) => new Date(dato).toLocaleDateString();

export const hentSøknadsfrist = (properties: Properties) =>
    konverterTilPresenterbarDato(properties.applicationdue);

export const konverterTilPresenterbarDato = (datoString?: string | null): string => {
    if (!datoString) return '';
    if (datoString === 'Snarest') return datoString;

    const presentarbarDatoString = new Date(datoString as string).toLocaleDateString('nb-NO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    return presentarbarDatoString === 'Invalid Date' ? datoString : presentarbarDatoString;
};

export const hentBedriftensVisningsnavn = (stilling: Stilling) =>
    stilling.businessName ||
    normaliserNavn(stilling.employer.publicName) ||
    normaliserNavn(stilling.employer.name);

export const hentAdresse = (location: Location) => {
    if (location?.address) {
        if (location?.postalCode && location?.city) {
            return `${location.address}, ${location.postalCode} ${normaliserNavn(location.city)}`;
        }
    } else return hentKommuneOgEllerBy(location);
};

// Hentet fra 'is-uuid': https://github.com/afram/is-uuid/blob/master/lib/is-uuid.js
export const erUuid = (kanskjeUuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(kanskjeUuid);
};

export const lagInnerHtml = (markup: string) => ({
    __html: markup,
});
