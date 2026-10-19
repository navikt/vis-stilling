import { tilgjengelighetstest } from '@navikt/toi-next-frontend/a11y';
import { expect, test, type Locator, type Page } from '@playwright/test';

const sider: { stillingsId: string; erKlar: (page: Page) => Locator }[] = [
    { stillingsId: 'stilling', erKlar: (page) => page.getByRole('heading', { level: 1 }) },
    { stillingsId: 'annen-stilling', erKlar: (page) => page.getByRole('heading', { level: 1 }) },
    {
        stillingsId: 'formatert-stilling',
        erKlar: (page) => page.getByRole('heading', { level: 1 }),
    },
    { stillingsId: 'slettet-stilling', erKlar: (page) => page.getByRole('heading', { level: 1 }) },
    {
        stillingsId: 'stilling-uten-jobtitle',
        erKlar: (page) => page.getByRole('heading', { level: 1 }),
    },
    {
        stillingsId: 'upublisert-stilling',
        erKlar: (page) => page.getByText(/er ikke publisert/),
    },
];

for (const { stillingsId, erKlar } of sider) {
    test.describe(`Stilling ${stillingsId}`, () => {
        test.beforeEach(async ({ page }) => {
            await page.goto(stillingsId);
            await expect(erKlar(page)).toBeVisible();
        });

        tilgjengelighetstest(test, { reflow: true });
    });
}
