'use client';

import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { createFetcher } from '@navikt/toi-next-frontend/api';
import { z } from 'zod';

const aktivBrukerSchema = z.object({
    aktivBruker: z.string().nullable(),
});

export type AktivBrukerRespons = z.infer<typeof aktivBrukerSchema>;

const fetcher = createFetcher();
const aktivBrukerUrl = '/arbeid/stilling/api/modia/api/context/v2/aktivbruker';
const brukerbytteSchema = z.object({ fnr: z.string().nullish() });

export const useAktivBruker = () => {
    const [valg, settValg] = useState<{ generasjon: number; ident?: string | null }>({
        generasjon: 0,
    });
    useEffect(() => {
        // Fjern også åpne dialoger før neste klikk kan bruke forrige persons data.
        const byttBruker = (event: Event) => {
            const detalj = brukerbytteSchema.safeParse(
                event instanceof CustomEvent ? event.detail : undefined
            );
            // Dekoratøren sender hendelsen før serverkonteksten er oppdatert.
            flushSync(() =>
                settValg((forrige) => ({
                    generasjon: forrige.generasjon + 1,
                    ident: detalj.success ? detalj.data.fnr || null : undefined,
                }))
            );
        };
        document.addEventListener('fnr-changed', byttBruker);
        return () => document.removeEventListener('fnr-changed', byttBruker);
    }, []);

    const resultat = useSWR<AktivBrukerRespons>(
        valg.ident === undefined ? [aktivBrukerUrl, valg.generasjon] : null,
        () => fetcher.getMedSchema(aktivBrukerSchema, aktivBrukerUrl, { cache: 'no-store' }),
        { keepPreviousData: false, revalidateOnFocus: false, revalidateOnReconnect: false }
    );
    return {
        ...resultat,
        data: valg.ident === undefined ? resultat.data : { aktivBruker: valg.ident },
        error: valg.ident === undefined ? resultat.error : undefined,
        isLoading: valg.ident === undefined && resultat.isLoading,
        isValidating: valg.ident === undefined && resultat.isValidating,
        generasjon: valg.generasjon,
    };
};
