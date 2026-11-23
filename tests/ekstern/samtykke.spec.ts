import { expect, test, type Locator, type Page, type Route } from '@playwright/test';

const lenketekst = 'Her kan du lese mer om å dele CV-en med arbeidsgiver';
const personvernUrl =
    'https://www.ansatt.dev.nav.no/min-cv/personvern#deling-av-cv-med-arbeidsgivere';
const apiSti = (stillingsId: string) =>
    `/arbeid/stilling/api/deling-av-cv/samtykker/${encodeURIComponent(stillingsId)}`;

type Samtykkesvar = {
    harSvartJa: boolean;
    svarTidspunkt: string;
    svartAv: { ident: string; identType: string };
};

type SamtykkeFixture = {
    stillingsId: string;
    deltTidspunkt: string;
    svarfrist: string;
    tilstand: string | null;
    svar: Samtykkesvar | null;
    trukket: boolean;
    trukketTidspunkt: string | null;
};

type RegistrertForespørsel = {
    method: string;
    url: string;
    postData: string | null;
};

const lagSamtykke = (overrides: Partial<SamtykkeFixture> = {}): SamtykkeFixture => ({
    stillingsId: 'syntetisk-stilling',
    deltTidspunkt: '2024-01-01T10:00:00.000Z',
    svarfrist: '2100-01-08T10:00:00.000Z',
    tilstand: 'OPPRETTET',
    svar: null,
    trukket: false,
    trukketTidspunkt: null,
    ...overrides,
});

const lagSvar = (harSvartJa: boolean): Samtykkesvar => ({
    harSvartJa,
    svarTidspunkt: '2024-01-02T10:00:00.000Z',
    svartAv: { ident: 'syntetisk-aktor', identType: 'AKTOR_ID' },
});

const svarJson = async (route: Route, data: unknown, status = 200) =>
    route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(data),
    });

const mockSamtykkeApi = async (
    page: Page,
    handler: (route: Route, requests: RegistrertForespørsel[]) => Promise<void>
) => {
    const requests: RegistrertForespørsel[] = [];
    await page.route('**/api/deling-av-cv/samtykker/**', async (route) => {
        const request = route.request();
        requests.push({
            method: request.method(),
            url: request.url(),
            postData: request.postData(),
        });
        await handler(route, requests);
    });
    return requests;
};

const gåTilStilling = async (page: Page, stillingsId: string) => page.goto(stillingsId);

const kallMedMetode = (requests: RegistrertForespørsel[], method: string) =>
    requests.filter((request) => request.method === method);

// Dialog.Trigger veksler åpen/lukket, og knappen er deaktivert under revalidering. Et klikk kan
// derfor gå tapt eller lukke dialogen igjen når nettleseren er presset, så vi prøver til den er åpen.
const åpneDialog = async (page: Page, knappetekst: string) => {
    const dialog = page.getByRole('alertdialog');
    const utløser = page.getByRole('button', { name: knappetekst, exact: true });
    await expect(async () => {
        if (!(await dialog.isVisible())) {
            await utløser.click({ timeout: 2_000 });
        }
        await expect(dialog.getByRole('button', { name: 'Avbryt', exact: true })).toBeFocused({
            timeout: 2_000,
        });
    }).toPass();
    return dialog;
};

const bekreftHandling = async (page: Page, knappetekst: string, bekreftelse: string) => {
    const dialog = await åpneDialog(page, knappetekst);
    await dialog.getByRole('button', { name: bekreftelse }).click();
};

// SWR prøver automatisk på nytt etter feil, og «Prøv igjen» er deaktivert mens det pågår.
const prøvIgjen = async (region: Locator) => {
    const knapp = region.getByRole('button', { name: 'Prøv igjen' });
    await expect(async () => {
        if (await knapp.isVisible()) {
            await knapp.click({ timeout: 2_000 });
        }
        await expect(region.getByRole('alert')).toHaveCount(0, { timeout: 2_000 });
    }).toPass();
};

