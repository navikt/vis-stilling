import { lagApmFeilrapportering } from '@navikt/toi-next-frontend/apm';

export { filtrerApmHendelse } from '@navikt/toi-next-frontend/apm';

export const { rapporterFeil } = lagApmFeilrapportering({
    aktiv: true,
    // Dynamisk import: SDK-et er ESM-only og skal ikke lastes på server.
    captureException: (feil, valg) =>
        import('@nais/apm').then(({ captureException }) => captureException(feil, valg)),
});
