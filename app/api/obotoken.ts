import { logger } from '@navikt/next-logger';
import { getToken, requestOboToken, TokenResult, validateToken } from '@navikt/oasis';
import { skalMocke } from '../_utils/util.ts';

interface hentOboTokenProps {
    headers: Headers;
    scope: string;
}

export const hentOboToken = async (props: hentOboTokenProps): Promise<TokenResult> => {
    const token = skalMocke ? 'DEV' : getToken(props.headers);
    if (!token) {
        return {
            ok: false,
            error: new Error('Kunne ikke hente token'),
        };
    }

    if (!skalMocke) {
        const validation = await validateToken(token);
        if (!validation.ok) {
            logger.info(`Token-validering feilet — bruker blir redirectet til login: ${validation.error}`);
            return {
                ok: false,
                error: new Error('Token-validering feilet'),
            };
        }
    }

    let obo: TokenResult;
    try {
        obo = skalMocke
            ? ({ ok: true, token: 'DEV' } as TokenResult)
            : await requestOboToken(token, props.scope);

        if (!obo.ok || !obo.token) {
            return {
                ok: false,
                error: new Error('Ugyldig OBO-token mottatt'),
            };
        }

        return obo;
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(error, 'Kunne ikke hente OBO-token');
            return {
                ok: false,
                error: new Error('Kunne ikke hente OBO-token'),
            };
        } else {
            logger.error(error, 'Ukjent feil ved henting av OBO-token');
            return {
                ok: false,
                error: new Error('Ukjent feil ved henting av OBO-token'),
            };
        }
    }
};
