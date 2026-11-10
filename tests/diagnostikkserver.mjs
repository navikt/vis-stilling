import { spawn } from 'node:child_process';
import { writeFileSync, appendFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const loggfil = '.next/playwright-server.jsonl';
writeFileSync(loggfil, '');
const server = spawn(process.execPath, ['.next/standalone/server.js'], {
    env: { ...process.env, HOSTNAME: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'pipe'],
});

for (const [kilde, stream] of [
    ['stdout', server.stdout],
    ['stderr', server.stderr],
]) {
    createInterface({ input: stream }).on('line', (linje) => {
        // Behold hendelsestyper og feilkoder, aldri rå servermeldinger eller payloads.
        const typer = [
            'Ready',
            'MSW',
            'Error',
            'error',
            'Warning',
            'decorator',
            'dekorator',
            'fetch',
        ].filter((type) => linje.includes(type));
        if (!typer.length) return;
        const logg =
            JSON.stringify({
                tidspunkt: new Date().toISOString(),
                kilde,
                typer,
                koder: linje.match(/\b(?:E[A-Z]{3,}|UND_ERR_[A-Z_]+)\b/g) ?? [],
            }) + '\n';
        appendFileSync(loggfil, logg);
        process.stdout.write(logg);
    });
}
server.on('error', (error) => {
    console.error(JSON.stringify({ hendelse: 'serverstart-feil', type: error.name }));
    process.exitCode = 1;
});
server.on('exit', (kode, signal) => {
    const logg = JSON.stringify({ hendelse: 'server-exit', kode, signal }) + '\n';
    appendFileSync(loggfil, logg);
    process.stdout.write(logg);
    process.exitCode = kode ?? 1;
});
for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => server.kill(signal));
}
