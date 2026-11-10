import { test as grunntest, type Request } from '@playwright/test';
import { closeSync, constants, openSync, readSync } from 'node:fs';
import { readdir, readFile, readlink } from 'node:fs/promises';

export { expect, type Locator, type Page, type Route } from '@playwright/test';

const sikkerUrl = (verdi: string) => {
    const url = new URL(verdi);
    return (
        url.origin +
        url.pathname
            .replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, ':id')
            .replace(/[^/]*@[^/]*/g, ':epost')
            .replace(/\d{6,}/g, ':nummer')
    );
};

export const test = grunntest.extend({
    page: async ({ page, baseURL }, use, testInfo) => {
        const start = Date.now();
        const forespørsler = new Map<Request, number>();
        const hendelser: object[] = [];
        const registrer = (data: object) => {
            if (hendelser.length < 500) hendelser.push({ ms: Date.now() - start, ...data });
        };
        const uteståendeForespørsler = () =>
            [...forespørsler].map(([request, tidspunkt]) => ({
                url: sikkerUrl(request.url()),
                metode: request.method(),
                type: request.resourceType(),
                ventetMs: Date.now() - tidspunkt,
            }));
        page.on('request', (request) => {
            forespørsler.set(request, Date.now());
            if (request.isNavigationRequest()) {
                registrer({
                    hendelse: 'navigasjon',
                    metode: request.method(),
                    url: sikkerUrl(request.url()),
                    fra: request.redirectedFrom()
                        ? sikkerUrl(request.redirectedFrom()!.url())
                        : undefined,
                });
            }
        });
        page.on('response', (response) => {
            const request = response.request();
            if (request.isNavigationRequest() || response.status() >= 400) {
                registrer({
                    hendelse: 'respons',
                    url: sikkerUrl(response.url()),
                    status: response.status(),
                    type: request.resourceType(),
                    ttfbMs: Date.now() - (forespørsler.get(request) ?? Date.now()),
                });
            }
        });
        page.on('requestfinished', (request) => forespørsler.delete(request));
        page.on('requestfailed', (request) => {
            registrer({
                hendelse: 'requestfailed',
                url: sikkerUrl(request.url()),
                type: request.resourceType(),
                kode: request.failure()?.errorText.match(/(?:net::|NS_)[A-Z_]+/)?.[0],
            });
            forespørsler.delete(request);
        });
        page.on('domcontentloaded', () => registrer({ hendelse: 'DOMContentLoaded' }));
        page.on('load', () => registrer({ hendelse: 'load' }));

        const timeoutSnapshot = setTimeout(() => {
            const snapshot = {
                hendelse: 'timeout-snapshot',
                utestående: uteståendeForespørsler(),
            };
            registrer(snapshot);
            console.error(`TIMEOUTDIAGNOSTIKK ${JSON.stringify(snapshot)}`);
        }, testInfo.timeout);
        timeoutSnapshot.unref();
        try {
            await use(page);
        } finally {
            clearTimeout(timeoutSnapshot);
        }

        if (testInfo.status === testInfo.expectedStatus) return;

        const utestående = uteståendeForespørsler();
        if (baseURL) {
            const tidspunkt = Date.now();
            try {
                const response = await fetch(new URL('internal/isReady', baseURL), {
                    signal: AbortSignal.timeout(2000),
                    redirect: 'manual',
                });
                registrer({
                    hendelse: 'readiness',
                    status: response.status,
                    varighetMs: Date.now() - tidspunkt,
                });
                await response.body?.cancel();
            } catch (error) {
                registrer({
                    hendelse: 'readiness-feil',
                    type: error instanceof Error ? error.name : 'ukjent',
                    varighetMs: Date.now() - tidspunkt,
                });
            }
        }
        const diagnose = JSON.stringify({ hendelser, utestående }, null, 2);
        console.error(`NETTVERKSDIAGNOSTIKK ${diagnose}`);
        await testInfo.attach('nettverksdiagnostikk', {
            body: diagnose,
            contentType: 'application/json',
        });
        if (process.platform === 'linux') {
            const prosesser: object[] = [];
            for (const pid of (await readdir('/proc')).filter((navn) => /^\d+$/.test(navn))) {
                try {
                    const kommando = await readFile(`/proc/${pid}/cmdline`, 'utf8');
                    if (
                        !kommando.includes('.next/standalone/server.js') &&
                        !kommando.startsWith('next-server')
                    )
                        continue;
                    const status = await readFile(`/proc/${pid}/status`, 'utf8');
                    prosesser.push({
                        pid,
                        tilstand: status.match(/^State:\s+(.+)$/m)?.[1],
                        ventepunkt: (await readFile(`/proc/${pid}/wchan`, 'utf8')).trim(),
                        stdout: await readlink(`/proc/${pid}/fd/1`),
                        stderr: await readlink(`/proc/${pid}/fd/2`),
                    });
                    for (const fd of [1, 2]) {
                        let kanal: number | undefined;
                        let lest = 0;
                        let kode: unknown;
                        try {
                            kanal = openSync(
                                `/proc/${pid}/fd/${fd}`,
                                constants.O_RDONLY | constants.O_NONBLOCK
                            );
                            const buffer = Buffer.alloc(65536);
                            while (lest < 1024 * 1024) {
                                const antall = readSync(kanal, buffer);
                                if (antall === 0) break;
                                lest += antall;
                            }
                        } catch (error) {
                            kode =
                                error instanceof Error && 'code' in error ? error.code : 'ukjent';
                        } finally {
                            if (kanal !== undefined) closeSync(kanal);
                        }
                        // Rå loggdata forkastes. Bare byteantall og eventuell I/O-feilkode beholdes.
                        prosesser.push({ pid, hendelse: 'loggkanal-avlastet', fd, lest, kode });
                    }
                    try {
                        const response = await fetch(new URL('internal/isReady', baseURL), {
                            signal: AbortSignal.timeout(2000),
                        });
                        prosesser.push({
                            pid,
                            hendelse: 'readiness-etter-loggavlasting',
                            status: response.status,
                        });
                        await response.body?.cancel();
                    } catch (error) {
                        prosesser.push({
                            pid,
                            hendelse: 'readiness-etter-loggavlasting-feil',
                            type: error instanceof Error ? error.name : 'ukjent',
                        });
                    }
                } catch (error) {
                    const kode = error instanceof Error && 'code' in error ? error.code : 'ukjent';
                    if (kode !== 'ENOENT' && kode !== 'ESRCH') {
                        prosesser.push({ pid, hendelse: 'prosessmåling-feil', kode });
                    }
                }
            }
            const prosessdiagnose = JSON.stringify(prosesser);
            console.error(`PROSESSDIAGNOSTIKK ${prosessdiagnose}`);
            await testInfo.attach('prosessdiagnostikk', {
                body: prosessdiagnose,
                contentType: 'application/json',
            });
        }
        if (process.env.CI && process.env.PLAYWRIGHT_DIAGNOSTIKKSERVER === 'true') {
            await testInfo.attach('serverdiagnostikk', {
                body: await readFile('.next/playwright-server.jsonl'),
                contentType: 'application/x-ndjson',
            });
        }
    },
});
