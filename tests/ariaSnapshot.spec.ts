import { expect, test, type Page } from '@playwright/test';

// Aria-snapshots av utvalgte deler av siden (WCAG 1.3.1, 2.4.6, 4.1.2).
// Snapshotene sjekker roller, navn og rekkefølge, ikke utseende. Data som kan endre seg
// (datoer, id-er og fritekst), matches med regex. Barn som ikke er tatt med, ignoreres.
// Testene sammenligner bare den tilgjengelige strukturen, så det holder med én nettleser.

const langDato = String.raw`/\d{1,2}\. \S+ \d{4}/`;

const samtykkeboks = (page: Page) =>
    page.getByRole('region', { name: 'Samtykke til deling av CV' });

test.describe('Aria-snapshots', { tag: '@a11y' }, () => {
    test.skip(
        ({ browserName, isMobile }) => browserName !== 'chromium' || isMobile,
        'Kjører bare i chromium-desktop'
    );

    test('direktemeldt stilling uten søknadslenke', async ({ page }) => {
        await page.goto('stilling');
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`
            - main:
              - article:
                - heading "Jobbservice Mossby taxi søker to sjåfører. Kurs og opplæring gis." [level=1]
                - text: /MOSSBY TAXI AS .*Frist.*Antall stillinger:/
                - region "Samtykke til deling av CV":
                  - heading "Har du spørsmål om stillingen?" [level=2]
                  - paragraph: Kontakt veilederen din i dialogen i aktivitetsplanen.
                - heading "Om jobben" [level=2]
                - heading "Om bedriften" [level=2]
                - heading "Annonsedata" [level=2]
                - term: Sist endret
                - definition:
                  - paragraph: ${langDato}
        `);
        await expect(page.getByRole('heading', { name: 'Søk på stillingen' })).toHaveCount(0);
    });

    test('ekstern stilling med nettsted og søknadslenke', async ({ page }) => {
        await page.goto('annen-stilling');
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`
            - main:
              - article:
                - heading "Tulleskolen søker tøysekopper" [level=1]
                - heading "Om bedriften" [level=2]
                - term: Nettsted
                - definition:
                  - link "https://www.vg.no":
                    - /url: https://www.vg.no
                - heading "Søk på stillingen" [level=2]
                - term: Søknadslenke
                - definition:
                  - paragraph:
                    - link "https://www.nrk.no/":
                      - /url: https://www.nrk.no/
        `);
    });

    test('nettsted uten protokoll vises som tekst, og ugyldige lenker vises ikke', async ({
        page,
    }) => {
        await page.goto('formatert-stilling');
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`
            - main:
              - article:
                - heading "Om bedriften" [level=2]
                - term: Nettsted
                - definition: www.eksempel.no
        `);
        await expect(page.getByRole('main').locator('a[href^="javascript:" i]')).toHaveCount(0);
    });

    test('utløpt stilling med søknad på e-post', async ({ page }) => {
        await page.goto('slettet-stilling');
        await expect(page.getByRole('main')).toMatchAriaSnapshot(`
            - main:
              - article:
                - heading "IKT-brukbarhetstester" [level=1]
                - text: /^Utløpt stilling /
                - heading "Søk på stillingen" [level=2]
                - term: Søknadsepost
                - definition:
                  - paragraph:
                    - link "test@nav.no":
                      - /url: mailto:test@nav.no
        `);
    });

    test.describe('samtykke til deling av CV', () => {
        test('ubesvart forespørsel', async ({ page }) => {
            await page.goto('samtykke-ubesvart');
            await expect(samtykkeboks(page)).toMatchAriaSnapshot(`
                - region "Samtykke til deling av CV":
                  - heading "Vil du dele CV-en din med arbeidsgiveren?" [level=2]
                  - paragraph: /forespørsel fra Nav om å dele CV-en din/
                  - paragraph:
                    - link "Her kan du lese mer om å dele CV-en med arbeidsgiver":
                      - /url: /\\/min-cv\\/personvern#deling-av-cv-med-arbeidsgivere$/
                  - paragraph: /Ønsker du at Nav kan dele CV-en din/
                  - button "Gi samtykke"
                  - button "Avvis samtykke"
            `);
        });

        test('har sagt ja', async ({ page }) => {
            await page.goto('samtykke-ja');
            await expect(samtykkeboks(page)).toMatchAriaSnapshot(`
                - region "Samtykke til deling av CV":
                  - heading "Dele CV med arbeidsgiver" [level=2]
                  - paragraph: /^Du har sagt ja til/
                  - paragraph:
                    - link "Her kan du lese mer om å dele CV-en med arbeidsgiver"
                  - button "Trekk samtykke"
            `);
        });

        test('feil ved henting', async ({ page }) => {
            await page.goto('samtykke-feil');
            await expect(samtykkeboks(page)).toMatchAriaSnapshot(`
                - region "Samtykke til deling av CV":
                  - alert: /Vi kunne ikke hente samtykkestatusen din/
                  - button "Prøv igjen"
            `);
        });

        test('bekreftelsesdialog', async ({ page }) => {
            await page.goto('samtykke-ubesvart');
            await page.getByRole('button', { name: 'Gi samtykke', exact: true }).click();
            await expect(page.getByRole('alertdialog')).toMatchAriaSnapshot(`
                - alertdialog "Vil du gi samtykke?":
                  - button "Lukk"
                  - heading "Vil du gi samtykke?" [level=1]
                  - paragraph: /samtykke til å dele CV-en din/
                  - button "Avbryt"
                  - button "Bekreft samtykke"
            `);
        });
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
