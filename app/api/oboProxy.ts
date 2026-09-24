import { opprettOboProxy, type Oborute } from '@navikt/toi-next-frontend/next';
import { NextRequest} from 'next/server';
import { Iroute } from './api-routes-with-obo.ts';
import { skalMocke } from '../_utils/util.ts';
import { hentOboToken } from './obotoken.ts';

const tilOborute = (proxy: Iroute): Oborute => ({
    // I mock-modus rutes alt til http://mock-api, så api_url kan være tom
    apiUrl: proxy.api_url || (skalMocke ? 'http://mock-api' : ''),
    apiRute: proxy.api_route,
    internUrl: proxy.internUrl,
    scope: proxy.scope,
});

export const proxyWithOBO = async (
    proxy: Iroute,
    req: NextRequest,
    customRoute?: string,
    customBody?: Record<string, unknown>
) => {
    const proxyMedOBO = opprettOboProxy({
        hentToken: async () => {
            const obo = await hentOboToken({
                headers: req.headers,
                scope: proxy.scope,
            });
            return obo.ok ? obo.token : undefined;
        },
    });

    return proxyMedOBO(tilOborute(proxy), req, customRoute, customBody);
};
