import { logger } from '@navikt/next-logger';

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
    let apiUrl: string | undefined;

    try {
        apiUrl = buildApiUrl(stillingsId, baseUrl);
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

        logger.error(
            {
                status: respons.status,
                stillingsId,
                url: apiUrl,
            },
            'Oppslag mot stillingsendepunktet returnerte feilstatus'
        );

        return {
            status: Status.Feil,
            statusKode: respons.status,
        };
    } catch (error) {
        const errorDetails =
            error instanceof Error
                ? { err: error }
                : { detaljer: error, err: new Error('Ukjent feil ved henting av stilling') };

        const cause =
            error instanceof Error && 'cause' in error
                ? (error as Error & { cause?: unknown }).cause
                : undefined;

        const causeMessage =
            cause instanceof Error ? cause.message : typeof cause === 'string' ? cause : undefined;

        logger.error(
            {
                ...errorDetails,
                stillingsId,
                url: apiUrl,
                årsak: causeMessage,
            },
            'Kall mot stillingsendepunktet feilet uventet'
        );

        return {
            status: Status.Kjøretidsfeil,
        };
    }
};
