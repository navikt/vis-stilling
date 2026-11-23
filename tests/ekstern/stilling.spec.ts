import { expect, test } from '@playwright/test';

// Kontaktteksten og footeren finnes bare i personbrukervarianten.
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

test('viser ikke upublisert stilling', async ({ page }) => {
    await page.goto('upublisert-stilling');
    await expect(
        page.getByText(/Stillingen med tittel "Ny stilling" er ikke publisert/)
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Om jobben', exact: true })).toHaveCount(0);

    const footer = page.getByRole('contentinfo').last();
    await expect(footer).toBeVisible();
    const vinduhøyde = page.viewportSize()!.height;
    await expect
        .poll(async () => {
            const boks = await footer.boundingBox();
            return boks ? Math.round(boks.y + boks.height) : 0;
        })
        .toBeGreaterThanOrEqual(vinduhøyde);
});
