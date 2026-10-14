import { expect, test } from '@playwright/test';

test('viser direktemeldt stilling med søknadsinformasjon', async ({ page }) => {
    await page.goto('stilling');
    await expect(
        page.getByRole('heading', { level: 1, name: /Mossby taxi søker to sjåfører/ })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Søknad', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Om stillingen', exact: true })).toBeVisible();
    await expect(
        page.getByText('Kontakt veilederen din i dialogen i aktivitetsplanen.')
    ).toBeVisible();
});

test('viser søknadslenke for ekstern stilling', async ({ page }) => {
    await page.goto('annen-stilling');
    await expect(
        page.getByRole('heading', { level: 1, name: 'Tulleskolen søker tøysekopper' })
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Søk på stillingen' })).toHaveAttribute(
        'href',
        'https://www.nrk.no'
    );
});

test('viser advarsel for slettet stilling', async ({ page }) => {
    await page.goto('slettet-stilling');
    await expect(
        page.getByRole('heading', { level: 1, name: 'IKT-brukbarhetstester' })
    ).toBeVisible();
    await expect(
        page.getByText('Denne stillingen er slettet og er ikke lenger aktiv.')
    ).toBeVisible();
});

test('viser ikke upublisert stilling', async ({ page }) => {
    await page.goto('upublisert-stilling');
    await expect(
        page.getByText(/Stillingen med tittel "Ny stilling" er ikke publisert/)
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Søknad', exact: true })).toHaveCount(0);
});

test('bruker kategoritittel når stillingstittel mangler', async ({ page }) => {
    await page.goto('stilling-uten-jobtitle');
    await expect(
        page.getByRole('heading', { level: 1, name: /Moss taxi søker to sjåfører/ })
    ).toBeVisible();
    await expect(page.getByText('Hjelpearbeider', { exact: true })).toBeVisible();
});

test('mobilvisning viser innhold uten horisontal scrolling', async ({
    page,
    isMobile,
    viewport,
}) => {
    test.skip(!isMobile, 'Gjelder mobilvisning');
    if (!viewport) {
        throw new Error('Mobiltesten krever en konfigurert skjermstørrelse');
    }
    await page.goto('annen-stilling');
    await expect(page.getByRole('link', { name: 'Søk på stillingen' })).toBeVisible();
    const innholdsbredde = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(innholdsbredde).toBeLessThanOrEqual(viewport.width);
});
