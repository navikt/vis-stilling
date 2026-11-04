import { startMswInstrumentering } from '@navikt/toi-next-frontend/next';

export const startMockServer = () =>
    startMswInstrumentering({
        hentServer: async () => {
            const { setupServer } = await import('msw/node');
            const { samtykkeHandlers } = await import('./samtykke-handlers.ts');
            const { modiaHandlers } = await import('./modia-handlers.ts');
            return setupServer(...samtykkeHandlers, ...modiaHandlers);
        },
    });
