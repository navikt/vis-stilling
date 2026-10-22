const tillatteProtokoller = ['http:', 'https:'];

// Et skjema etterfulgt av et siffer er trolig vert:port, f.eks. "www.eksempel.no:8080"
const harSkjema = /^[a-z][a-z0-9+.-]*:(?!\d)/i;

/**
 * Gjør om en lenke fra stillingsannonsen til en absolutt http(s)-lenke.
 * Lenker uten protokoll, som "www.eksempel.no", får "https://" foran.
 * Returnerer undefined for tomme, ugyldige eller ikke-http(s)-lenker, f.eks. "javascript:".
 */
export const lagEksternLenke = (lenke?: string | null): string | undefined => {
    const verdi = lenke?.trim();
    if (!verdi) {
        return undefined;
    }

    const kandidat = harSkjema.test(verdi) ? verdi : `https://${verdi.replace(/^\/+/, '')}`;

    try {
        const url = new URL(kandidat);

        if (!tillatteProtokoller.includes(url.protocol) || !url.hostname.includes('.')) {
            return undefined;
        }

        return kandidat;
    } catch {
        return undefined;
    }
};
