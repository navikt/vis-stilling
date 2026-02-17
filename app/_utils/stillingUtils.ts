import { Annonsestatus, Location, Properties, Stilling } from '../types/Stilling';
import { formaterNorskDato } from './dato';

export const stillingInneholderPåkrevdeFelter = (data: Stilling): boolean => {
    if (data.employer === null) return false;
    return Object.keys(data.properties).length !== 0;


};

export const stillingenErPublisert = (stilling: Stilling) => {
    if (stilling.status !== Annonsestatus.Inaktiv) {
        return true;
    }

    return stilling.deactivatedByExpiry !== false;


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

export const hentSøknadsfrist = (properties: Properties) =>
    konverterTilPresenterbarDato(properties.applicationdue);

export const konverterTilPresenterbarDato = (datoString?: string | null): string => {
    if (!datoString) return '';
    if (datoString === 'Snarest') return datoString;
    const presenterbarDato = formaterNorskDato({
        dato: datoString,
        visning: 'tall'
    });
    if (presenterbarDato) return presenterbarDato;
    else return '';
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

export const hentAdresser = (locationList: Location[]) => {
    if (locationList && locationList.length) {
        return locationList.map((location) => hentAdresse(location));
    }

    return '';
};

export const lagInnerHtml = (markup: string) => ({
    __html: markup,
});
