import type { Metadata } from 'next';

export const APPNAVN = 'Se stilling';

// Titler sendes til Umami og skal ikke inneholde navn på personer.
export const sidetittel = (tittel: string): Metadata['title'] => ({
    absolute: `${tittel} – ${APPNAVN}`,
});
