import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const { videresend, hentAktivBruker } = vi.hoisted(() => ({
    videresend: vi.fn(),
    hentAktivBruker: vi.fn(),
}));

vi.mock('../utils/util.ts', () => ({ erVeileder: true, skalMocke: true }));
vi.mock('./obotoken.ts', () => ({ hentOboToken: vi.fn() }));
vi.mock('../../_intern/modia/hentAktivBrukes.ts', () => ({
    hentAktivBruker,
    INGEN_AKTIV_BRUKER: 'INGEN_AKTIV_BRUKER',
}));
vi.mock('@navikt/toi-next-frontend/next', () => ({
    opprettOboProxy: () => videresend,
}));

import { DelingAvCv, ModiaContextHolder } from './api-routes-with-obo.ts';
import { proxyWithOBO } from './oboProxy.ts';

describe('Aktiv bruker i veilederproxy', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        videresend.mockResolvedValue(new NextResponse(null, { status: 204 }));
        hentAktivBruker.mockResolvedValue({ ok: false, årsak: 'INGEN_AKTIV_BRUKER' });
    });

    it('videresender Modia-kall uten aktiv bruker og uten å overstyre body', async () => {
        const body = { eventType: 'NY_AKTIV_ENHET', verdi: 'syntetisk-enhet' };
        const req = new NextRequest('http://localhost/arbeid/stilling/api/modia/api/context', {
            method: 'POST',
            body: JSON.stringify(body),
        });

        const respons = await proxyWithOBO(ModiaContextHolder, req);

        expect(respons.status).toBe(204);
        expect(hentAktivBruker).not.toHaveBeenCalled();
        expect(videresend).toHaveBeenCalledWith(
            expect.objectContaining({ internUrl: ModiaContextHolder.internUrl }),
            req,
            undefined,
            undefined
        );
        expect(await req.json()).toEqual(body);
    });

    it('avviser CV-deling når ingen aktiv bruker er valgt', async () => {
        const req = new NextRequest('http://localhost/arbeid/stilling/api/deling-av-cv/test');

        const respons = await proxyWithOBO(DelingAvCv, req);

        expect(respons.status).toBe(409);
        expect(await respons.json()).toEqual({ feil: 'INGEN_AKTIV_BRUKER' });
        expect(videresend).not.toHaveBeenCalled();
    });

    it('setter aktiv ident kun på CV-delingskall', async () => {
        hentAktivBruker.mockResolvedValue({ ok: true, fnr: 'syntetisk-ident' });
        const req = new NextRequest('http://localhost/arbeid/stilling/api/deling-av-cv/test', {
            method: 'POST',
        });

        await proxyWithOBO(DelingAvCv, req);

        expect(hentAktivBruker).toHaveBeenCalledWith(req.headers);
        expect(videresend).toHaveBeenCalledWith(
            expect.objectContaining({ internUrl: DelingAvCv.internUrl }),
            req,
            undefined,
            { ident: 'syntetisk-ident' }
        );
    });
});
