import { expect, test, type Route } from '../fixtures.ts';

const erProd = process.env.NAIS_CLUSTER_NAME === 'prod-gcp';

const svarJson = (route: Route, data: unknown) =>
    route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
    });

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