test.describe('Personvernlenke', () => {
    test('viser personvernlenken ved aktiv forespørsel', async ({ page }) => {
        const id = 'samtykke-aktiv-lenke';
        const requests = await mockSamtykkeApi(page, (route) => svarJson(route, [lagSamtykke()]));
        await gåTilStilling(page, id);

        const lenke = page.getByRole('link', { name: lenketekst });
        await expect(lenke).toHaveAttribute('href', personvernUrl);
        expect(requests[0].method).toBe('GET');
        expect(requests[0].url).toBe(new URL(apiSti(id), page.url()).href);
    });

    const avsluttedeForespørsler = [
        {
            tilstand: 'utløpt',
            samtykke: lagSamtykke({ svarfrist: '2000-01-08T10:00:00.000Z' }),
            statustekst: /Svarfristen for forespørselen har gått ut/,
        },
        {
            tilstand: 'besvart',
            samtykke: lagSamtykke({ svar: lagSvar(true) }),
            statustekst: /Du har sagt ja til/,
        },
        {
            tilstand: 'trukket',
            samtykke: lagSamtykke({ trukket: true }),
            statustekst: /Du har trukket samtykket/,
        },
    ];

    for (const { tilstand, samtykke, statustekst } of avsluttedeForespørsler) {
        test(`viser personvernlenken ved ${tilstand} forespørsel`, async ({ page }) => {
            await mockSamtykkeApi(page, (route) => svarJson(route, [samtykke]));
            await gåTilStilling(page, `samtykke-${tilstand}-lenke`);

            await expect(page.getByText(statustekst)).toBeVisible();
            await expect(page.getByRole('link', { name: lenketekst })).toHaveAttribute(
                'href',
                personvernUrl
            );
        });
    }

    test('viser ikke personvernlenken uten forespørsel', async ({ page }) => {
        await mockSamtykkeApi(page, (route) => svarJson(route, []));
        await gåTilStilling(page, 'samtykke-ingen-lenke');

        await expect(
            page.getByText('Kontakt veilederen din i dialogen i aktivitetsplanen.')
        ).toBeVisible();
        await expect(page.getByRole('link', { name: lenketekst })).toHaveCount(0);
    });

    test('viser ikke personvernlenken ved hentefeil og tilbyr nytt forsøk', async ({ page }) => {
        let hentingVirker = false;
        await mockSamtykkeApi(page, (route) =>
            hentingVirker
                ? svarJson(route, [lagSamtykke()])
                : route.fulfill({ status: 503, body: 'utilgjengelig' })
        );
        await gåTilStilling(page, 'samtykke-lenke-hentefeil');

        const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
        await expect(region.getByRole('button', { name: 'Prøv igjen' })).toBeVisible();
        await expect(page.getByRole('link', { name: lenketekst })).toHaveCount(0);

        hentingVirker = true;
        await prøvIgjen(region);
        await expect(page.getByRole('link', { name: lenketekst })).toHaveAttribute(
            'href',
            personvernUrl
        );
    });
});

test.describe('Stilling som ikke er direktemeldt', () => {
    const ikkeDirektemeldt = 'arbeidsplassenStilling';

    test('viser ikke boksen om å kontakte veileder uten forespørsel', async ({ page }) => {
        await mockSamtykkeApi(page, (route) => svarJson(route, []));
        const samtykkesvar = page.waitForResponse('**/api/deling-av-cv/samtykker/**');
        await gåTilStilling(page, ikkeDirektemeldt);

        await expect(
            page.getByRole('heading', { level: 1, name: 'Tulleskolen søker tøysekopper' })
        ).toBeVisible();
        // Boksen er også skjult mens statusen lastes. Vent til svaret er tegnet opp.
        await (await samtykkesvar).finished();
        await page.evaluate(
            () =>
                new Promise((resolve) =>
                    requestAnimationFrame(() => requestAnimationFrame(resolve))
                )
        );
        await expect(
            page.getByRole('heading', { name: 'Har du spørsmål om stillingen?' })
        ).toHaveCount(0);
        await expect(
            page.getByText('Kontakt veilederen din i dialogen i aktivitetsplanen.')
        ).toHaveCount(0);
        await expect(page.getByRole('region', { name: 'Samtykke til deling av CV' })).toHaveCount(
            0
        );
    });

    test('viser samtykkeboksen ved forespørsel', async ({ page }) => {
        await mockSamtykkeApi(page, (route) => svarJson(route, [lagSamtykke()]));
        await gåTilStilling(page, ikkeDirektemeldt);

        const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
        await expect(
            region.getByRole('heading', { name: 'Vil du dele CV-en din med arbeidsgiveren?' })
        ).toBeVisible();
        await expect(region.getByRole('button', { name: 'Gi samtykke' })).toBeVisible();
        await expect(region.getByRole('link', { name: lenketekst })).toBeVisible();
    });
});

