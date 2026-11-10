import { open } from 'node:fs/promises';
import { setTimeout as vent } from 'node:timers/promises';

type ProfilSvar = {
    id?: number;
    error?: { message: string };
    result?: {
        profile?: {
            nodes: {
                id: number;
                callFrame: { functionName: string; url: string; lineNumber: number };
            }[];
            samples: number[];
        };
    };
    method?: string;
    params?: { data?: { description?: string } };
};

export async function målCpuProfil(pid: string) {
    try {
        const lås = await open('.next/playwright-profil.lock', 'wx');
        await lås.close();
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'EEXIST') return;
        throw error;
    }

    // Debuggeren er bare tilgjengelig på loopback i den midlertidige testcontaineren.
    process.kill(Number(pid), 'SIGUSR1');
    let debuggerUrl: string | undefined;
    for (let forsøk = 0; forsøk < 10 && !debuggerUrl; forsøk++) {
        await vent(100);
        try {
            const response = await fetch('http://127.0.0.1:9229/json/list', {
                signal: AbortSignal.timeout(200),
            });
            const mål: unknown = await response.json();
            if (Array.isArray(mål) && typeof mål[0]?.webSocketDebuggerUrl === 'string') {
                debuggerUrl = mål[0].webSocketDebuggerUrl;
            }
        } catch (error) {
            if (forsøk === 9) throw error;
        }
    }
    if (!debuggerUrl) throw new Error('Fant ikke lokal diagnostikkdebugger');

    const socket = new WebSocket(debuggerUrl);
    await new Promise<void>((resolve, reject) => {
        socket.onopen = () => resolve();
        socket.onerror = () => reject(new Error('Kunne ikke koble til lokal debugger'));
    });
    let sekvens = 0;
    const kommando = (method: string, params = {}) =>
        new Promise<ProfilSvar>((resolve, reject) => {
            const id = ++sekvens;
            const timeout = setTimeout(() => {
                socket.removeEventListener('message', motta);
                reject(new Error('Lokal profilmåling svarte ikke'));
            }, 2000);
            const motta = (event: MessageEvent) => {
                const svar: ProfilSvar = JSON.parse(String(event.data));
                if (svar.id !== id) return;
                clearTimeout(timeout);
                socket.removeEventListener('message', motta);
                if (svar.error) reject(new Error('Lokal profileringskommando feilet'));
                else resolve(svar);
            };
            socket.addEventListener('message', motta);
            socket.send(JSON.stringify({ id, method, params }));
        });
    try {
        await kommando('Profiler.enable');
        await kommando('Profiler.start');
        await vent(500);
        const svar = await kommando('Profiler.stop');
        const profil = svar.result?.profile;
        if (!profil) throw new Error('CPU-profil mangler');
        const rammer = profil.nodes.map((node) => ({
            funksjon: node.callFrame.functionName,
            fil: node.callFrame.url.split('/').slice(-2).join('/').split(/[?#]/)[0],
            linje: node.callFrame.lineNumber + 1,
            prøver: profil.samples.filter((id) => id === node.id).length,
        }));
        await kommando('Debugger.enable');
        const nesteFeil = new Promise<string | undefined>((resolve) => {
            const timeout = setTimeout(() => {
                socket.removeEventListener('message', motta);
                resolve(undefined);
            }, 2000);
            const motta = (event: MessageEvent) => {
                const data: ProfilSvar = JSON.parse(String(event.data));
                if (data.method !== 'Debugger.paused') return;
                clearTimeout(timeout);
                socket.removeEventListener('message', motta);
                resolve(
                    data.params?.data?.description?.match(
                        /\b(?:EPIPE|EBADF|ECONNRESET|ERR_[A-Z_]+)\b/
                    )?.[0] ?? 'annen-feil'
                );
            };
            socket.addEventListener('message', motta);
        });
        await kommando('Debugger.setPauseOnExceptions', { state: 'all' });
        const feilkode = await nesteFeil;
        await kommando('Debugger.setPauseOnExceptions', { state: 'none' });
        if (feilkode !== undefined) await kommando('Debugger.resume');
        return { rammer, feilkode };
    } finally {
        socket.close();
    }
}
