import { Stilling } from '../Stilling';
import { erUuid } from '../visning/stillingUtils';

if (process.env.REACT_APP_MOCK) {
    require('../mock/mock-api.ts');
}

const API = '/arbeid/stilling/api';

export enum Status {
    IkkeLastet = 'IkkeLastet',
    LasterInn = 'LasterInn',
    Suksess = 'Suksess',
    Feil = 'Feil',
    Kjøretidsfeil = 'Kjøretidsfeil',
    UgyldigId = 'UgyldigId',
}

type IkkeLastet = {
    status: Status.IkkeLastet;
};

type LasterInn = {
    status: Status.LasterInn;
};

type Suksess = {
    status: Status.Suksess;
    data: Stilling;
};

type Feil = {
    status: Status.Feil;
    statusKode: number;
};

type Kjøretidsfeil = {
    status: Status.Kjøretidsfeil;
};

type UgyldigId = {
    status: Status.UgyldigId;
};

export type Respons = IkkeLastet | LasterInn | Suksess | Feil | Kjøretidsfeil | UgyldigId;

function toArray(s: string): string[] {
    try {
        return JSON.parse(s);
    } catch (err) {
        // "It's definitely legal to use try/catch, especially in a case like this. Otherwise, you'd need to do lots of string analysis stuff such as tokenizing / regex operations; which would have terrible performance." https://stackoverflow.com/a/52799327
        console.log('Ares error: ' + err);
        return [s]; // Antar at s er en enkel string a la "Lørdag" eller "Dagtid"
    }
}

export const transformerTilStilling = (data: any): Stilling => {
    console.log('TODO Are: Inne i transformerTilStilling');
    if (data?.properties) {
        const { workday, workhours } = data.properties;

        if (workday || workhours) {
            return {
                ...data,
                properties: {
                    ...data.properties,
                    workday: workday ? toArray(workday) : undefined, // "[\"Ukedager\"]"    "Ukedager"
                    workhours: workhours ? toArray(workhours) : undefined,
                },
            };
        }
    }

    return data;
};

export const hentStilling = async (stillingsId: string): Promise<Respons> => {
    if (!erUuid(stillingsId)) {
        return {
            status: Status.UgyldigId,
        };
    }

    try {
        const respons = await fetch(`${API}/${stillingsId}`, {
            method: 'GET',
        });

        if (respons.ok) {
            const stilling = await respons.json();
            console.log('TODO Are: Har hentet stilling fra backend');
            return {
                status: Status.Suksess,
                data: transformerTilStilling(stilling),
            };
        }

        return {
            status: Status.Feil,
            statusKode: respons.status,
        };
    } catch (error) {
        console.log('TODO Are: ' + error);
        return {
            status: Status.Kjøretidsfeil,
        };
    }
};
