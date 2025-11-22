import { requestAzureClientCredentialsToken } from '@navikt/oasis';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const upstreamPath = 'rekrutteringsbistand/ekstern/api/v1/stilling';
const envUpstreamBase = process.env.STILLING_API;
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

export const getUpstreamBase = () => envUpstreamBase;

export const shouldUseDevMocks = () => isDevelopment && !envUpstreamBase;

export const readMockData = async (stillingsId: string) => {
    const file = devMockFileByIdentifier[stillingsId] ?? defaultMockFile;
    const cached = mockCache.get(file);
    if (cached) {
        return cached;
    }

    const content = await readFile(join(mockDirectory, file), 'utf-8');
    const parsed = JSON.parse(content) as unknown;
    mockCache.set(file, parsed);
    return parsed;
};

export const buildAzureScope = () => {
    const cluster = process.env.NAIS_CLUSTER_NAME;
    if (!cluster) {
        throw new Error('Manglende NAIS_CLUSTER_NAME miljøvariabel.');
    }

    return `api://${cluster}.toi.rekrutteringsbistand-stilling-api/.default`;
};

export const getClientCredentialsToken = async () => {
    const scope = buildAzureScope();
    const tokenResult = await requestAzureClientCredentialsToken(scope);

    if (!tokenResult.ok) {
        const reason = tokenResult.error instanceof Error ? tokenResult.error.message : undefined;
        throw new Error(reason ?? 'Feil ved henting av Azure klient-legitimasjonstoken.');
    }

    const { token } = tokenResult as typeof tokenResult & { ok: true; token: string };

    return token;
};

export const buildUpstreamUrl = (stillingsId: string) => {
    if (!envUpstreamBase) {
        throw new Error('Manglende STILLING_API miljøvariabel.');
    }

    const trimmedBase = envUpstreamBase.replace(/\/$/, '');

    return new URL(`${upstreamPath}/${encodeURIComponent(stillingsId)}`, `${trimmedBase}/`);
};

export const copyHeaders = (source: Headers, target: Headers, keys: string[]) => {
    keys.forEach((key) => {
        const value = source.get(key);
        if (value) {
            target.set(key, value);
        }
    });
};
