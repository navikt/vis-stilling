const tillatteProtokoller = ['http:', 'https:'];

// Et skjema etterfulgt av bare sifre er trolig vert:port, f.eks. "www.eksempel.no:8080/sok".
// "mailto:123@eksempel.no" har sifre etter kolon, men er et skjema.
const harSkjema = /^[a-z][a-z0-9+.-]*:(?!\d+(?:[/?#]|$))/i;

/**
 * Gjør om en lenke fra stillingsannonsen til en absolutt http(s)-lenke.
 * Lenker uten protokoll, som "www.eksempel.no", får "https://" foran.
 * Returnerer den normaliserte lenken (url.href), eller undefined for tomme, ugyldige eller ikke-http(s)-lenker, f.eks. "javascript:".
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

        return url.href;
    } catch {
        return undefined;
    }
};
