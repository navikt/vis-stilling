import { type Oborute, opprettOboProxy } from '@navikt/toi-next-frontend/next';
import { NextRequest, NextResponse } from 'next/server';
import { Iroute } from './api-routes-with-obo.ts';
import { erVeileder, skalMocke } from '../_utils/util.ts';
import { hentOboToken } from './obotoken.ts';
import { hentAktivBruker, INGEN_AKTIV_BRUKER } from './modia/hentAktivBrukes.ts';
import { identDtoSchema } from './deling-av-cv/samtykkeSchema.ts';

const tilOborute = (proxy: Iroute): Oborute => ({
    // I mock-modus rutes alt til http://mock-api, så api_url kan være tom
    apiUrl: skalMocke ? 'http://mock-api' : proxy.api_url,
    apiRute: proxy.api_route,
    internUrl: proxy.internUrl,
    internUrlWithoutBaseUrl: proxy.internUrlWithoutBaseUrl,
    scope: proxy.scope,
});
const feil = (status: number, kode = 'FEIL') => NextResponse.json({ feil: kode }, { status });

export const proxyWithOBO = async (
    proxy: Iroute,
    req: NextRequest,
    customRoute?: string,
    customBody?: Record<string, unknown>
) => {

    if (erVeileder) {
        const aktivBruker = await hentAktivBruker(req.headers);
        if (!aktivBruker.ok) {
            switch (aktivBruker.årsak) {
                case 'INGEN_AKTIV_BRUKER':
                    return feil(409, INGEN_AKTIV_BRUKER);
                case 'IKKE_AUTENTISERT':
                    return feil(401);
                case 'FEIL':
                    return feil(502);
            }
        }
        customBody = identDtoSchema.parse({ ident: aktivBruker.fnr });
    }

    const proxyMedOBO = opprettOboProxy({
        hentToken: async () => {
            const obo = await hentOboToken({
                headers: req.headers,
                scope: proxy.scope,
            });
            return obo.ok ? obo.token : undefined;
        },
        byggMålUrl: (rute, forespørsel, overstyrtRute) => {
            const originalUrl = new URL(forespørsel.url);
            // Stien kan komme med eller uten basePath (/arbeid/stilling), så fjern hele prefikset
            const prefiks = [rute.internUrl, rute.internUrlWithoutBaseUrl].find(
                (kandidat) => kandidat && originalUrl.pathname.startsWith(kandidat)
            );
            const reststi = prefiks
                ? originalUrl.pathname.slice(prefiks.length)
                : originalUrl.pathname;
            const sti = overstyrtRute ?? `${rute.apiRute}${reststi}`;
            return `${rute.apiUrl}${sti}${originalUrl.search}`;
        },
    });

    return proxyMedOBO(tilOborute(proxy), req, customRoute, customBody);
};
