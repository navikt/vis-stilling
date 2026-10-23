import { startMswInstrumentering } from '@navikt/toi-next-frontend/next';

export const startMockServer = () =>
    startMswInstrumentering({
        hentServer: async () => {
            const { setupServer } = await import('msw/node');
            const { samtykkeHandlers } = await import('./samtykke-handlers.ts');
            return setupServer(...samtykkeHandlers);
        },
    });
