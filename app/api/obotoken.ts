import { logger } from '@navikt/next-logger';
import {
    getToken,
    requestAzureOboToken,
    requestTokenxOboToken,
    TokenResult, validateAzureToken,
    validateTokenxToken,
    ValidationResult,
} from '@navikt/oasis';
import { erVeileder, skalMocke } from '../_utils/util.ts';

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
        let validation: ValidationResult;
        if (erVeileder) {
            logger.info("Validerer token for veileder");
            validation = await validateAzureToken(token);
        } else {
            logger.info("Validerer token for personbruker");
            validation = await validateTokenxToken(token);
        }

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
        if (skalMocke) {
            obo = ({ ok: true, token: 'DEV' } as TokenResult);
        } else if (erVeileder) {
            logger.info("Henter token for azure");
            obo = await requestAzureOboToken(token, props.scope);
        } else {
            logger.info("Henter token for tokenx");
            obo = await requestTokenxOboToken(token, props.scope);
        }

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
