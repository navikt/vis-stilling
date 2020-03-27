import { Location, Properties, Stilling, Annonsestatus } from '../Stilling';

export const stillingInneholderPåkrevdeFelter = (data: any): boolean => {
    if (data.employer === null) return false;
    if (Object.keys(data.properties).length === 0) return false;

    return true;
};

export const stillingenErPublisert = (stilling: Stilling) => {
    if (stilling.status !== Annonsestatus.Inaktiv) {
        return true;
    }

    return stilling.deactivatedByExpiry;
};

export const normaliserNavn = (navn: string) => {
    if (navn && navn.length > 0) {
        return navn[0] + (navn.length > 1 ? navn.substring(1).toLowerCase() : '');
    } else {
        return '';
    }
};

export const hentKommuneOgEllerBy = (location: Location) => {
    if (location.municipal) {
        return normaliserNavn(location.municipal);
    }

    return null;
};

export const formaterDato = (dato: Date) => new Date(dato).toLocaleDateString();

export const hentSøknadsfrist = (properties: Properties) =>
    properties.applicationdue === 'Snarest'
        ? properties.applicationdue
        : formaterDato(properties.applicationdue);

export const hentBedriftensVisningsnavn = (stilling: Stilling) =>
    stilling.businessName ||
    normaliserNavn(stilling.employer.publicName) ||
    normaliserNavn(stilling.employer.name);

export const hentAdresse = (location: Location) => {
    if (location.address) {
        if (location.postalCode && location.city) {
            return `${location.address}, ${location.postalCode} ${normaliserNavn(location.city)}`;
        }
    } else return hentKommuneOgEllerBy(location);
};

export const lagInnerHtml = (markup: string) => ({
    __html: markup,
});
