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

test.describe('Kontaktperson', () => {
    const kontaktpersonOverskrift = 'Kontaktperson for stillingen';

    test('viser kontaktperson for stilling som ikke er direktemeldt', async ({ page }) => {
        await page.goto('arbeidsplassenStilling');

        const seksjon = page.locator('section', {
            has: page.getByRole('heading', { level: 2, name: kontaktpersonOverskrift }),
        });
        await expect(seksjon).toBeVisible();
        for (const [felt, verdi] of [
            ['Kontaktperson', 'Kontakt Kontaktus'],
            ['Stillingstittel', 'leder'],
            ['Telefon', '00000000'],
            ['E-post', 'kontakt.kontaktus@tøys.no'],
        ]) {
            await expect(seksjon.getByText(felt, { exact: true })).toBeVisible();
            await expect(seksjon.getByText(verdi, { exact: true })).toBeVisible();
        }
    });

    test('viser ikke kontaktperson for direktemeldt stilling', async ({ page }) => {
        await page.goto('stilling');

        await expect(
            page.getByRole('heading', { level: 1, name: /Mossby taxi søker to sjåfører/ })
        ).toBeVisible();
        await expect(page.getByRole('heading', { name: kontaktpersonOverskrift })).toHaveCount(0);
        await expect(page.getByText('Joare Mangstuen Mossby')).toHaveCount(0);
        await expect(page.getByText('joare.mangstuen.mossby@nav.no')).toHaveCount(0);
    });
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

for (const ugyldigId of ['undefined', 'ikke-en-uuid', '9983a5ef-e573-4ee8-b73c-7e617a1d896a0']) {
    test(`viser «Fant ikke stillingen» for ugyldig id ${ugyldigId}`, async ({ page }) => {
        await page.goto(ugyldigId);
        await expect(
            page.getByRole('heading', { level: 1, name: 'Fant ikke stillingen' })
        ).toBeVisible();
    });
}

for (const idMedEkstraTegn of [
    '9983a5ef-e573-4ee8-b73c-7e617a1d896a.',
    '9983a5ef-e573-4ee8-b73c-7e617a1d896a%C3%83%C2%A6',
]) {
    test(`sender ${idMedEkstraTegn} videre til adressen uten ekstra tegn`, async ({ page }) => {
        await page.goto(idMedEkstraTegn);
        await expect(page).toHaveURL(/\/arbeid\/stilling\/9983a5ef-e573-4ee8-b73c-7e617a1d896a$/);
        await expect(
            page.getByRole('heading', { level: 1, name: /Mossby taxi søker to sjåfører/ })
        ).toBeVisible();
    });
}
