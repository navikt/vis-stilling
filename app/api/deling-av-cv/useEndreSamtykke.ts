'use client';

import { createFetcher } from '@navikt/toi-next-frontend/api';
import useSWRMutation from 'swr/mutation';
import { samtykkeEndepunkt } from './samtykkeEndepunkt.ts';

type Samtykkesvar = 'JA' | 'NEI';
type Samtykkehandling = Samtykkesvar | 'TREKK';

const fetcher = createFetcher();

export const useEndreSamtykke = (stillingsId: string) => {
    const { trigger, isMutating, error } = useSWRMutation<void, Error, string, Samtykkehandling>(
        samtykkeEndepunkt(stillingsId),
        (endepunkt, { arg }) =>
            arg === 'TREKK'
                ? fetcher.delete<void>(endepunkt)
                : fetcher.put<void>(`${endepunkt}/${arg}`),
        { throwOnError: false }
    );

    return {
        endreSamtykke: (svar: Samtykkesvar) => trigger(svar),
        trekkSamtykke: () => trigger('TREKK'),
        isMutating,
        error,
    };
};
