import { http, HttpResponse } from 'msw';

const samtykkeUrl = 'http://mock-api/rest/cv/samtykker/:stillingsId';
const dag = 24 * 60 * 60 * 1000;
const iso = (forskyvning: number) => new Date(Date.now() + forskyvning).toISOString();

const lagSamtykke = (stillingsId: string, overstyr: Record<string, unknown> = {}) => ({
    aktørId: '2461507351955',
    stillingsId,
    deltStatus: 'SENDT',
    deltTidspunkt: iso(-7 * dag),
    deltAv: 'Z993102',
    deltAvIdentType: 'NAV_IDENT',
    svarfrist: iso(7 * dag),
    tilstand: 'OPPRETTET',
    svar: null,
    trukket: false,
    trukketTidspunkt: null,
    trukketAv: null,
    begrunnelseForAtAktivitetIkkeBleOpprettet: null,
    navKontor: '0403',
    ...overstyr,
});

const lagSvar = (harSvartJa: boolean) => ({
    deltStatus: harSvartJa ? 'SENDT' : 'IKKE_SENDT',
    tilstand: 'HAR_SVART',
    svar: {
        harSvartJa,
        svarTidspunkt: iso(-dag),
        svartAv: { ident: '2461507351955', identType: 'AKTOR_ID' },
    },
});

const scenarioer: Record<string, (stillingsId: string) => unknown[]> = {
    'samtykke-ingen': () => [],
    'samtykke-ubesvart': (id) => [lagSamtykke(id)],
    'samtykke-utlopt': (id) => [
        lagSamtykke(id, { svarfrist: iso(-dag), tilstand: 'SVARFRIST_UTLOPT' }),
    ],
    'samtykke-ja': (id) => [lagSamtykke(id, lagSvar(true))],
    'samtykke-nei': (id) => [lagSamtykke(id, lagSvar(false))],
    'samtykke-trukket': (id) => [
        lagSamtykke(id, { ...lagSvar(true), trukket: true, trukketTidspunkt: iso(-dag) }),
    ],
};

// Holder på svar fra PUT/DELETE til dev-serveren restartes
const lagredeSamtykker = new Map<string, unknown[]>();

export const samtykkeHandlers = [
    http.get(samtykkeUrl, ({ params }) => {
        const id = String(params.stillingsId);
        if (id === 'samtykke-feil') {
            return new HttpResponse(null, { status: 500 });
        }
        return HttpResponse.json(lagredeSamtykker.get(id) ?? scenarioer[id]?.(id) ?? []);
    }),
    http.put(`${samtykkeUrl}/:svar`, ({ params }) => {
        const id = String(params.stillingsId);
        if (id === 'samtykke-lagrefeil') {
            return new HttpResponse(null, { status: 500 });
        }
        lagredeSamtykker.set(id, [lagSamtykke(id, lagSvar(params.svar === 'JA'))]);
        return new HttpResponse(null, { status: 204 });
    }),
    http.delete(samtykkeUrl, ({ params }) => {
        const id = String(params.stillingsId);
        lagredeSamtykker.set(id, [
            lagSamtykke(id, { ...lagSvar(true), trukket: true, trukketTidspunkt: iso(0) }),
        ]);
        return new HttpResponse(null, { status: 204 });
    }),
];
