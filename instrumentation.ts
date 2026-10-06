export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;

    const { skalMocke } = await import('@navikt/toi-next-frontend/miljo');
    if (!skalMocke()) return;

    const { startMockServer } = await import('./mock/server.ts');
    await startMockServer();
}
