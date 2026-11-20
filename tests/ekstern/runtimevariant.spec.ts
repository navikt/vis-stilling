import { expect, test, type Route } from '@playwright/test';

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

test('ekstern samtykke bruker samtykker-endepunktet og ekstern tekst', async ({ page }) => {
    test.skip(erProd, 'Krever variant uten prod-gating');

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
    await page.goto('stilling');
    const respons = await request.get(
        new URL('/arbeid/stilling/api/modia/api/decorator', page.url()).href
    );
    expect(respons.status()).toBe(404);
});
