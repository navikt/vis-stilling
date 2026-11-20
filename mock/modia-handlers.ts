import { http, HttpResponse } from 'msw';

const modiaUrl = 'http://mock-api/api';

export const modiaHandlers = [
    http.get(`${modiaUrl}/decorator`, () =>
        HttpResponse.json({
            ident: 'Z993102',
            fornavn: 'Test',
            etternavn: 'Veileder',
            navn: 'Test Veileder',
            enheter: [
                { enhetId: '0403', navn: 'Nav Hamar' },
                { enhetId: '0301', navn: 'Nav Oslo' },
            ],
        })
    ),
    http.get(`${modiaUrl}/context/v2/aktivenhet`, () => HttpResponse.json({ aktivEnhet: '0403' })),
    http.get(`${modiaUrl}/context/v2/aktivbruker`, () =>
        HttpResponse.json({ aktivBruker: '01010012345' })
    ),
    http.post(`${modiaUrl}/context`, () => new HttpResponse(null, { status: 200 })),
    http.delete(`${modiaUrl}/context/aktivbruker`, () => new HttpResponse(null, { status: 200 })),
];
