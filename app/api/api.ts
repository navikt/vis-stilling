import { logger } from '@navikt/next-logger';

import { Stilling } from '../types/Stilling';
import {
    buildUpstreamUrl,
    getClientCredentialsToken,
    readMockData,
    shouldUseDevMocks,
} from './stilling/helpers';

const API = '/arbeid/stilling/api/stilling';

const port = process.env.PORT ?? '3000';
const defaultInternalBaseUrl = `http://127.0.0.1:${port}`;
const explicitInternalBaseUrl = process.env.INTERNAL_BASE_URL;

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

const buildApiUrl = (stillingsId: string) => `${API}/${encodeURIComponent(stillingsId)}`;

const buildInternalApiUrl = (stillingsId: string) => {
    const path = `${API}/${encodeURIComponent(stillingsId)}`;
    const resolvedBaseUrl = explicitInternalBaseUrl ?? defaultInternalBaseUrl;
    return new URL(path, resolvedBaseUrl).toString();
};

const fetchDirectlyFromUpstream = async (stillingsId: string) => {
    if (shouldUseDevMocks()) {
        const mock = await readMockData(stillingsId);
        return {
            response: new Response(JSON.stringify(mock), {
                status: 200,
                headers: {
                    'content-type': 'application/json',
                },
            }),
            upstreamUrl: 'mock-data',
        };
    }

    const url = buildUpstreamUrl(stillingsId);
    const token = await getClientCredentialsToken();

    const headers = new Headers();
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('accept', 'application/json');

    const response = await fetch(url, {
        method: 'GET',
        headers,
        cache: 'no-store',
    });

    return { response, upstreamUrl: url.toString() };
};

const tilRespons = async (
    respons: Response,
    stillingsId: string,
    url?: string
): Promise<Respons> => {
    if (respons.ok) {
        try {
            const stilling = await respons.json();
            return {
                status: Status.Suksess,
                data: transformerTilStilling(stilling),
            };
        } catch (error) {
            logger.error(
                {
                    err: error instanceof Error ? error : undefined,
                    stillingsId,
                    url,
                },
                'Klarte ikke parse stillingsdata som JSON'
            );
            return {
                status: Status.Kjøretidsfeil,
            };
        }
    }

    logger.error(
        {
            status: respons.status,
            stillingsId,
            url,
        },
        'Oppslag mot stillingsendepunktet returnerte feilstatus'
    );

    return {
        status: Status.Feil,
        statusKode: respons.status,
    };
};

export const hentStilling = async (stillingsId: string): Promise<Respons> => {
    let url: string | undefined;

    try {
        const isServer = typeof window === 'undefined';
        let respons: Response;

        if (isServer) {
            const { response, upstreamUrl } = await fetchDirectlyFromUpstream(stillingsId);
            url = upstreamUrl;
            respons = response;
        } else {
            url = buildApiUrl(stillingsId);
            respons = await fetch(buildInternalApiUrl(stillingsId), {
                method: 'GET',
                cache: 'no-store',
            });
        }

        return tilRespons(respons, stillingsId, url);
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
                url,
                årsak: causeMessage,
            },
            'Kall mot stillingsendepunktet feilet uventet'
        );

        return {
            status: Status.Kjøretidsfeil,
        };
    }
};
