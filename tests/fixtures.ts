import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';
export type { Locator, Page, Route } from '@playwright/test';

// Den interne varianten laster Modia-dekoratøren fra CDN. Den gir egne landemerker og overskrifter
// og krever innlogget veileder, så testene stubber den. Tester som registrerer egne ruter, vinner.
export const test = base.extend<{ stubbetModiaDekoratør: void }>({
    stubbetModiaDekoratør: [
        async ({ page }, use) => {
            await page.route('https://cdn.nav.no/personoversikt/**', (route) =>
                route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
            );
            await use();
        },
        { auto: true },
    ],
});
