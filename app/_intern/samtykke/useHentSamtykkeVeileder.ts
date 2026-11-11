'use client';

import { createFetcher } from '@navikt/toi-next-frontend/api';
import { useSWRPost } from '@navikt/toi-next-frontend/swr';
import { hentSisteSamtykke } from '../../_felles/samtykke/hentSisteSamtykke.ts';
import { samtykkeEndepunktVeileder } from '../../_felles/samtykke/samtykkeEndepunkt.ts';
import { samtykkeListeSchema } from '../../_felles/samtykke/samtykkeSchema.ts';

const fetcher = createFetcher();

export const useHentSamtykkeVeileder = (
    stillingsId: string,
    innlogget: boolean,
    ident?: string
) => {
    const result = useSWRPost(
        innlogget && stillingsId && ident ? `${samtykkeEndepunktVeileder(stillingsId)}/hent` : null,
        samtykkeListeSchema,
        ident ? { ident } : null,
        ({ endpoint, schema, body }) =>
            fetcher.post<unknown>(endpoint, body).then((data) => schema.parse(data)),
        { nonImmutable: true, keepPreviousData: false, dedupingInterval: 0 }
    );

    return {
        ...result,
        data: innlogget && result.data ? hentSisteSamtykke(result.data) : undefined,
    };
};
