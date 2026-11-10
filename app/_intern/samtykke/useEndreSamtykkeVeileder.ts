'use client';

import { createFetcher } from '@navikt/toi-next-frontend/api';
import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';
import type {
    EndreSamtykkeResponsVeileder,
    Samtykkehandling,
    Samtykkesvar,
} from '../../_felles/samtykke/useEndreSamtykke.ts';
import { samtykkeEndepunktVeileder } from '../../_felles/samtykke/samtykkeEndepunkt.ts';

const fetcher = createFetcher();

export const useEndreSamtykkeVeileder = (stillingsId: string) => {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error } = useSWRMutation<
        EndreSamtykkeResponsVeileder,
        Error,
        string,
        Samtykkehandling
    >(
        samtykkeEndepunktVeileder(stillingsId),
        (endepunkt, { arg }) =>
            arg === 'TREKK'
                ? fetcher.put<EndreSamtykkeResponsVeileder>(`${endepunkt}/trekk`)
                : fetcher.put<EndreSamtykkeResponsVeileder>(`${endepunkt}/svar/${arg}`),
        {
            throwOnError: false,
            onSuccess: () =>
                mutate([`${samtykkeEndepunktVeileder(stillingsId)}/hent`, JSON.stringify({})]),
        }
    );

    return {
        endreSamtykke: (svar: Samtykkesvar) => trigger(svar),
        trekkSamtykke: () => trigger('TREKK'),
        isMutating,
        error,
    };
};
