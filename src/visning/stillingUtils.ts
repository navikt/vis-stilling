import { Location, Properties } from '../Stilling';

export const normaliserNavn = (navn: string) => {
    if (navn.length > 0) {
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

export const hentSøknadsfrist = (properties: Properties) =>
    properties.applicationdue === 'Snarest'
        ? properties.applicationdue
        : new Date(properties.applicationdue).toLocaleDateString();

export const hentAdresse = (location: Location) => {
    if (location.address) {
        if (location.postalCode && location.city) {
            return `${location.address}, ${location.postalCode} ${normaliserNavn(location.city)}`;
        }
    } else return hentKommuneOgEllerBy(location);
};
