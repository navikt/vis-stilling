import { logger } from '@navikt/next-logger';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Status, hentStilling } from './api';

vi.mock('@navikt/next-logger', () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('./stilling/helpers', () => ({
    buildUpstreamUrl: (stillingsId: string) =>
        new URL(`https://stilling-api.test/stilling/${encodeURIComponent(stillingsId)}`),
    getClientCredentialsToken: async () => 'token',
    shouldUseDevMocks: () => false,
    erMockStillingsId: () => false,
    readMockData: vi.fn(),
}));

const uuid = '9983a5ef-e573-4ee8-b73c-7e617a1d896a';

describe('hentStilling', () => {
    const fetchMock = vi.fn<typeof fetch>();

    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it.each([['undefined'], [`${uuid}.`], [`${uuid}æ`], [`${uuid}%C3%83%C2%A6`], ['']])(
        'kaller ikke backend for ugyldig id %s',
        async (id) => {
            const respons = await hentStilling(id);

            expect(respons).toEqual({ status: Status.UgyldigId });
            expect(fetchMock).not.toHaveBeenCalled();
            expect(logger.error).not.toHaveBeenCalled();
        }
    );

    it('henter stilling for gyldig UUID', async () => {
        fetchMock.mockResolvedValue(Response.json({ uuid, title: 'Tittel' }));

        const respons = await hentStilling(uuid);

        expect(respons).toEqual({ status: Status.Suksess, data: { uuid, title: 'Tittel' } });
        expect(fetchMock).toHaveBeenCalledOnce();
    });

    it('logger 404 som warn, ikke error', async () => {
        fetchMock.mockResolvedValue(new Response('Not found', { status: 404 }));

        const respons = await hentStilling(uuid);

        expect(respons).toEqual({ status: Status.Feil, statusKode: 404 });
        expect(logger.warn).toHaveBeenCalledOnce();
        expect(logger.error).not.toHaveBeenCalled();
    });

    it.each([[400], [500], [503]])('logger %s som error', async (statusKode) => {
        fetchMock.mockResolvedValue(new Response('Feil', { status: statusKode }));

        const respons = await hentStilling(uuid);

        expect(respons).toEqual({ status: Status.Feil, statusKode });
        expect(logger.error).toHaveBeenCalledOnce();
    });
});
