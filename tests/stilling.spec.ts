import { expect, test } from '@playwright/test';

test('viser direktemeldt stilling med kontaktinformasjon', async ({ page }) => {
    await page.goto('stilling');
    await expect(
        page.getByRole('heading', { level: 1, name: /Mossby taxi søker to sjåfører/ })
    ).toBeVisible();
    await expect(page.getByRole('region', { name: 'Samtykke til deling av CV' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Om jobben', exact: true })).toBeVisible();
    await expect(
        page.getByText('Kontakt veilederen din i dialogen i aktivitetsplanen.')
    ).toBeVisible();
});

test('viser arbeidsgiverens nettsted for ekstern stilling', async ({ page }) => {
    await page.goto('annen-stilling');
    await expect(
        page.getByRole('heading', { level: 1, name: 'Tulleskolen søker tøysekopper' })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Om bedriften', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'https://www.vg.no' })).toHaveAttribute(
        'href',
        'https://www.vg.no'
    );
});

test('merker slettet stilling som utløpt', async ({ page }) => {
    await page.goto('slettet-stilling');
    await expect(
        page.getByRole('heading', { level: 1, name: 'IKT-brukbarhetstester' })
    ).toBeVisible();
    await expect(page.getByText('Utløpt stilling', { exact: true })).toBeVisible();
});

test('viser ikke upublisert stilling', async ({ page }) => {
    await page.goto('upublisert-stilling');
    await expect(
        page.getByText(/Stillingen med tittel "Ny stilling" er ikke publisert/)
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Om jobben', exact: true })).toHaveCount(0);
});

test('viser stilling uten jobbtittel', async ({ page }) => {
    await page.goto('stilling-uten-jobtitle');
    await expect(
        page.getByRole('heading', { level: 1, name: /Moss taxi søker to sjåfører/ })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Om jobben', exact: true })).toBeVisible();
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
    await expect(page.getByRole('button', { name: 'Vis flere jobbdetaljer' })).toBeVisible();
    const innholdsbredde = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(innholdsbredde).toBeLessThanOrEqual(viewport.width);
});
