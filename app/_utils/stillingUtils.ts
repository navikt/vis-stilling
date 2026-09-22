import { format } from 'date-fns';

import { Annonsestatus, Location, Properties, Stilling } from '../types/Stilling';
import { formaterNorskDato, tilDato } from './dato';
import { StillingDTO } from '@navikt/stilling-react';

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
        visning: 'tall',
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

const ISO_DATO_FORMAT = 'yyyy-MM-dd';

/**
 * Feltene workday/workhours kommer som JSON-strenger fra stilling-api
 * (f.eks. `["Dagtid","Kveld"]`), men er typet som lister. Vi normaliserer
 * begge varianter til en vanlig liste.
 */
const tilListe = (verdi: string | readonly string[] | null | undefined): string[] | null => {
    if (verdi === null || verdi === undefined) return null;

    if (Array.isArray(verdi)) {
        const verdier = verdi.filter((v): v is string => typeof v === 'string' && v.length > 0);
        return verdier.length > 0 ? verdier : null;
    }

    const tekst = String(verdi).trim();
    if (tekst.length === 0) return null;

    if (tekst.startsWith('[')) {
        try {
            const parsert: unknown = JSON.parse(tekst);
            if (Array.isArray(parsert)) {
                const verdier = parsert.filter(
                    (v): v is string => typeof v === 'string' && v.length > 0
                );
                return verdier.length > 0 ? verdier : null;
            }
        } catch {
            // Ikke gyldig JSON – behandles som én verdi
        }
    }

    return [tekst];
};

/**
 * Datofelter kan være en faktisk dato, eller en fritekst-etikett
 * («Snarest», «Etter avtale»). Vi skiller dem, siden StillingDTO har
 * separate felter for dato og etikett.
 */
const tilDatoEllerEtikett = (
    verdi: string | Date | null | undefined
): { dato: string | null; etikett: string | null } => {
    if (verdi === null || verdi === undefined || verdi === '') {
        return { dato: null, etikett: null };
    }

    const dato = tilDato(verdi);
    if (dato) {
        return { dato: format(dato, ISO_DATO_FORMAT), etikett: null };
    }

    return { dato: null, etikett: String(verdi) };
};

const tilLokasjon = (location: Location): StillingDTO['lokasjonsliste'][number] => ({
    adresse: location.address ?? null,
    postnummer: location.postalCode ?? null,
    by: location.city ?? null,
    kommune: location.municipal ?? null,
    fylke: location.county ?? null,
    land: location.country ?? null,
});

const hentJanzzTittel = (stilling: Stilling) =>
    stilling.categoryList?.find((kategori) => kategori.categoryType === 'JANZZ')?.name ?? null;

const hentArbeidssted = (locationList: Location[]) => {
    const adresser = hentAdresser(locationList);
    if (!Array.isArray(adresser)) return null;

    const gyldigeAdresser = adresser.filter((adresse): adresse is string => Boolean(adresse));
    return gyldigeAdresser.length > 0 ? gyldigeAdresser.join(', ') : null;
};

const hentAntallStillinger = (positioncount: string | undefined) => {
    const antall = Number(positioncount);
    return Number.isFinite(antall) ? antall : null;
};

export const konverterStilling = (stilling: Stilling): StillingDTO => {
    const { properties } = stilling;
    const søknadsfrist = tilDatoEllerEtikett(properties.applicationdue);
    const oppstart = tilDatoEllerEtikett(properties.starttime);

    return {
        id: stilling.uuid,
        status: stilling.status ?? null,
        tittel: stilling.title ?? null,
        annonseTekstHtml: properties.adtext ?? null,
        arbeidsgiver: stilling.employer
            ? {
                  navn: hentBedriftensVisningsnavn(stilling) || null,
                  beskrivelseHtml: properties.employerdescription ?? null,
                  sektor: properties.sector ?? null,
                  hjemmeside: properties.employerhomepage ?? null,
              }
            : null,
        lokasjonsliste: (stilling.locationList ?? []).map(tilLokasjon),
        soknadsfristDato: søknadsfrist.dato,
        soknadsfristEtikett: søknadsfrist.etikett,
        stillingstittel: properties.jobtitle || hentJanzzTittel(stilling),
        oppstartDato: oppstart.dato,
        oppstartEtikett: oppstart.etikett,
        ansettelsestype: properties.engagementtype ?? null,
        arbeidstidsordning: properties.jobarrangement ?? null,
        arbeidstimer: tilListe(properties.workhours),
        arbeidsdager: tilListe(properties.workday),
        // Arbeidsspråk finnes ikke i stilling-api i dag
        arbeidssprak: null,
        antallStillinger: hentAntallStillinger(properties.positioncount),
        arbeidssted: hentArbeidssted(stilling.locationList),
        omfang: properties.extent ? [properties.extent] : null,
        // Stillingsprosent finnes ikke i stilling-api i dag
        stillingsprosent: null,
        oppdatert: tilDatoEllerEtikett(stilling.updated).dato,
        medium: stilling.medium ?? stilling.source ?? null,
        referanse: stilling.annonsenr ?? null,
    };
};
