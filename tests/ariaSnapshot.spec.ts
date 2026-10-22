import { expect, test, type Page } from '@playwright/test';

// Aria-snapshots av utvalgte deler av siden (WCAG 1.3.1, 2.4.6, 4.1.2).
// Snapshotene sjekker roller, navn og rekkefølge, ikke utseende. Datoer matches med regex.
// Testene sammenligner bare den tilgjengelige strukturen, så det holder med én nettleser.

const dato = String.raw`/\d{2}\.\d{2}\.\d{4}/`;

const toppseksjon = (page: Page) =>
    page.getByRole('banner').filter({ has: page.getByRole('heading', { level: 1 }) });

const panel = (page: Page, tittel: string) =>
    page
        .locator('div:has(> h2)')
        .filter({ has: page.getByRole('heading', { level: 2, name: tittel, exact: true }) });

test.describe('Aria-snapshots', { tag: '@a11y' }, () => {
    test.skip(
        ({ browserName, isMobile }) => browserName !== 'chromium' || isMobile,
        'Kjører bare i chromium-desktop'
    );

    test.describe('direktemeldt stilling', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('stilling');
        });

        test('overskrift og nøkkelinfo', async ({ page }) => {
            await expect(toppseksjon(page)).toMatchAriaSnapshot(`
                - banner:
                  - text: /MOSSBY TAXI AS, .+/
                  - heading "Jobbservice Mossby taxi søker to sjåfører. Kurs og opplæring gis." [level=1]
            `);
            await expect(panel(page, 'Om stillingen')).toMatchAriaSnapshot(`
                - heading "Om stillingen" [level=2]
                - term: "Stillingstittel:"
                - definition: Drosjesjåfør
                - term: "Arbeidssted:"
                - definition: Drammen
                - term: "Ansettelsesform:"
                - definition: Fast
                - term: "Omfang:"
                - definition: Heltid
                - term: "Antall stillinger:"
                - definition: "2"
                - term: "Oppstart:"
                - definition: Etter avtale
            `);
        });

        test('søknad uten lenke og kontakt via veileder', async ({ page }) => {
            await expect(panel(page, 'Søknad')).toMatchAriaSnapshot(`
                - heading "Søknad" [level=2]
                - term: "Søknadsfrist:"
                - definition: Snarest
            `);
            await expect(panel(page, 'Søknad').getByRole('link')).toHaveCount(0);
            await expect(panel(page, 'Har du spørsmål om stillingen?')).toMatchAriaSnapshot(`
                - heading "Har du spørsmål om stillingen?" [level=2]
                - text: Kontakt veilederen din i dialogen i aktivitetsplanen.
            `);
            await expect(panel(page, 'Kontaktperson for stillingen')).toHaveCount(0);
        });
    });

    test.describe('ekstern stilling', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('annen-stilling');
        });

        test('søknad med lenke', async ({ page }) => {
            await expect(panel(page, 'Søknad')).toMatchAriaSnapshot(`
                - heading "Søknad" [level=2]
                - term: "Søknadsfrist:"
                - definition: ${dato}
                - link "Søk på stillingen":
                  - /url: https://www.nrk.no/
            `);
        });

        test('kontaktperson', async ({ page }) => {
            await expect(panel(page, 'Kontaktperson for stillingen')).toMatchAriaSnapshot(`
                - heading "Kontaktperson for stillingen" [level=2]
                - term: "Kontaktperson:"
                - definition: /.+/
                - term: "Stillingstittel:"
                - definition: /.+/
                - term: "Telefon:"
                - definition: /\\d+/
                - term: "E-post:"
                - definition:
                  - link /.+@.+/:
                    - /url: /^mailto:.+@.+/
            `);
            await expect(panel(page, 'Har du spørsmål om stillingen?')).toHaveCount(0);
        });
    });

    test('søknad med e-post', async ({ page }) => {
        await page.goto('slettet-stilling');
        await expect(panel(page, 'Søknad')).toMatchAriaSnapshot(`
            - heading "Søknad" [level=2]
            - term: "Søknadsfrist:"
            - definition: Snarest
            - term: "Søknad sendes til:"
            - definition:
              - link "test@nav.no":
                - /url: mailto:test@nav.no
        `);
    });

    test('feilside for ukjent stilling', async ({ page }) => {
        await page.goto('ugyldig-id');
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`
            - main:
              - heading "Fant ikke stillingen" [level=1]
              - paragraph: Er du sikker på at du har skrevet inn riktig URL?
        `);
    });

    test('feilside for upublisert stilling', async ({ page }) => {
        await page.goto('upublisert-stilling');
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`
            - main:
              - paragraph: /Stillingen med tittel ".+" er ikke publisert, og kan derfor ikke vises\\./
        `);
    });
});
