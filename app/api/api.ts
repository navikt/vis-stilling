import { Stilling } from '../types/Stilling';

const API = '/arbeid/stilling/api';

const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

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

function attemptToParseJsonAsStringArray(jsonOrString: string): string[] {
    try {
        return JSON.parse(jsonOrString);
    } catch (err) {
        return [jsonOrString]; // Antar at input er en enkel string a la "Lørdag" eller "Dagtid"
    }
}

export const transformerTilStilling = (data: any): Stilling => {
    if (data?.properties) {
        const { workday, workhours } = data.properties;

        if (workday || workhours) {
            return {
                ...data,
                properties: {
                    ...data.properties,
                    workday: workday ? attemptToParseJsonAsStringArray(workday) : undefined,
                    workhours: workhours ? attemptToParseJsonAsStringArray(workhours) : undefined,
                },
            };
        }
    }

    return data;
};

const buildApiUrl = (stillingsId: string, baseUrl?: string) => {
    const path = `${API}/${stillingsId}`;

    if (typeof window !== 'undefined') {
        return path;
    }

    const resolvedBaseUrl = baseUrl ?? envBaseUrl ?? 'http://localhost:3000';

    return new URL(path, resolvedBaseUrl).toString();
};

export const hentStilling = async (stillingsId: string, baseUrl?: string): Promise<Respons> => {
    try {
        const apiUrl = buildApiUrl(stillingsId, baseUrl);
        const respons = await fetch(apiUrl, {
            method: 'GET',
            cache: 'no-store',
        });

        if (respons.ok) {
            const stilling = await respons.json();
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
        return {
            status: Status.Kjøretidsfeil,
        };
    }
};
