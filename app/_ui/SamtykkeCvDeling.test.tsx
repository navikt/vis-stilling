// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SamtykkeCvDeling from './SamtykkeCvDeling.tsx';

const STILLINGS_ID = 'stilling-syntetisk-1';
const ENDEPUNKT = `/arbeid/stilling/api/deling-av-cv/samtykker/${STILLINGS_ID}`;

type Samtykkefixture = {
    stillingsId: string;
    deltTidspunkt: string;
    svarfrist: string;
    tilstand: string | null;
    svar: {
        harSvartJa: boolean;
        svarTidspunkt: string;
        svartAv: { ident: string; identType: string };
    } | null;
    trukket: boolean;
    trukketTidspunkt: string | null;
};

const lagSamtykke = (overrides: Partial<Samtykkefixture> = {}): Samtykkefixture => ({
    stillingsId: STILLINGS_ID,
    deltTidspunkt: '2024-01-01T10:00:00.000Z',
    svarfrist: '2024-01-08T10:00:00.000Z',
    tilstand: 'HAR_SVART',
    svar: null,
    trukket: false,
    trukketTidspunkt: null,
    ...overrides,
});

const jsonRespons = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
        status,
        headers: { 'content-type': 'application/json' },
    });

const tomRespons = (status = 204) => new Response(null, { status });

// Flush både mikrotask- og makrotask-kø slik at fetch -> json -> zod -> setState rekker å kjøre.
const flush = () => act(async () => await new Promise((resolve) => setTimeout(resolve, 0)));

let container: HTMLDivElement;
let root: Root;
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

const render = (innlogget = true) => {
    act(() => {
        root.render(
            <SWRConfig value={{ provider: () => new Map(), shouldRetryOnError: false }}>
                <SamtykkeCvDeling stillingsId={STILLINGS_ID} innlogget={innlogget} />
            </SWRConfig>
        );
    });
};

const knapp = (tekst: string): HTMLButtonElement | undefined =>
    Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes(tekst));

const klikk = async (b: HTMLButtonElement) => {
    await act(async () => {
        b.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
};

const tekstInneholder = (tekst: string) => container.textContent?.includes(tekst) ?? false;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
});

afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('SamtykkeCvDeling', () => {
    it('viser innloggingsveiledning uten å hente samtykke for utloggede', async () => {
        render(false);
        await flush();

        expect(fetchMock).not.toHaveBeenCalled();
        expect(
            container.querySelector('section[aria-label="Samtykke til deling av CV"]')
        ).not.toBeNull();
        expect(tekstInneholder('Har du mottatt en forespørsel om å dele CV-en din')).toBe(true);
        expect(tekstInneholder('Logg inn for å svare.')).toBe(true);
        expect(tekstInneholder('Henter samtykkestatus')).toBe(false);
        expect(knapp('Ja, jeg samtykker')).toBeUndefined();
        expect(knapp('Nei, jeg samtykker ikke')).toBeUndefined();
        expect(knapp('Trekk samtykke')).toBeUndefined();
        expect(knapp('Prøv igjen')).toBeUndefined();
    });

    it('henter samtykke først når brukeren er innlogget', async () => {
        fetchMock.mockResolvedValueOnce(jsonRespons([lagSamtykke()]));
        render(false);
        await flush();
        expect(fetchMock).not.toHaveBeenCalled();

        render(true);
        await flush();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
            ENDEPUNKT,
            expect.objectContaining({ method: 'GET' })
        );
        expect(knapp('Ja, jeg samtykker')).toBeDefined();
        expect(tekstInneholder('Logg inn for å svare.')).toBe(false);
    });

    it('skjuler bufret samtykke og handlinger når brukeren blir utlogget', async () => {
        fetchMock.mockResolvedValueOnce(
            jsonRespons([
                lagSamtykke({
                    svar: {
                        harSvartJa: true,
                        svarTidspunkt: '2024-01-02T10:00:00.000Z',
                        svartAv: { ident: 'syntetisk-aktor', identType: 'AKTOR_ID' },
                    },
                }),
            ])
        );
        render();
        await flush();
        expect(tekstInneholder('Du har sagt ja')).toBe(true);

        render(false);
        await flush();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(tekstInneholder('Du har sagt ja')).toBe(false);
        expect(tekstInneholder('Logg inn for å svare.')).toBe(true);
        expect(knapp('Trekk samtykke')).toBeUndefined();
        expect(knapp('Ja, jeg samtykker')).toBeUndefined();
        expect(knapp('Nei, jeg samtykker ikke')).toBeUndefined();
        expect(knapp('Prøv igjen')).toBeUndefined();
    });

    it('viser ikke svarknapper når den nyeste forespørselen er trukket', async () => {
        fetchMock.mockResolvedValueOnce(jsonRespons([lagSamtykke({ trukket: true })]));
        render();
        await flush();

        expect(tekstInneholder('Du har trukket samtykket')).toBe(true);
        expect(knapp('Ja, jeg samtykker')).toBeUndefined();
        expect(knapp('Nei, jeg samtykker ikke')).toBeUndefined();
        expect(knapp('Trekk samtykke')).toBeUndefined();
    });

    it('lar brukeren svare på en nyere forespørsel selv om en eldre er trukket', async () => {
        const eldre = lagSamtykke({ trukket: true });
        const nyere = lagSamtykke({
            deltTidspunkt: '2024-03-01T10:00:00.000Z',
            svarfrist: '2100-03-08T10:00:00.000Z',
            tilstand: 'HAR_VARSLET',
        });
        fetchMock
            .mockResolvedValueOnce(jsonRespons([nyere, eldre]))
            .mockResolvedValueOnce(tomRespons())
            .mockResolvedValueOnce(jsonRespons([nyere, eldre]));
        render();
        await flush();

        expect(tekstInneholder('Du har fått en forespørsel')).toBe(true);
        expect(tekstInneholder('Du har trukket samtykket')).toBe(false);
        expect(knapp('Ja, jeg samtykker')?.disabled).toBe(false);
        expect(knapp('Nei, jeg samtykker ikke')?.disabled).toBe(false);

        await klikk(knapp('Ja, jeg samtykker')!);
        await flush();

        expect(fetchMock).toHaveBeenCalledWith(
            `${ENDEPUNKT}/JA`,
            expect.objectContaining({ method: 'PUT' })
        );
    });

    it('viser ingen mutasjonsknapper under initial henting', async () => {
        let løsGet!: (r: Response) => void;
        fetchMock.mockImplementation(() => new Promise<Response>((resolve) => (løsGet = resolve)));
        render();

        expect(tekstInneholder('Henter samtykkestatus')).toBe(true);
        expect(knapp('Trekk samtykke')).toBeUndefined();
        expect(knapp('Ja, jeg samtykker')).toBeUndefined();

        løsGet(jsonRespons([lagSamtykke()]));
        await flush();

        expect(knapp('Nei, jeg samtykker ikke')).toBeDefined();
    });

    it('sender JA med PUT uten body og viser oppdatert status etter revalidering', async () => {
        fetchMock.mockImplementation((_url, init) => {
            if (init?.method === 'PUT') {
                return Promise.resolve(tomRespons());
            }
            // GET: første kall er ubesvart, revalidering etter PUT viser JA
            const kall = fetchMock.mock.calls.filter((c) => c[1]?.method === 'GET').length;
            const svar =
                kall <= 1
                    ? null
                    : {
                          harSvartJa: true,
                          svarTidspunkt: '2024-01-02T10:00:00.000Z',
                          svartAv: { ident: 'Z000000', identType: 'NAV_IDENT' },
                      };
            return Promise.resolve(jsonRespons([lagSamtykke({ svar })]));
        });
        render();
        await flush();

        const jaKnapp = knapp('Ja, jeg samtykker');
        expect(jaKnapp).toBeDefined();
        await klikk(jaKnapp!);
        await flush();

        const putKall = fetchMock.mock.calls.find((c) => c[1]?.method === 'PUT');
        expect(putKall?.[0]).toBe(`${ENDEPUNKT}/JA`);
        expect(putKall?.[1]).not.toHaveProperty('body');

        expect(tekstInneholder('Du har sagt ja')).toBe(true);
        expect(knapp('Trekk samtykke')).toBeDefined();
    });

    it('sender NEI med PUT uten body og viser oppdatert status', async () => {
        fetchMock
            .mockResolvedValueOnce(jsonRespons([lagSamtykke()]))
            .mockResolvedValueOnce(tomRespons())
            .mockResolvedValueOnce(
                jsonRespons([
                    lagSamtykke({
                        svar: {
                            harSvartJa: false,
                            svarTidspunkt: '2024-01-02T10:00:00.000Z',
                            svartAv: { ident: 'syntetisk-aktor', identType: 'AKTOR_ID' },
                        },
                    }),
                ])
            );
        render();
        await flush();

        const neiKnapp = knapp('Nei, jeg samtykker ikke');
        await klikk(neiKnapp!);
        await flush();

        const putKall = fetchMock.mock.calls.find((c) => c[1]?.method === 'PUT');
        expect(putKall?.[0]).toBe(`${ENDEPUNKT}/NEI`);
        expect(putKall?.[1]).not.toHaveProperty('body');
        expect(tekstInneholder('Du har sagt nei')).toBe(true);
        expect(knapp('Trekk samtykke')).toBeUndefined();
    });

    it('trekker samtykke kun med DELETE, og trukket JA blir ikke vist som aktivt', async () => {
        fetchMock.mockImplementation((_url, init) => {
            if (init?.method === 'DELETE') return Promise.resolve(tomRespons());
            const kall = fetchMock.mock.calls.filter((c) => c[1]?.method === 'GET').length;
            const svar = {
                harSvartJa: true,
                svarTidspunkt: '2024-01-02T10:00:00.000Z',
                svartAv: { ident: 'Z000000', identType: 'NAV_IDENT' },
            };
            return Promise.resolve(jsonRespons([lagSamtykke({ svar, trukket: kall > 1 })]));
        });
        render();
        await flush();

        expect(tekstInneholder('Du har sagt ja')).toBe(true);
        const trekkKnapp = knapp('Trekk samtykke');
        expect(trekkKnapp).toBeDefined();
        await klikk(trekkKnapp!);
        await flush();

        const deleteKall = fetchMock.mock.calls.filter((c) => c[1]?.method === 'DELETE');
        expect(deleteKall.length).toBe(1);
        expect(deleteKall[0][0]).toBe(ENDEPUNKT);
        expect(deleteKall[0][1]).not.toHaveProperty('body');
        expect(fetchMock.mock.calls.some((c) => c[1]?.method === 'PUT')).toBe(false);

        expect(tekstInneholder('Du har trukket samtykket')).toBe(true);
        // trukket:true skal overstyre harSvartJa:true - ikke vis "Trekk"-knapp som aktivt samtykke
        expect(knapp('Trekk samtykke')).toBeUndefined();
        expect(knapp('Ja, jeg samtykker')).toBeUndefined();
        expect(knapp('Nei, jeg samtykker ikke')).toBeUndefined();
    });

    it('sperrer begge knappene under forsinket mutasjon og revalidering', async () => {
        let løsPut!: (r: Response) => void;
        let løsGet!: (r: Response) => void;
        let getKall = 0;
        fetchMock.mockImplementation((_url, init) => {
            if (init?.method === 'PUT') {
                return new Promise<Response>((resolve) => (løsPut = resolve));
            }
            getKall += 1;
            return getKall === 1
                ? Promise.resolve(jsonRespons([lagSamtykke()]))
                : new Promise<Response>((resolve) => (løsGet = resolve));
        });
        render();
        await flush();

        const jaKnapp = knapp('Ja, jeg samtykker')!;
        const neiKnapp = knapp('Nei, jeg samtykker ikke')!;
        await klikk(jaKnapp);
        await flush();

        expect(tekstInneholder('Lagrer endringen')).toBe(true);
        expect(knapp('Ja, jeg samtykker')?.disabled).toBe(true);
        expect(knapp('Nei, jeg samtykker ikke')?.disabled).toBe(true);
        await klikk(neiKnapp);
        expect(fetchMock.mock.calls.filter((c) => c[1]?.method === 'PUT')).toHaveLength(1);

        løsPut(tomRespons());
        await flush();

        expect(knapp('Ja, jeg samtykker')?.disabled).toBe(true);
        expect(knapp('Nei, jeg samtykker ikke')?.disabled).toBe(true);

        løsGet(jsonRespons([lagSamtykke()]));
        await flush();
        expect(knapp('Ja, jeg samtykker')?.disabled).toBe(false);
        expect(knapp('Nei, jeg samtykker ikke')?.disabled).toBe(false);
    });

    it('viser mutasjonsfeil ved HTTP-feil og tillater nytt forsøk', async () => {
        let putForsøk = 0;
        fetchMock.mockImplementation((_url, init) => {
            if (init?.method === 'PUT') {
                putForsøk += 1;
                if (putForsøk === 1) {
                    return Promise.resolve(
                        new Response('feil', { status: 500, statusText: 'Server error' })
                    );
                }
                return Promise.resolve(tomRespons());
            }
            return Promise.resolve(jsonRespons([lagSamtykke()]));
        });
        render();
        await flush();

        await klikk(knapp('Ja, jeg samtykker')!);
        await flush();

        expect(tekstInneholder('Vi kunne ikke lagre endringen. Prøv igjen.')).toBe(true);

        await klikk(knapp('Ja, jeg samtykker')!);
        await flush();

        expect(putForsøk).toBe(2);
        expect(tekstInneholder('Vi kunne ikke lagre endringen. Prøv igjen.')).toBe(false);
    });

    it('viser mutasjonsfeil ved nettverksfeil og tillater nytt forsøk', async () => {
        let putForsøk = 0;
        fetchMock.mockImplementation((_url, init) => {
            if (init?.method === 'PUT') {
                putForsøk += 1;
                return putForsøk === 1
                    ? Promise.reject(new TypeError('Failed to fetch'))
                    : Promise.resolve(tomRespons());
            }
            return Promise.resolve(jsonRespons([lagSamtykke()]));
        });
        render();
        await flush();

        await klikk(knapp('Ja, jeg samtykker')!);
        await flush();

        expect(tekstInneholder('Vi kunne ikke lagre endringen. Prøv igjen.')).toBe(true);

        await klikk(knapp('Ja, jeg samtykker')!);
        await flush();
        expect(putForsøk).toBe(2);
        expect(tekstInneholder('Vi kunne ikke lagre endringen. Prøv igjen.')).toBe(false);
    });

    it('viser GET-feil separat med Prøv igjen-knapp, uten å påstå vellykket samtykke', async () => {
        fetchMock.mockImplementation(() =>
            Promise.resolve(new Response('feil', { status: 503, statusText: 'Unavailable' }))
        );
        render();
        await flush();

        expect(tekstInneholder('Vi kunne ikke hente samtykkestatusen din. Prøv igjen.')).toBe(true);
        expect(tekstInneholder('Du har sagt ja')).toBe(false);
        expect(knapp('Ja, jeg samtykker')).toBeUndefined();
        expect(knapp('Trekk samtykke')).toBeUndefined();

        const prøvIgjen = knapp('Prøv igjen');
        expect(prøvIgjen).toBeDefined();

        fetchMock.mockImplementation(() => Promise.resolve(jsonRespons([lagSamtykke()])));
        await klikk(prøvIgjen!);
        await flush();

        expect(tekstInneholder('Vi kunne ikke hente samtykkestatusen din')).toBe(false);
        expect(knapp('Nei, jeg samtykker ikke')).toBeDefined();
    });

    it('mislykket revalidering etter mutasjon påstår ikke suksess og tillater nytt forsøk', async () => {
        let getKall = 0;
        fetchMock.mockImplementation((_url, init) => {
            if (init?.method === 'PUT') return Promise.resolve(tomRespons());
            getKall += 1;
            if (getKall === 1) return Promise.resolve(jsonRespons([lagSamtykke()]));
            return Promise.resolve(
                new Response('feil', { status: 500, statusText: 'Server error' })
            );
        });
        render();
        await flush();

        await klikk(knapp('Ja, jeg samtykker')!);
        await flush();

        // Revalideringen feilet - vi skal ikke late som JA ble bekreftet
        expect(tekstInneholder('Du har sagt ja')).toBe(false);
        expect(tekstInneholder('Vi kunne ikke hente samtykkestatusen din. Prøv igjen.')).toBe(true);
        expect(knapp('Prøv igjen')).toBeDefined();

        fetchMock.mockResolvedValueOnce(jsonRespons([lagSamtykke()]));
        await klikk(knapp('Prøv igjen')!);
        await flush();

        expect(tekstInneholder('Vi kunne ikke hente samtykkestatusen din')).toBe(false);
        expect(fetchMock.mock.calls.filter((c) => c[1]?.method === 'PUT')).toHaveLength(1);
    });

    it('viser feil og ingen svar-knapper ved ugyldig dato fra backend', async () => {
        fetchMock.mockResolvedValueOnce(
            jsonRespons([lagSamtykke({ deltTidspunkt: 'ugyldig-dato' })])
        );
        render();
        await flush();

        expect(tekstInneholder('Vi kunne ikke hente samtykkestatusen din')).toBe(true);
        expect(knapp('Ja, jeg samtykker')).toBeUndefined();
        expect(knapp('Nei, jeg samtykker ikke')).toBeUndefined();
    });

    it('parser datoer fra JSON og velger nyeste samtykke i usortert liste', async () => {
        const eldre = lagSamtykke({
            deltTidspunkt: '2024-01-01T10:00:00.000Z',
            svarfrist: '2024-01-08T10:00:00.000Z',
            trukket: true,
            trukketTidspunkt: '2024-01-03T10:00:00.000Z',
        });
        const nyeste = lagSamtykke({
            deltTidspunkt: '2024-03-01T10:00:00.000Z',
            svarfrist: '2024-03-08T10:00:00.000Z',
            svar: {
                harSvartJa: true,
                svarTidspunkt: '2024-03-02T10:00:00.000Z',
                svartAv: { ident: 'Z111111', identType: 'NAV_IDENT' },
            },
        });
        const mellomste = lagSamtykke({
            deltTidspunkt: '2024-02-01T10:00:00.000Z',
            svarfrist: '2024-02-08T10:00:00.000Z',
            svar: {
                harSvartJa: false,
                svarTidspunkt: '2024-02-02T10:00:00.000Z',
                svartAv: { ident: 'Z222222', identType: 'NAV_IDENT' },
            },
        });
        // Usortert rekkefølge - eldst, nyest, mellomste
        fetchMock.mockImplementation(() =>
            Promise.resolve(jsonRespons([eldre, nyeste, mellomste]))
        );
        render();
        await flush();

        expect(tekstInneholder('Vi kunne ikke hente samtykkestatusen din')).toBe(false);
        expect(tekstInneholder('Du har sagt ja')).toBe(true);
        expect(knapp('Trekk samtykke')).toBeDefined();
    });
});
