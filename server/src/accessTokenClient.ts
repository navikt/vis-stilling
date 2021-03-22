import fetch from 'node-fetch';
import NodeCache from 'node-cache';

const clientId = process.env.AZURE_APP_CLIENT_ID;
const clientSecret = process.env.AZURE_APP_CLIENT_SECRET;
const tenantId = process.env.AZURE_APP_TENANT_ID;

const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
const rekrutteringsbistandStillingApiScope = `api://dev-fss.arbeidsgiver.rekrutteringsbistand-api/.default`;

const cacheKey = 'access-token';
const cache = new NodeCache();

const getAccessToken = async (): Promise<AccessToken> => {
    const cachedAccessToken = cache.get<AccessToken>(cacheKey);
    if (cachedAccessToken) return cachedAccessToken;

    const formData: Record<string, string> = {
        grant_type: 'client_credentials',
        client_secret: clientSecret || '',
        client_id: clientId || '',
        scope: rekrutteringsbistandStillingApiScope,
    };

    const params = new URLSearchParams(formData);

    const response = await fetch(url, {
        method: 'POST',
        body: params as any,
    });

    if (response.ok) {
        const accessToken = await response.json();
        cache.set<AccessToken>(cacheKey, accessToken, accessToken.expires_in);
        return accessToken;
    } else {
        const tokenError: TokenError = await response.json();
        throw new Error(tokenError.error_description);
    }
};

export type AccessToken = {
    token_type: string;
    expires_in: number;
    ext_expires_in: number;
    access_token: string;
};

type TokenError = {
    error: string;
    error_description: string;
};

export default getAccessToken;