test.describe('Avbrutt forespørsel', () => {
    const avbruttTekst = 'Du kan ikke svare på spørsmålet fordi aktiviteten er avbrutt.';

    const forventAvbruttVisning = async (region: Locator) => {
        await expect(
            region.getByRole('heading', { name: 'Vil du dele CV-en din med arbeidsgiveren?' })
        ).toBeVisible();
        await expect(region.getByText(avbruttTekst)).toBeVisible();
        await expect(region.getByRole('button')).toHaveCount(0);
        await expect(region.getByRole('link', { name: lenketekst })).toHaveCount(0);
    };

    test('viser at aktiviteten er avbrutt uten svarmuligheter eller personvernlenke', async ({
        page,
    }) => {
        const requests = await mockSamtykkeApi(page, (route) =>
            svarJson(route, [lagSamtykke({ tilstand: 'AVBRUTT' })])
        );
        await gåTilStilling(page, 'samtykke-avbrutt');

        const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
        await forventAvbruttVisning(region);
        await expect(
            region.getByText('Kontakt veilederen din i dialogen i aktivitetsplanen.')
        ).toHaveCount(0);
        expect(requests.every((request) => request.method === 'GET')).toBe(true);
    });

    const svarMedAvbruttForespørsel = [
        {
            beskrivelse: 'ja-svar',
            samtykke: lagSamtykke({ tilstand: 'AVBRUTT', svar: lagSvar(true) }),
            statustekst: /Du har sagt ja til/,
            knapp: 'Trekk samtykke',
        },
        {
            beskrivelse: 'nei-svar',
            samtykke: lagSamtykke({ tilstand: 'AVBRUTT', svar: lagSvar(false) }),
            statustekst: /Du har sagt nei til/,
        },
        {
            beskrivelse: 'trukket samtykke',
            samtykke: lagSamtykke({
                tilstand: 'AVBRUTT',
                svar: lagSvar(true),
                trukket: true,
                trukketTidspunkt: '2024-01-03T10:00:00.000Z',
            }),
            statustekst: /Du har trukket samtykket/,
        },
    ];

    for (const { beskrivelse, samtykke, statustekst, knapp } of svarMedAvbruttForespørsel) {
        test(`${beskrivelse} har forrang over avbrutt forespørsel`, async ({ page }) => {
            await mockSamtykkeApi(page, (route) => svarJson(route, [samtykke]));
            await gåTilStilling(page, 'samtykke-svar-foran-avbrutt');

            const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
            await expect(region.getByText(statustekst)).toBeVisible();
            await expect(region.getByText(avbruttTekst)).toHaveCount(0);
            await expect(region.getByRole('link', { name: lenketekst })).toHaveAttribute(
                'href',
                personvernUrl
            );
            if (knapp) {
                await expect(region.getByRole('button', { name: knapp })).toBeVisible();
            } else {
                await expect(region.getByRole('button')).toHaveCount(0);
            }
        });
    }

    test('avbrutt forespørsel har forrang over utløpt svarfrist', async ({ page }) => {
        await mockSamtykkeApi(page, (route) =>
            svarJson(route, [
                lagSamtykke({ tilstand: 'AVBRUTT', svarfrist: '2000-01-08T10:00:00.000Z' }),
            ])
        );
        await gåTilStilling(page, 'samtykke-avbrutt-utlopt');

        const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
        await forventAvbruttVisning(region);
        await expect(region.getByText(/Svarfristen for forespørselen har gått ut/)).toHaveCount(0);
    });

    test('kan trekke samtykke selv om aktiviteten er avbrutt', async ({ page }) => {
        const id = 'samtykke-avbrutt-trekk';
        let sisteSamtykke = lagSamtykke({ tilstand: 'AVBRUTT', svar: lagSvar(true) });
        const requests = await mockSamtykkeApi(page, async (route) => {
            if (route.request().method() === 'DELETE') {
                sisteSamtykke = {
                    ...sisteSamtykke,
                    trukket: true,
                    trukketTidspunkt: '2024-01-03T10:00:00.000Z',
                };
                await route.fulfill({ status: 204 });
                return;
            }
            await svarJson(route, [sisteSamtykke]);
        });
        await gåTilStilling(page, id);
        await bekreftHandling(page, 'Trekk samtykke', 'Bekreft tilbaketrekking');

        await expect.poll(() => kallMedMetode(requests, 'DELETE').length).toBe(1);
        const slett = requests.find((request) => request.method === 'DELETE')!;
        expect(new URL(slett.url).pathname).toBe(apiSti(id));
        const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
        await expect(region.getByText(/Du har trukket samtykket/)).toBeVisible();
        await expect(region.getByText(avbruttTekst)).toHaveCount(0);
        await expect(region.getByRole('button')).toHaveCount(0);
    });

    test('viser avbrutt når den nyeste forespørselen er avbrutt', async ({ page }) => {
        const eldreUbesvart = lagSamtykke({ deltTidspunkt: '2024-01-01T10:00:00.000Z' });
        const nyesteAvbrutt = lagSamtykke({
            deltTidspunkt: '2024-02-01T10:00:00.000Z',
            tilstand: 'AVBRUTT',
        });
        await mockSamtykkeApi(page, (route) => svarJson(route, [eldreUbesvart, nyesteAvbrutt]));
        await gåTilStilling(page, 'samtykke-nyeste-avbrutt');

        const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
        await forventAvbruttVisning(region);
    });

    test('viser svarmuligheter når bare en eldre forespørsel er avbrutt', async ({ page }) => {
        const eldreAvbrutt = lagSamtykke({
            deltTidspunkt: '2024-01-01T10:00:00.000Z',
            tilstand: 'AVBRUTT',
        });
        const nyesteUbesvart = lagSamtykke({ deltTidspunkt: '2024-02-01T10:00:00.000Z' });
        await mockSamtykkeApi(page, (route) => svarJson(route, [eldreAvbrutt, nyesteUbesvart]));
        await gåTilStilling(page, 'samtykke-eldre-avbrutt');

        const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
        await expect(region.getByRole('button', { name: 'Gi samtykke' })).toBeVisible();
        await expect(region.getByText(avbruttTekst)).toHaveCount(0);
    });
});

