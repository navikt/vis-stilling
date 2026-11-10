import { z } from 'zod';
import { hentOboToken } from '../obotoken.ts';
import { ModiaContextHolder } from '../api-routes-with-obo.ts';
import { skalMocke } from '../../_utils/util.ts';
import { logger } from '@navikt/next-logger';
import { identDtoSchema } from '../deling-av-cv/samtykkeSchema.ts';

export type AktivBruker =
    | { ok: true; fnr: string }
    | { ok: false; årsak: 'INGEN_AKTIV_BRUKER' | 'IKKE_AUTENTISERT' | 'FEIL' };

export const INGEN_AKTIV_BRUKER = 'INGEN_AKTIV_BRUKER';

const aktivBrukerSchema = z.object({
    aktivBruker: z.string().nullish(),
});

export const hentAktivBruker = async (headers: Headers): Promise<AktivBruker> => {
    const obo = await hentOboToken({ headers, scope: ModiaContextHolder.scope });
    if (!obo.ok) {
        return { ok: false, årsak: 'IKKE_AUTENTISERT' };
    }

    const baseUrl = skalMocke ? 'http://mock-api' : ModiaContextHolder.api_url;

    let respons: Response;
    try {
        respons = await fetch(`${baseUrl}/api/context/v2/aktivbruker`, {
            headers: { Authorization: `Bearer ${obo.token}`, Accept: 'application/json' },
            cache: 'no-store',
        });
    } catch {
        logger.error('Nettverksfeil ved henting av aktiv bruker fra modiacontextholder');
        return { ok: false, årsak: 'FEIL' };
    }

    if (!respons.ok) {
        logger.warn(`modiacontextholder svarte ${respons.status} på aktiv bruker`);
        return { ok: false, årsak: 'FEIL' };
    }

    const body = aktivBrukerSchema.safeParse(await respons.json().catch(() => null));
    if (!body.success) {
        logger.warn('Uventet format på aktiv bruker fra modiacontextholder');
        return { ok: false, årsak: 'FEIL' };
    }

    const fnr = body.data.aktivBruker;
    if (!fnr) {
        return { ok: false, årsak: 'INGEN_AKTIV_BRUKER' };
    }

    if (!identDtoSchema.shape.ident.safeParse(fnr).success) {
        logger.warn('Aktiv bruker fra modiacontextholder har ugyldig format');
        return { ok: false, årsak: 'FEIL' };
    }

    return { ok: true, fnr };
};