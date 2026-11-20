import { defineConfig, devices, type Project } from '@playwright/test';

// Egen CI-port lar Playwright eie serverens loggpipes gjennom hele testkjøringen.
const BASISPORT = Number(process.env.PLAYWRIGHT_PORT || (process.env.CI ? 1338 : 1337));

// Hver variant får egen server. Testene i tests/<variant> og tests/felles kjøres mot den.
const varianter = [
    { navn: 'ekstern', port: BASISPORT, env: {} },
    {
        navn: 'intern',
        port: BASISPORT + 1,
        // next dev låser distDir, så den interne dev-serveren trenger sin egen
        env: { ER_VEILEDER: 'true', ...(process.env.CI ? {} : { NEXT_DIST_DIR: '.next/intern' }) },
    },
] as const;

const enheter: Project[] = [
    {
        name: 'chromium-desktop',
        use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1080 } },
    },
    {
        name: 'firefox-desktop',
        use: { ...devices['Desktop Firefox'], viewport: { width: 1440, height: 1080 } },
    },
    {
        name: 'webkit-desktop',
        use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 1080 } },
    },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
    { name: 'webkit-mobile', use: { ...devices['iPhone 13'] } },
];

const baseURL = (port: number) => `http://localhost:${port}/arbeid/stilling/`;

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? '100%' : undefined,
    reporter: [['html', { open: 'never', outputFolder: 'playwright-report' }]],
    use: {
        trace: 'on-first-retry',
        screenshot: { mode: 'only-on-failure', fullPage: true },
    },
    expect: { timeout: 15000 },
    projects: varianter.flatMap(({ navn, port }) =>
        enheter.map((enhet) => ({
            ...enhet,
            name: `${navn}-${enhet.name}`,
            testMatch: new RegExp(`[\\\\/](${navn}|felles)[\\\\/].*\\.spec\\.ts$`),
            use: { ...enhet.use, baseURL: baseURL(port) },
        }))
    ),
    webServer: varianter.map(({ navn, port, env }) => ({
        name: navn,
        command: process.env.CI
            ? 'node .next/standalone/server.js'
            : `pnpm exec next dev -p ${port}`,
        env: {
            NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE: 'true',
            PORT: String(port),
            ...(process.env.CI ? { HOSTNAME: '127.0.0.1' } : {}),
            ...env,
        },
        url: process.env.CI ? `${baseURL(port)}internal/isReady` : `${baseURL(port)}stilling`,
        reuseExistingServer: !process.env.CI,
        stdout: 'pipe' as const,
        stderr: 'pipe' as const,
        timeout: 120 * 1000,
    })),
});