test.describe('Samtykkedialoger', () => {
    const dialogscenarioer = [
        {
            knapp: 'Gi samtykke',
            tittel: 'Vil du gi samtykke?',
            beskrivelse:
                'Du gir Nav samtykke til å dele CV-en din med arbeidsgiveren for denne stillingen.',
            bekreftelse: 'Bekreft samtykke',
            svar: null,
        },
        {
            knapp: 'Avvis samtykke',
            tittel: 'Vil du svare nei?',
            beskrivelse:
                'Du svarer nei til at Nav kan dele CV-en din med arbeidsgiveren for denne stillingen.',
            bekreftelse: 'Bekreft nei',
            svar: null,
        },
        {
            knapp: 'Trekk samtykke',
            tittel: 'Vil du trekke samtykket?',
            beskrivelse:
                'Du trekker samtykket til at Nav kan dele CV-en din med arbeidsgiveren for denne stillingen.',
            bekreftelse: 'Bekreft tilbaketrekking',
            svar: lagSvar(true),
        },
    ];

    for (const scenario of dialogscenarioer) {
        test(`åpner «${scenario.knapp}» og lar brukeren avbryte uten API-kall`, async ({
            page,
        }) => {
            const requests = await mockSamtykkeApi(page, (route) =>
                svarJson(route, [lagSamtykke({ svar: scenario.svar })])
            );
            await gåTilStilling(page, `samtykke-dialog-${scenario.knapp.replace(/ /g, '-')}`);

            const utløser = page.getByRole('button', { name: scenario.knapp, exact: true });
            const dialog = await åpneDialog(page, scenario.knapp);
            await expect(dialog.getByRole('heading', { name: scenario.tittel })).toBeVisible();
            await expect(dialog).toContainText(scenario.beskrivelse);

            await dialog.getByRole('button', { name: 'Avbryt', exact: true }).click();

            await expect(dialog).toBeHidden();
            await expect(utløser).toBeFocused();
            expect(kallMedMetode(requests, 'PUT')).toHaveLength(0);
            expect(kallMedMetode(requests, 'DELETE')).toHaveLength(0);
        });
    }

    test('lukker dialogen med Escape uten å sende samtykkesvar', async ({ page }) => {
        const requests = await mockSamtykkeApi(page, (route) => svarJson(route, [lagSamtykke()]));
        await gåTilStilling(page, 'samtykke-dialog-escape');
        const dialog = await åpneDialog(page, 'Gi samtykke');

        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
        expect(kallMedMetode(requests, 'PUT')).toHaveLength(0);
    });

    test('lukker dialogen med Lukk-knappen uten å sende samtykkesvar', async ({ page }) => {
        const requests = await mockSamtykkeApi(page, (route) => svarJson(route, [lagSamtykke()]));
        await gåTilStilling(page, 'samtykke-dialog-lukk');
        const dialog = await åpneDialog(page, 'Gi samtykke');

        await dialog.getByRole('button', { name: 'Lukk' }).click();
        await expect(dialog).toBeHidden();
        expect(kallMedMetode(requests, 'PUT')).toHaveLength(0);
    });
});

