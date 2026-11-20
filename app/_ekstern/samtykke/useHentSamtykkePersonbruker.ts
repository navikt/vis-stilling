'use client';

import { createFetcher } from '@navikt/toi-next-frontend/api';
import { useSWRGet } from '@navikt/toi-next-frontend/swr';
import { hentSisteSamtykke } from '../../_felles/samtykke/hentSisteSamtykke.ts';
import { samtykkeEndepunkt } from '../../_felles/samtykke/samtykkeEndepunkt.ts';
import { samtykkeListeSchema } from '../../_felles/samtykke/samtykkeSchema.ts';

const fetcher = createFetcher();

export const useHentSamtykkePersonbruker = (stillingsId: string, innlogget: boolean) => {
    const result = useSWRGet(
        innlogget && stillingsId ? samtykkeEndepunkt(stillingsId) : null,
        samtykkeListeSchema,
        ({ endpoint, schema }) => fetcher.getMedSchema(schema, endpoint),
        { nonImmutable: true }
    );

    return {
        ...result,
        data: innlogget && result.data ? hentSisteSamtykke(result.data) : undefined,
    };
};
