import { requestAzureClientCredentialsToken } from '@navikt/oasis';

const upstreamPath = 'rekrutteringsbistand/ekstern/api/v1/stilling';
const envUpstreamBase = process.env.STILLING_API;

export const getUpstreamBase = () => envUpstreamBase;

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