test.describe('Samtykkestatus og endringer', () => {
    test('viser trukket tekst uten svarknapper når nyeste forespørsel er trukket', async ({
        page,
    }) => {
        await mockSamtykkeApi(page, (route) => svarJson(route, [lagSamtykke({ trukket: true })]));
        await gåTilStilling(page, 'samtykke-nyeste-trukket');

        const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
        await expect(
            region.getByText(/Du har trukket samtykket til at Nav kan dele CV-en din/)
        ).toBeVisible();
        await expect(region.getByRole('button', { name: 'Gi samtykke' })).toHaveCount(0);
        await expect(region.getByRole('button', { name: 'Avvis samtykke' })).toHaveCount(0);
        await expect(region.getByRole('button', { name: 'Trekk samtykke' })).toHaveCount(0);
    });

    test('lar brukeren svare på nyere forespørsel etter en eldre trukket forespørsel', async ({
        page,
    }) => {
        const eldre = lagSamtykke({
            deltTidspunkt: '2024-01-01T10:00:00.000Z',
            trukket: true,
            trukketTidspunkt: '2024-01-03T10:00:00.000Z',
        });
        const nyere = lagSamtykke({
            deltTidspunkt: '2024-03-01T10:00:00.000Z',
            tilstand: 'HAR_VARSLET',
        });
        const requests = await mockSamtykkeApi(page, async (route) => {
            if (route.request().method() === 'PUT') {
                await route.fulfill({ status: 204 });
                return;
            }
            await svarJson(route, [nyere, eldre]);
        });
        await gåTilStilling(page, 'samtykke-nyere-etter-trukket');

        const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
        await expect(region.getByText(/Du har fått en forespørsel fra Nav/)).toBeVisible();
        await expect(region.getByText(/Du har trukket samtykket/)).toHaveCount(0);
        await expect(region.getByRole('button', { name: 'Gi samtykke' })).toBeEnabled();
        await expect(region.getByRole('button', { name: 'Avvis samtykke' })).toBeEnabled();
        await bekreftHandling(page, 'Gi samtykke', 'Bekreft samtykke');

        await expect.poll(() => kallMedMetode(requests, 'PUT').length).toBe(1);
        expect(requests.find((request) => request.method === 'PUT')?.url).toContain(
            `${apiSti('samtykke-nyere-etter-trukket')}/JA`
        );
        expect(requests.find((request) => request.method === 'PUT')?.postData).toBeFalsy();
    });

    test('viser ingen mutasjonsknapper mens første henting pågår', async ({ page }) => {
        let løsGet!: () => void;
        const getGitter = new Promise<void>((resolve) => {
            løsGet = resolve;
        });
        await mockSamtykkeApi(page, async (route) => {
            await getGitter;
            await svarJson(route, [lagSamtykke()]);
        });
        await gåTilStilling(page, 'samtykke-laster');

        const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
        await expect(region.getByText('Henter status...')).toBeVisible();
        await expect(region.getByRole('button', { name: 'Gi samtykke' })).toHaveCount(0);
        await expect(region.getByRole('button', { name: 'Trekk samtykke' })).toHaveCount(0);

        løsGet();
        await expect(region.getByRole('button', { name: 'Gi samtykke' })).toBeVisible();
    });

    for (const svar of ['JA', 'NEI'] as const) {
        test(`sender ${svar} med PUT uten body først etter bekreftelse og viser oppdatert status`, async ({
            page,
        }) => {
            let sisteSamtykke = lagSamtykke();
            const id = `samtykke-svar-${svar.toLowerCase()}`;
            const requests = await mockSamtykkeApi(page, async (route) => {
                const request = route.request();
                if (request.method() === 'PUT') {
                    sisteSamtykke = {
                        ...sisteSamtykke,
                        tilstand: 'HAR_SVART',
                        svar: lagSvar(svar === 'JA'),
                    };
                    await route.fulfill({ status: 204 });
                    return;
                }
                await svarJson(route, [sisteSamtykke]);
            });
            await gåTilStilling(page, id);

            const utløsernavn = svar === 'JA' ? 'Gi samtykke' : 'Avvis samtykke';
            const dialog = await åpneDialog(page, utløsernavn);
            expect(kallMedMetode(requests, 'PUT')).toHaveLength(0);
            const bekreftelsesnavn = svar === 'JA' ? 'Bekreft samtykke' : 'Bekreft nei';
            await dialog.getByRole('button', { name: bekreftelsesnavn }).click();

            await expect.poll(() => kallMedMetode(requests, 'PUT').length).toBe(1);
            const put = requests.find((request) => request.method === 'PUT')!;
            expect(new URL(put.url).pathname).toBe(`${apiSti(id)}/${svar}`);
            expect(put.postData).toBeFalsy();
            const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
            await expect(
                region.getByText(svar === 'JA' ? /Du har sagt ja til/ : /Du har sagt nei til/)
            ).toBeVisible();
            if (svar === 'JA') {
                await expect(region.getByRole('button', { name: 'Trekk samtykke' })).toBeVisible();
            } else {
                await expect(region.getByRole('button', { name: 'Trekk samtykke' })).toHaveCount(0);
            }
        });
    }

    test('trekker samtykke med én DELETE uten body og viser trukket status', async ({ page }) => {
        const id = 'samtykke-trekk';
        let sisteSamtykke = lagSamtykke({ svar: lagSvar(true) });
        const requests = await mockSamtykkeApi(page, async (route) => {
            if (route.request().method() === 'DELETE') {
                sisteSamtykke = {
                    ...sisteSamtykke,
                    trukket: true,
                    trukketTidspunkt: '2024-01-03T10:00:00.000Z',
                };
                await route.fulfill({ status: 204 });
                return;
            }
            await svarJson(route, [sisteSamtykke]);
        });
        await gåTilStilling(page, id);
        const dialog = await åpneDialog(page, 'Trekk samtykke');
        expect(kallMedMetode(requests, 'DELETE')).toHaveLength(0);
        await dialog.getByRole('button', { name: 'Bekreft tilbaketrekking' }).click();

        await expect.poll(() => kallMedMetode(requests, 'DELETE').length).toBe(1);
        const slett = requests.find((request) => request.method === 'DELETE')!;
        expect(new URL(slett.url).pathname).toBe(apiSti(id));
        expect(slett.postData).toBeFalsy();
        expect(kallMedMetode(requests, 'PUT')).toHaveLength(0);
        const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
        await expect(region.getByText(/Du har trukket samtykket/)).toBeVisible();
        await expect(region.getByRole('button', { name: 'Trekk samtykke' })).toHaveCount(0);
        await expect(region.getByRole('button', { name: 'Gi samtykke' })).toHaveCount(0);
        await expect(region.getByRole('button', { name: 'Avvis samtykke' })).toHaveCount(0);
    });

    test('sperrer svar mens PUT og revalidering pågår og tillater én endring', async ({ page }) => {
        let løsPut!: () => void;
        let løsRevalidering!: () => void;
        const putGitter = new Promise<void>((resolve) => {
            løsPut = resolve;
        });
        const revalideringsGitter = new Promise<void>((resolve) => {
            løsRevalidering = resolve;
        });
        let getKall = 0;
        const requests = await mockSamtykkeApi(page, async (route) => {
            if (route.request().method() === 'PUT') {
                await putGitter;
                await route.fulfill({ status: 204 });
                return;
            }
            getKall += 1;
            if (getKall === 1) {
                await svarJson(route, [lagSamtykke()]);
                return;
            }
            await revalideringsGitter;
            await svarJson(route, [lagSamtykke()]);
        });
        await gåTilStilling(page, 'samtykke-sperret');

        const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
        const ja = region.getByRole('button', { name: 'Gi samtykke' });
        const nei = region.getByRole('button', { name: 'Avvis samtykke' });
        await bekreftHandling(page, 'Gi samtykke', 'Bekreft samtykke');
        await expect(region.getByText('Lagrer endringen...')).toBeVisible();
        await expect(ja).toBeDisabled();
        await expect(nei).toBeDisabled();
        expect(kallMedMetode(requests, 'PUT')).toHaveLength(1);

        løsPut();
        await expect.poll(() => kallMedMetode(requests, 'GET').length).toBe(2);
        await expect(ja).toBeDisabled();
        await expect(nei).toBeDisabled();

        løsRevalidering();
        await expect(ja).toBeEnabled();
        await expect(nei).toBeEnabled();
        expect(kallMedMetode(requests, 'PUT')).toHaveLength(1);
    });
});

