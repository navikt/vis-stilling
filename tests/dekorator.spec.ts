import { expect, test, type Page } from '@playwright/test';
import { dekoratorMockScript } from '../mock/dekorator.ts';

const APP_URL = 'https://dekoratoren.ekstern.dev.nav.no';
const LOGIN_SESSION_API_URL = 'https://login.ekstern.dev.nav.no/oauth2/session';

type DekoratørData = {
    env: {
        APP_URL: string;
        LOGIN_SESSION_API_URL: string;
    };
};

type MockWindow = typeof window & {
    __DECORATOR_DATA__?: DekoratørData;
    __dekoratorMockKall: Array<[string, RequestInit | undefined]>;
    __dekoratorOriginalResponse?: Response;
};

const settOppDekoratørMock = async (page: Page, medMiljø = true) => {
    await page.route('https://vis-stilling.test/**', (route) =>
        route.fulfill({
            contentType: 'text/html',
            body: '<!doctype html><title>test</title>',
        })
    );
    await page.goto('https://vis-stilling.test/');
    await page.evaluate(
        ({ script, appUrl, loginSessionApiUrl, medMiljø }) => {
            const vindu = window as MockWindow;
            vindu.__dekoratorMockKall = [];
            window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
                const url =
                    typeof input === 'string'
                        ? input
                        : input instanceof URL
                          ? input.href
                          : input.url;
                vindu.__dekoratorMockKall.push([url, init]);
                const respons = new Response('original');
                vindu.__dekoratorOriginalResponse = respons;
                return Promise.resolve(respons);
            }) as typeof window.fetch;
            vindu.__DECORATOR_DATA__ = medMiljø
                ? {
                      env: {
                          APP_URL: appUrl,
                          LOGIN_SESSION_API_URL: loginSessionApiUrl,
                      },
                  }
                : undefined;
            (0, eval)(script);
        },
        {
            script: dekoratorMockScript,
            appUrl: APP_URL,
            loginSessionApiUrl: LOGIN_SESSION_API_URL,
            medMiljø,
        }
    );
};

test.describe('dekoratørmock', () => {
    const hovedmenyInput = [
        { type: 'streng', tittel: APP_URL + '/main-menu?context=privatperson&language=nb' },
        { type: 'URL', tittel: APP_URL + '/main-menu?context=privatperson&language=nb' },
        { type: 'Request', tittel: APP_URL + '/main-menu?context=privatperson&language=nb' },
    ] as const;

    for (const { type, tittel } of hovedmenyInput) {
        test(`returnerer HTML for hovedmenyen med input ${tittel} (${type})`, async ({ page }) => {
            await settOppDekoratørMock(page);
            const resultat = await page.evaluate(
                async ({ type, url }) => {
                    const input =
                        type === 'URL' ? new URL(url) : type === 'Request' ? new Request(url) : url;
                    const respons = await window.fetch(input);
                    return {
                        status: respons.status,
                        contentType: respons.headers.get('Content-Type'),
                        body: await respons.text(),
                        antallGjennomslipp: (window as MockWindow).__dekoratorMockKall.length,
                    };
                },
                { type, url: `${APP_URL}/main-menu?context=privatperson&language=nb` }
            );

            expect(resultat.status).toBe(200);
            expect(resultat.contentType).toBe('text/html');
            expect(resultat.body).toBe('<a href="https://www.nav.no/">Til nav.no</a>');
            expect(resultat.antallGjennomslipp).toBe(0);
        });
    }

    test('returnerer en tom liste med driftsmeldinger', async ({ page }) => {
        await settOppDekoratørMock(page);
        const resultat = await page.evaluate(async (url) => {
            const respons = await window.fetch(url);
            return {
                status: respons.status,
                contentType: respons.headers.get('Content-Type'),
                body: await respons.json(),
                antallGjennomslipp: (window as MockWindow).__dekoratorMockKall.length,
            };
        }, `${APP_URL}/ops-messages?language=nb`);

        expect(resultat.status).toBe(200);
        expect(resultat.contentType).toBe('application/json');
        expect(resultat.body).toEqual([]);
        expect(resultat.antallGjennomslipp).toBe(0);
    });

    test('beholder innloggings- og sesjonsmockene', async ({ page }) => {
        await settOppDekoratørMock(page);
        const resultat = await page.evaluate(
            async ({ appUrl, sessionUrl }) => {
                const auth = await window.fetch(`${appUrl}/auth`);
                const sesjon = await window.fetch(sessionUrl);
                return {
                    auth: await auth.json(),
                    sesjon: await sesjon.json(),
                    antallGjennomslipp: (window as MockWindow).__dekoratorMockKall.length,
                };
            },
            { appUrl: APP_URL, sessionUrl: LOGIN_SESSION_API_URL }
        );

        expect(resultat.auth.auth.authenticated).toBe(true);
        expect(resultat.sesjon.session.active).toBe(true);
        expect(resultat.antallGjennomslipp).toBe(0);
    });

    const gjennomslippUrl = [
        '/arbeid/stilling/api/deling-av-cv/samtykker/samtykke-ja',
        'https://example.com/main-menu',
        `${APP_URL}/main-menu/ukjent`,
        `${APP_URL}/ops-messages/ukjent`,
    ];

    for (const url of gjennomslippUrl) {
        test(`slipper andre kall gjennom: ${url}`, async ({ page }) => {
            await settOppDekoratørMock(page);
            const resultat = await page.evaluate(async (url) => {
                const init = { headers: { Accept: 'application/json' } };
                const respons = await window.fetch(url, init);
                const vindu = window as MockWindow;
                const kall = vindu.__dekoratorMockKall;
                return {
                    sammeRespons: respons === vindu.__dekoratorOriginalResponse,
                    antallKall: kall.length,
                    sammeUrl: kall[0]?.[0] === url,
                    sammeInit: kall[0]?.[1] === init,
                };
            }, url);

            expect(resultat).toEqual({
                sammeRespons: true,
                antallKall: 1,
                sammeUrl: true,
                sammeInit: true,
            });
        });
    }

    test('slipper kall gjennom når dekoratørmiljø mangler', async ({ page }) => {
        await settOppDekoratørMock(page, false);
        const resultat = await page.evaluate(async (url) => {
            const respons = await window.fetch(url);
            const vindu = window as MockWindow;
            const kall = vindu.__dekoratorMockKall;
            return {
                sammeRespons: respons === vindu.__dekoratorOriginalResponse,
                antallKall: kall.length,
                sammeUrl: kall[0]?.[0] === url,
                initErUndefined: kall[0]?.[1] === undefined,
            };
        }, `${APP_URL}/main-menu`);

        expect(resultat).toEqual({
            sammeRespons: true,
            antallKall: 1,
            sammeUrl: true,
            initErUndefined: true,
        });
    });
});
