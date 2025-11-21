import { logger } from '@navikt/next-logger';
import { requestAzureClientCredentialsToken } from '@navikt/oasis';
import type { NextRequest } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const upstreamBase = process.env.REKRUTTERINGSBISTAND_STILLING_API;
const upstreamPath = 'rekrutteringsbistand/ekstern/api/v1/stilling';

type LoggedError = Error & { alreadyLogged?: true };

const logAndThrow = (message: string, context?: Record<string, unknown>): never => {
    const error = new Error(message) as LoggedError;
    error.name = 'StillingsApiError';
    error.alreadyLogged = true;
    logger.error({ err: error, ...context }, message);
    throw error;
};

const buildAzureScope = () => {
    const cluster = process.env.NAIS_CLUSTER_NAME;

    const resolvedCluster =
        cluster ??
        logAndThrow('Manglende NAIS_CLUSTER_NAME miljøvariabel.', {
            kilde: 'buildAzureScope',
        });

    return `api://${resolvedCluster}.toi.rekrutteringsbistand-stilling-api/.default`;
};

const getClientCredentialsToken = async () => {
    const scope = buildAzureScope();
    const tokenResult = await requestAzureClientCredentialsToken(scope);

    if (!tokenResult.ok) {
        const reason = tokenResult.error instanceof Error ? tokenResult.error.message : undefined;
        logAndThrow('Feil ved henting av Azure klient-legitimasjonstoken.', {
            kilde: 'getClientCredentialsToken',
            scope,
            detaljer: reason,
        });
    }

    const { token } = tokenResult as typeof tokenResult & { ok: true; token: string };

    return token;
};

type RouteParams = {
    slug?: string[];
};

const isDevelopment = process.env.NODE_ENV === 'development';

const mockDirectory = join(process.cwd(), 'mock', 'eksempler');

const devMockFileByIdentifier: Record<string, string> = {
    stilling: 'stilling.json',
    '9983a5ef-e573-4ee8-b73c-7e617a1d896a': 'stilling.json',
    'annen-stilling': 'annen-stilling.json',
    annenStilling: 'annen-stilling.json',
    'c7ebcc88-02a1-4eec-80e1-f7a866744f0e': 'annen-stilling.json',
    'upublisert-stilling': 'upublisert-stilling.json',
    upublisertStilling: 'upublisert-stilling.json',
    'slettet-stilling': 'slettet-stilling.json',
    slettetStilling: 'slettet-stilling.json',
};

const defaultMockFile = 'annen-stilling.json';

const mockCache = new Map<string, unknown>();

const readMockData = async (fileName: string) => {
    const cached = mockCache.get(fileName);
    if (cached) {
        return cached;
    }

    const content = await readFile(join(mockDirectory, fileName), 'utf-8');
    const parsed = JSON.parse(content) as unknown;
    mockCache.set(fileName, parsed);
    return parsed;
};

const shouldUseDevMocks = () => isDevelopment && !upstreamBase;

const respondWithMock = async (params: RouteParams) => {
    const identifier = params.slug?.join('/') ?? '';
    const file = devMockFileByIdentifier[identifier] ?? defaultMockFile;
    const mock = await readMockData(file);

    return new Response(JSON.stringify(mock), {
        status: 200,
        headers: {
            'content-type': 'application/json',
        },
    });
};

const buildUpstreamUrl = (params: RouteParams, request: NextRequest) => {
    const base =
        upstreamBase ??
        logAndThrow('Manglende REKRUTTERINGSBISTAND_STILLING_API miljøvariabel.', {
            kilde: 'buildUpstreamUrl',
            slug: params.slug ?? [],
        });

    const identifier = params.slug?.join('/') ?? '';
    const url = new URL(`${upstreamPath}/${identifier}`, `${base.replace(/\/$/, '')}/`);

    const search = request.nextUrl.searchParams.toString();
    if (search) {
        url.search = search;
    }

    return url;
};

const copyHeaders = (source: Headers, target: Headers, keys: string[]) => {
    keys.forEach((key) => {
        const value = source.get(key);
        if (value) {
            target.set(key, value);
        }
    });
};

export async function GET(request: NextRequest, context: { params: Promise<RouteParams> }) {
    const params = await context.params;

    if (shouldUseDevMocks()) {
        return respondWithMock(params);
    }

    try {
        const url = buildUpstreamUrl(params, request);
        const token = await getClientCredentialsToken();

        const upstreamHeaders = new Headers();
        upstreamHeaders.set('Authorization', `Bearer ${token}`);
        const accepts = request.headers.get('accept');
        if (accepts) {
            upstreamHeaders.set('accept', accepts);
        }

        const upstreamResponse = await fetch(url, {
            method: 'GET',
            headers: upstreamHeaders,
            cache: 'no-store',
        });

        if (!upstreamResponse.body) {
            const text = await upstreamResponse.text();
            return new Response(text, {
                status: upstreamResponse.status,
                statusText: upstreamResponse.statusText,
            });
        }

        const response = new Response(upstreamResponse.body, {
            status: upstreamResponse.status,
            statusText: upstreamResponse.statusText,
        });

        copyHeaders(upstreamResponse.headers, response.headers, ['content-type', 'cache-control']);

        return response;
    } catch (error) {
        const identifier = params.slug?.join('/') ?? '';
        const errorDetails =
            error instanceof Error
                ? { err: error }
                : { err: new Error(typeof error === 'string' ? error : 'Ukjent feil') };

        const cause =
            error instanceof Error && 'cause' in error
                ? (error as Error & { cause?: unknown }).cause
                : undefined;

        const causeMessage =
            cause instanceof Error ? cause.message : typeof cause === 'string' ? cause : undefined;

        logger.error(
            {
                ...errorDetails,
                identifikator: identifier,
                benytterMock: shouldUseDevMocks(),
                harUpstreamBase: Boolean(upstreamBase),
                årsak: causeMessage,
            },
            'Feil ved kall til stillingsendepunktet'
        );

        const message =
            error instanceof Error ? error.message : 'Ukjent feil ved henting av stillingsdata';

        return new Response(message, {
            status: 502,
        });
    }
}
