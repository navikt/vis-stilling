// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dekoratorMockScript } from './dekorator.ts';

const APP_URL = 'https://dekoratoren.ekstern.dev.nav.no';
const LOGIN_SESSION_API_URL = 'https://login.ekstern.dev.nav.no/oauth2/session';
const originalFetch = vi.fn<typeof fetch>();

beforeEach(() => {
    originalFetch.mockReset();
    vi.stubGlobal('fetch', originalFetch);
    vi.stubGlobal('__DECORATOR_DATA__', { env: { APP_URL, LOGIN_SESSION_API_URL } });
    window.eval(dekoratorMockScript);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('dekoratørmock', () => {
    it.each([
        `${APP_URL}/main-menu?context=privatperson&language=nb`,
        new URL(`${APP_URL}/main-menu?context=privatperson&language=nb`),
        new Request(`${APP_URL}/main-menu?context=privatperson&language=nb`),
    ])('returnerer HTML for hovedmenyen med input %s', async (input) => {
        const respons = await window.fetch(input);

        expect(respons.status).toBe(200);
        expect(respons.headers.get('Content-Type')).toBe('text/html');
        expect(await respons.text()).toBe('<a href="https://www.nav.no/">Til nav.no</a>');
        expect(originalFetch).not.toHaveBeenCalled();
    });

    it('returnerer en tom liste med driftsmeldinger', async () => {
        const respons = await window.fetch(`${APP_URL}/ops-messages?language=nb`);

        expect(respons.status).toBe(200);
        expect(respons.headers.get('Content-Type')).toBe('application/json');
        expect(await respons.json()).toEqual([]);
        expect(originalFetch).not.toHaveBeenCalled();
    });

    it('beholder innloggings- og sesjonsmockene', async () => {
        const auth = await window.fetch(`${APP_URL}/auth`);
        const sesjon = await window.fetch(LOGIN_SESSION_API_URL);

        expect(await auth.json()).toMatchObject({ auth: { authenticated: true } });
        expect(await sesjon.json()).toMatchObject({ session: { active: true } });
        expect(originalFetch).not.toHaveBeenCalled();
    });

    it.each([
        '/arbeid/stilling/api/deling-av-cv/samtykker/samtykke-ja',
        'https://example.com/main-menu',
        `${APP_URL}/main-menu/ukjent`,
        `${APP_URL}/ops-messages/ukjent`,
    ])('slipper andre kall gjennom: %s', async (url) => {
        const respons = new Response('original');
        const init = { headers: { Accept: 'application/json' } };
        originalFetch.mockResolvedValue(respons);

        expect(await window.fetch(url, init)).toBe(respons);
        expect(originalFetch).toHaveBeenCalledExactlyOnceWith(url, init);
    });

    it('slipper kall gjennom når dekoratørmiljø mangler', async () => {
        vi.stubGlobal('__DECORATOR_DATA__', undefined);
        const respons = new Response('original');
        originalFetch.mockResolvedValue(respons);
        const url = `${APP_URL}/main-menu`;

        expect(await window.fetch(url)).toBe(respons);
        expect(originalFetch).toHaveBeenCalledExactlyOnceWith(url, undefined);
    });
});
