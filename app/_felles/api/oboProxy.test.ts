import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const { videresend } = vi.hoisted(() => ({
    videresend: vi.fn(),
}));

vi.mock('../utils/util.ts', () => ({ erVeileder: true, skalMocke: true }));
vi.mock('./obotoken.ts', () => ({ hentOboToken: vi.fn() }));
vi.mock('@navikt/toi-next-frontend/next', () => ({
    opprettOboProxy: () => videresend,
}));

import { DelingAvCv, ModiaContextHolder } from './api-routes-with-obo.ts';
import { proxyWithOBO } from './oboProxy.ts';

describe('Aktiv bruker i veilederproxy', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        videresend.mockResolvedValue(new NextResponse(null, { status: 204 }));
    });

    it('videresender Modia-kall uten aktiv bruker og uten å overstyre body', async () => {
        const body = { eventType: 'NY_AKTIV_ENHET', verdi: 'syntetisk-enhet' };
        const req = new NextRequest('http://localhost/arbeid/stilling/api/modia/api/context', {
            method: 'POST',
            body: JSON.stringify(body),
        });

        const respons = await proxyWithOBO(ModiaContextHolder, req);

        expect(respons.status).toBe(204);
        expect(videresend).toHaveBeenCalledWith(
            expect.objectContaining({ internUrl: ModiaContextHolder.internUrl }),
            req,
            undefined,
            undefined
        );
        expect(await req.json()).toEqual(body);
    });

    it('bevarer valgt ident i CV-delingskall uten å bytte person på serveren', async () => {
        const body = { ident: 'syntetisk-person-a' };
        const req = new NextRequest('http://localhost/arbeid/stilling/api/deling-av-cv/test', {
            method: 'POST',
            body: JSON.stringify(body),
        });

        await proxyWithOBO(DelingAvCv, req);

        expect(videresend).toHaveBeenCalledWith(
            expect.objectContaining({ internUrl: DelingAvCv.internUrl }),
            req,
            undefined,
            undefined
        );
        expect(await req.json()).toEqual(body);
    });
});
