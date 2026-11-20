'use client';

import { createFetcher } from '@navikt/toi-next-frontend/api';
import useSWRMutation from 'swr/mutation';
import type {
    EndreSamtykkeResponsPersonbruker,
    Samtykkehandling,
    Samtykkesvar,
} from '../../_felles/samtykke/useEndreSamtykke.ts';
import { samtykkeEndepunkt } from '../../_felles/samtykke/samtykkeEndepunkt.ts';

const fetcher = createFetcher();

export const useEndreSamtykkePersonbruker = (stillingsId: string) => {
    const { trigger, isMutating, error } = useSWRMutation<
        EndreSamtykkeResponsPersonbruker,
        Error,
        string,
        Samtykkehandling
    >(
        samtykkeEndepunkt(stillingsId),
        (endepunkt, { arg }) =>
            arg === 'TREKK'
                ? fetcher.delete<EndreSamtykkeResponsPersonbruker>(endepunkt)
                : fetcher.put<EndreSamtykkeResponsPersonbruker>(`${endepunkt}/${arg}`),
        { throwOnError: false }
    );

    return {
        endreSamtykke: (svar: Samtykkesvar) => trigger(svar),
        trekkSamtykke: () => trigger('TREKK'),
        isMutating,
        error,
    };
};
