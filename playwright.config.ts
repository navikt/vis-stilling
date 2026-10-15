import { defineConfig, devices } from '@playwright/test';

const PLAYWRIGHT_PORT = process.env.PLAYWRIGHT_PORT || '1337';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? '100%' : undefined,
    reporter: [['html', { open: 'never', outputFolder: 'playwright-report' }]],
    use: {
        baseURL: `http://localhost:${PLAYWRIGHT_PORT}/arbeid/stilling/`,
        trace: 'on-first-retry',
        screenshot: { mode: 'only-on-failure', fullPage: true },
    },
    expect: { timeout: 15000 },
    projects: [
        {
            name: 'chromium-desktop',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1440, height: 1080 },
            },
        },
        {
            name: 'firefox-desktop',
            use: {
                ...devices['Desktop Firefox'],
                viewport: { width: 1440, height: 1080 },
            },
        },
        {
            name: 'webkit-desktop',
            use: {
                ...devices['Desktop Safari'],
                viewport: { width: 1440, height: 1080 },
            },
        },
        { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
        { name: 'webkit-mobile', use: { ...devices['iPhone 13'] } },
    ],
    webServer: process.env.CI
        ? undefined
        : {
              command: `pnpm exec next dev -p ${PLAYWRIGHT_PORT}`,
              env: { NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE: 'true' },
              url: `http://localhost:${PLAYWRIGHT_PORT}/arbeid/stilling/stilling`,
              reuseExistingServer: true,
              timeout: 120 * 1000,
          },
});
