import { expect, test, type Route } from '@playwright/test';

const erVeileder = process.env.ER_VEILEDER === 'true';
const erProd = process.env.NAIS_CLUSTER_NAME === 'prod-gcp';

type Samtykke = {
    stillingsId: string;
    deltTidspunkt: string;
    svarfrist: string;
    tilstand: string | null;
    svar: {
        harSvartJa: boolean;
        svarTidspunkt: string;
    } | null;
    trukket: boolean;
    trukketTidspunkt: string | null;
};

type RegistrertKall = {
    method: string;
    url: string;
    postData: string | null;
};

const syntetiskSamtykke = (stillingsId: string): Samtykke => ({
    stillingsId,
    deltTidspunkt: '2024-01-01T10:00:00.000Z',
    svarfrist: '2100-01-08T10:00:00.000Z',
    tilstand: 'HAR_VARSLET',
    svar: null,
    trukket: false,
    trukketTidspunkt: null,
});

const svarJson = (route: Route, data: unknown) =>
    route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
    });

const sti = (url: string) => new URL(url).pathname;

test('beholder stillings-URL-en uten nye variantstier', async ({ page }) => {
    await page.route('**/api/deling-av-cv/**', (route) => svarJson(route, []));

    const svar = await page.goto('stilling');
    expect(svar?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/arbeid/stilling/stilling');
    await expect(
        page.getByRole('heading', { level: 1, name: /Jobbservice Mossby taxi søker to sjåfører/ })
    ).toBeVisible();

    for (const stiForNyVariant of ['intern/stilling', 'ekstern/stilling']) {
        const respons = await page.goto(stiForNyVariant);
        expect(respons?.status(), stiForNyVariant).toBe(404);
    }
});

test('intern ramme viser custom element uten å laste ekstern dekoratør', async ({ page }) => {
    test.skip(!erVeileder, 'Krever ER_VEILEDER=true i testprosessen');

    const eksterneKall: string[] = [];
    await page.route('https://**/*', async (route) => {
        const url = route.request().url();
        eksterneKall.push(url);
        await route.fulfill({
            status: 200,
            contentType: url.includes('internarbeidsflate-decorator')
                ? 'application/javascript'
                : 'text/plain',
            body: '',
        });
    });

    await page.goto('stilling');

    const dekoratør = page.locator('internarbeidsflate-decorator');
    await expect(dekoratør).toHaveCount(1);
    await expect(dekoratør).toHaveAttribute('app-name', 'Vis stilling');
    await expect(dekoratør).toHaveAttribute('environment', erProd ? 'prod' : 'q2');
    await expect
        .poll(
            () => eksterneKall.filter((url) => url.includes('internarbeidsflate-decorator')).length
        )
        .toBe(1);
    await expect
        .poll(() => dekoratør.evaluate((element) => element.shadowRoot !== null))
        .toBe(false);
});

test('intern samtykke hentes og endres med syntetisk fixture', async ({ page }) => {
    test.skip(!erVeileder || erProd, 'Krever intern variant uten prod-gating');

    const stillingsId = 'samtykke-runtime-intern';
    const forventetSti = `/arbeid/stilling/api/deling-av-cv/foresporsler/kandidat/${stillingsId}`;
    let samtykke = syntetiskSamtykke(stillingsId);
    const kall: RegistrertKall[] = [];

    await page.route('**/api/deling-av-cv/foresporsler/kandidat/**', async (route) => {
        const request = route.request();
        const url = request.url();
        const method = request.method();
        const postData = request.postData();
        kall.push({ method, url, postData });

        if (method === 'POST' && sti(url) === `${forventetSti}/hent`) {
            await svarJson(route, [samtykke]);
            return;
        }

        if (method === 'PUT' && sti(url) === `${forventetSti}/svar/JA`) {
            samtykke = {
                ...samtykke,
                tilstand: 'HAR_SVART',
                svar: {
                    harSvartJa: true,
                    svarTidspunkt: '2024-01-02T10:00:00.000Z',
                },
            };
            await route.fulfill({ status: 204 });
            return;
        }

        if (method === 'PUT' && sti(url) === `${forventetSti}/trekk`) {
            samtykke = {
                ...samtykke,
                trukket: true,
                trukketTidspunkt: '2024-01-03T10:00:00.000Z',
            };
            await route.fulfill({ status: 204 });
            return;
        }

        await route.fulfill({ status: 404, body: 'Ukjent syntetisk forespørsel' });
    });

    await page.goto(stillingsId);

    const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
    await expect(
        region.getByRole('heading', { name: 'Deling av CV med arbeidsgiver' })
    ).toBeVisible();
    await expect(region.getByRole('button', { name: 'Svar ja for brukeren' })).toBeVisible();
    await expect.poll(() => kall.filter((k) => k.method === 'POST').length).toBeGreaterThan(0);
    expect(sti(kall.find((k) => k.method === 'POST')!.url)).toBe(`${forventetSti}/hent`);

    await region.getByRole('button', { name: 'Svar ja for brukeren' }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(
        dialog.getByRole('heading', { name: 'Vil du svare ja på vegne av brukeren?' })
    ).toBeVisible();
    await dialog.getByRole('button', { name: 'Bekreft ja' }).click();

    await expect.poll(() => kall.some((k) => sti(k.url) === `${forventetSti}/svar/JA`)).toBe(true);
    await expect(
        region.getByText(
            'Brukeren har sagt ja til at Nav kan dele CV-en med arbeidsgiveren for denne stillingen.'
        )
    ).toBeVisible();
    await expect(
        region.getByRole('button', { name: 'Trekk samtykket for brukeren' })
    ).toBeVisible();

    const antallHentingerFørFnrEndret = kall.filter(
        (k) => k.method === 'POST' && sti(k.url) === `${forventetSti}/hent`
    ).length;
    await page.evaluate(() => document.dispatchEvent(new Event('fnr-changed')));
    await expect
        .poll(
            () =>
                kall.filter((k) => k.method === 'POST' && sti(k.url) === `${forventetSti}/hent`)
                    .length
        )
        .toBeGreaterThan(antallHentingerFørFnrEndret);

    for (const post of kall.filter((k) => k.method === 'POST')) {
        expect(post.postData ? JSON.parse(post.postData) : {}).toEqual({});
    }

    await region.getByRole('button', { name: 'Trekk samtykket for brukeren' }).click();
    const trekkDialog = page.getByRole('alertdialog');
    await expect(
        trekkDialog.getByRole('heading', {
            name: 'Vil du trekke samtykket på vegne av brukeren?',
        })
    ).toBeVisible();
    await trekkDialog.getByRole('button', { name: 'Bekreft tilbaketrekking' }).click();

    await expect.poll(() => kall.some((k) => sti(k.url) === `${forventetSti}/trekk`)).toBe(true);
    await expect(
        region.getByText(
            'Samtykket til at Nav kan dele CV-en med arbeidsgiveren for denne stillingen, er trukket.'
        )
    ).toBeVisible();
    expect(kall.filter((k) => k.method === 'PUT').map((k) => sti(k.url))).toEqual([
        `${forventetSti}/svar/JA`,
        `${forventetSti}/trekk`,
    ]);
});

test('ekstern samtykke bruker samtykker-endepunktet og ekstern tekst', async ({ page }) => {
    test.skip(erVeileder || erProd, 'Krever ekstern variant uten prod-gating');

    const stillingsId = 'samtykke-runtime-ekstern';
    const forventetSti = `/arbeid/stilling/api/deling-av-cv/samtykker/${stillingsId}`;
    const kall: RegistrertKall[] = [];
    await page.route('**/api/deling-av-cv/samtykker/**', async (route) => {
        const request = route.request();
        kall.push({
            method: request.method(),
            url: request.url(),
            postData: request.postData(),
        });
        await svarJson(route, [syntetiskSamtykke(stillingsId)]);
    });

    await page.goto(stillingsId);

    const region = page.getByRole('region', { name: 'Samtykke til deling av CV' });
    await expect(
        region.getByRole('heading', { name: 'Vil du dele CV-en din med arbeidsgiveren?' })
    ).toBeVisible();
    await expect(region.getByRole('button', { name: 'Gi samtykke' })).toBeVisible();
    await expect.poll(() => kall.length).toBeGreaterThan(0);
    expect(kall.some((k) => k.method === 'GET' && sti(k.url) === forventetSti)).toBe(true);
});

test('ekstern variant svarer 404 på Modia-dekoratørens proxy', async ({ page, request }) => {
    test.skip(erVeileder, 'Krever ER_VEILEDER=false i testprosessen');

    await page.goto('stilling');
    const respons = await request.get(
        new URL('/arbeid/stilling/api/modia/api/decorator', page.url()).href
    );
    expect(respons.status()).toBe(404);
});

test('prod viser ikke samtykkeregion eller kaller samtykke-API i noen variant', async ({
    page,
}) => {
    test.skip(!erProd, 'Krever NAIS_CLUSTER_NAME=prod-gcp i testprosessen');

    const kall: string[] = [];
    await page.route('**/api/deling-av-cv/**', async (route) => {
        kall.push(route.request().url());
        await svarJson(route, []);
    });

    await page.goto('samtykke-runtime-prod');
    await expect(
        page.getByRole('heading', { level: 1, name: /Tulleskolen søker tøysekopper/ })
    ).toBeVisible();
    await expect(page.getByRole('region', { name: 'Samtykke til deling av CV' })).toHaveCount(0);
    await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    );
    expect(kall).toEqual([]);
});
