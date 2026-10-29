import { expect, test } from '@playwright/test';

// WCAG 2.4.2 Sidetitler: hver side skal ha en tittel som beskriver formålet.
// Titler sendes til Umami, så de skal aldri inneholde navn på personer.
const sider: [stillingsId: string, tittel: string][] = [
    ['stilling', 'Jobbservice Mossby taxi søker to sjåfører. Kurs og opplæring gis.'],
    ['annen-stilling', 'Tulleskolen søker tøysekopper'],
    ['slettet-stilling', 'IKT-brukbarhetstester'],
    ['formatert-stilling', 'Formatert stilling eksempel'],
    ['samtykke-ubesvart', 'Tulleskolen søker tøysekopper'],
    ['upublisert-stilling', 'Stillingen er ikke publisert'],
    ['ugyldig-id', 'Fant ikke stillingen'],
];

const escape = (tekst: string) => tekst.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test.describe('Sidetitler (WCAG 2.4.2)', { tag: '@a11y' }, () => {
    for (const [stillingsId, tittel] of sider) {
        test(`${stillingsId} har tittelen «${tittel}»`, async ({ page }) => {
            await page.goto(stillingsId);
            await expect(page).toHaveTitle(new RegExp(`^${escape(tittel)} – Se stilling$`));
        });
    }
});
