const fetch = require('node-fetch');

const clientId = process.env.AZURE_APP_CLIENT_ID;
const clientSecret = process.env.AZURE_APP_CLIENT_SECRET;
const tenantId = process.env.AZURE_APP_TENANT_ID;

const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
const rekrutteringsbistandStillingApiScope = `api://dev-fss.arbeidsgiver.rekrutteringsbistand-stilling-api/.default`;

async function getAccessToken() {
    const formData = {
        grant_type: 'client_credentials',
        client_secret: clientSecret,
        client_id: clientId,
        scope: rekrutteringsbistandStillingApiScope,
    };

    const params = new URLSearchParams(formData);
    const response = await fetch(url, {
        method: 'POST',
        body: params,
    });

    if (response.ok) {
        return await response.json();
    } else {
        const error = await response.json();
        console.error('Klarte ikke å hente token:', error.error_description);
    }
}

module.exports = {
    getAccessToken,
};
