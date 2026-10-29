import { sjekkDialog, tilgjengelighetstest } from '@navikt/toi-next-frontend/a11y';
import { expect, test, type Locator, type Page } from '@playwright/test';

const overskrift = (page: Page) => page.getByRole('heading', { level: 1 });
const samtykkeknapp = (page: Page, navn: string) =>
    page.getByRole('button', { name: navn, exact: true });

const sider: { stillingsId: string; erKlar: (page: Page) => Locator }[] = [
    { stillingsId: 'stilling', erKlar: overskrift },
    { stillingsId: 'annen-stilling', erKlar: overskrift },
    { stillingsId: 'formatert-stilling', erKlar: overskrift },
    { stillingsId: 'slettet-stilling', erKlar: overskrift },
    { stillingsId: 'stilling-uten-jobtitle', erKlar: overskrift },
    // Samtykkeboksen i ulike tilstander. Id-ene styrer svaret fra samtykke-mocken.
    { stillingsId: 'samtykke-ubesvart', erKlar: (page) => samtykkeknapp(page, 'Gi samtykke') },
    { stillingsId: 'samtykke-ja', erKlar: (page) => samtykkeknapp(page, 'Trekk samtykke') },
    {
        stillingsId: 'samtykke-feil',
        erKlar: (page) =>
            page.getByRole('region', { name: 'Samtykke til deling av CV' }).getByRole('alert'),
    },
    {
        stillingsId: 'upublisert-stilling',
        erKlar: (page) => page.getByRole('main').getByText(/er ikke publisert/),
    },
    {
        stillingsId: 'ugyldig-id',
        erKlar: (page) => page.getByRole('heading', { level: 1, name: 'Fant ikke stillingen' }),
    },
];

for (const { stillingsId, erKlar } of sider) {
    test.describe(`Stilling ${stillingsId}`, () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(stillingsId);
            await expect(erKlar(page)).toBeVisible();
        });

        tilgjengelighetstest(test, { utvidet: true, reflow: true });
    });
}

// Bekreftelsesdialogene for samtykke: fokus inn og fanget, navn, axe, Esc og fokus tilbake.
const dialoger = [
    { stillingsId: 'samtykke-ubesvart', utløser: 'Gi samtykke' },
    { stillingsId: 'samtykke-ubesvart', utløser: 'Avvis samtykke' },
    { stillingsId: 'samtykke-ja', utløser: 'Trekk samtykke' },
];

test.describe('Samtykkedialoger', { tag: '@a11y' }, () => {
    for (const { stillingsId, utløser } of dialoger) {
        test(`dialogen for «${utløser}»`, async ({ page }) => {
            await page.goto(stillingsId);
            const knapp = samtykkeknapp(page, utløser);
            await expect(knapp).toBeEnabled();
            await sjekkDialog(page, knapp);
        });
    }
});
