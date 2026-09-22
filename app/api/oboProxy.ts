import { opprettOboProxy, type Oborute } from '@navikt/toi-next-frontend/next';
import { NextRequest, NextResponse } from 'next/server';
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

// Setter Content-Type og fjerner AMP_-cookies før forespørselen videresendes
const forberedHeaders = (headers: Headers): Headers => {
    const nye = new Headers(headers);
    nye.set('Content-Type', 'application/json');

    const cookie = nye.get('cookie');
    if (cookie) {
        const filtrert = cookie
            .split(';')
            .filter((c) => !c.trim().startsWith('AMP_'))
            .join(';');
        if (filtrert) {
            nye.set('cookie', filtrert);
        } else {
            nye.delete('cookie');
        }
    }
    return nye;
};

const normaliserRespons = async (respons: Response, forespørsel: Request): Promise<Response> => {
    if (!respons.ok) {
        return new NextResponse(respons.body, {
            status: respons.status,
            statusText: respons.statusText,
            headers: respons.headers,
        });
    }

    if (respons.status === 204) {
        return new NextResponse(null, {
            status: 204,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const contentType = respons.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        const text = await respons.text();
        if (!text || text.trim() === '') {
            return NextResponse.json(forespørsel.method === 'GET' ? null : { success: true }, {
                status: respons.status,
            });
        }
        try {
            return NextResponse.json(JSON.parse(text));
        } catch {
            return NextResponse.json(
                { beskrivelse: 'Invalid JSON response from backend' },
                { status: 502 }
            );
        }
    }

    const text = await respons.text();
    return new NextResponse(text || '', {
        status: respons.status,
        headers: { 'Content-Type': contentType || 'text/plain' },
    });
};

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
        lagFeilrespons: (beskrivelse, status) => NextResponse.json({ beskrivelse }, { status }),
        byggMålUrl: (rute, forespørsel, overstyrtRute) => {
            const originalUrl = new URL(forespørsel.url);
            const path = rute.apiRute + originalUrl.pathname.replace(rute.internUrl, '');
            const newUrl = overstyrtRute
                ? `${rute.apiUrl}${overstyrtRute}${originalUrl.search}`
                : `${rute.apiUrl}${path}${originalUrl.search}`;
            return skalMocke
                ? `http://mock-api${originalUrl.pathname}${originalUrl.search}`
                : newUrl;
        },
        normaliserRespons,
        transformerHeaders: forberedHeaders,
    });

    return proxyMedOBO(tilOborute(proxy), req, customRoute, customBody);
};