test.describe('Feilhåndtering', () => {
    for (const feiltype of ['HTTP 500', 'nettverksfeil'] as const) {
        test(`viser lagrefeil ved ${feiltype} og tillater nytt forsøk`, async ({ page }) => {
            let putForsøk = 0;
            const requests = await mockSamtykkeApi(page, async (route) => {
                if (route.request().method() === 'PUT') {
                    putForsøk += 1;
                    if (putForsøk === 1) {
                        if (feiltype === 'nettverksfeil') {
                            await route.abort();
                        } else {
                            await route.fulfill({ status: 500, body: 'feil' });
                        }
                        return;
                    }
                    await route.fulfill({ status: 204 });
                    return;
                }
                await svarJson(route, [lagSamtykke()]);
            });
            await gåTilStilling(page, `samtykke-lagre-${feiltype.replace(/ /g, '-')}`);

            const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
            const utførSvar = () => bekreftHandling(page, 'Gi samtykke', 'Bekreft samtykke');
            await utførSvar();
            await expect(
                region.getByRole('alert').getByText('Vi kunne ikke lagre endringen. Prøv igjen.')
            ).toBeVisible();

            await utførSvar();
            await expect.poll(() => kallMedMetode(requests, 'PUT').length).toBe(2);
            await expect(
                region.getByRole('alert').getByText('Vi kunne ikke lagre endringen. Prøv igjen.')
            ).toHaveCount(0);
        });
    }

    test('henter på nytt etter GET-feil og viser svarmuligheter', async ({ page }) => {
        let hentingVirker = false;
        const requests = await mockSamtykkeApi(page, (route) =>
            hentingVirker
                ? svarJson(route, [lagSamtykke()])
                : route.fulfill({ status: 503, body: 'utilgjengelig' })
        );
        await gåTilStilling(page, 'samtykke-get-feil');

        const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
        await expect(
            region
                .getByRole('alert')
                .getByText('Vi kunne ikke hente samtykkestatusen din. Prøv igjen.')
        ).toBeVisible();
        await expect(region.getByRole('button', { name: 'Gi samtykke' })).toHaveCount(0);
        await expect(region.getByRole('button', { name: 'Trekk samtykke' })).toHaveCount(0);

        hentingVirker = true;
        await prøvIgjen(region);
        await expect(region.getByRole('button', { name: 'Gi samtykke' })).toBeVisible();
        expect(kallMedMetode(requests, 'GET').length).toBeGreaterThanOrEqual(2);
    });

    test('viser hentefeil etter mislykket revalidering uten å påstå at JA er bekreftet', async ({
        page,
    }) => {
        let getKall = 0;
        let hentingVirker = false;
        const requests = await mockSamtykkeApi(page, async (route) => {
            if (route.request().method() === 'PUT') {
                await route.fulfill({ status: 204 });
                return;
            }
            getKall += 1;
            if (getKall > 1 && !hentingVirker) {
                await route.fulfill({ status: 500, body: 'feil' });
                return;
            }
            await svarJson(route, [lagSamtykke()]);
        });
        await gåTilStilling(page, 'samtykke-revalidering-feil');
        await bekreftHandling(page, 'Gi samtykke', 'Bekreft samtykke');

        const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
        await expect(
            region
                .getByRole('alert')
                .getByText('Vi kunne ikke hente samtykkestatusen din. Prøv igjen.')
        ).toBeVisible();
        await expect(region.getByText(/Du har sagt ja til/)).toHaveCount(0);

        hentingVirker = true;
        await prøvIgjen(region);
        await expect(region.getByRole('button', { name: 'Gi samtykke' })).toBeVisible();
        expect(kallMedMetode(requests, 'PUT')).toHaveLength(1);
    });

    test('viser hentefeil og ingen svar-knapper ved ugyldig dato', async ({ page }) => {
        await mockSamtykkeApi(page, (route) =>
            svarJson(route, [lagSamtykke({ deltTidspunkt: 'ugyldig-dato' })])
        );
        await gåTilStilling(page, 'samtykke-ugyldig-dato');

        const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
        await expect(
            region
                .getByRole('alert')
                .getByText('Vi kunne ikke hente samtykkestatusen din. Prøv igjen.')
        ).toBeVisible();
        await expect(region.getByRole('button', { name: 'Gi samtykke' })).toHaveCount(0);
        await expect(region.getByRole('button', { name: 'Avvis samtykke' })).toHaveCount(0);
    });
});

test('velger nyeste samtykke fra usortert liste med tre forespørsler', async ({ page }) => {
    const eldre = lagSamtykke({
        deltTidspunkt: '2024-01-01T10:00:00.000Z',
        svarfrist: '2024-01-08T10:00:00.000Z',
        trukket: true,
        trukketTidspunkt: '2024-01-03T10:00:00.000Z',
    });
    const nyeste = lagSamtykke({
        deltTidspunkt: '2024-03-01T10:00:00.000Z',
        svarfrist: '2100-03-08T10:00:00.000Z',
        svar: lagSvar(true),
    });
    const mellomste = lagSamtykke({
        deltTidspunkt: '2024-02-01T10:00:00.000Z',
        svarfrist: '2024-02-08T10:00:00.000Z',
        svar: lagSvar(false),
    });
    await mockSamtykkeApi(page, (route) => svarJson(route, [eldre, nyeste, mellomste]));
    await gåTilStilling(page, 'samtykke-usortert');

    const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
    await expect(region.getByText(/Du har sagt ja til/)).toBeVisible();
    await expect(region.getByRole('button', { name: 'Trekk samtykke' })).toBeVisible();
});
