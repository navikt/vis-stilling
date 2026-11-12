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

export const useEndreSamtykkeVeileder = (stillingsId: string, ident?: string) => {
    const { mutate } = useSWRConfig();
    const { trigger, isMutating, error } = useSWRMutation<
        EndreSamtykkeResponsVeileder,
        Error,
        [string, string] | null,
        Samtykkehandling
    >(
        ident ? [samtykkeEndepunktVeileder(stillingsId), ident] : null,
        ([endepunkt, valgtIdent], { arg }) =>
            arg === 'TREKK'
                ? fetcher.put<EndreSamtykkeResponsVeileder>(`${endepunkt}/trekk`, {
                      ident: valgtIdent,
                  })
                : fetcher.put<EndreSamtykkeResponsVeileder>(`${endepunkt}/svar/${arg}`, {
                      ident: valgtIdent,
                  }),
        {
            throwOnError: false,
            onSuccess: () =>
                mutate([
                    `${samtykkeEndepunktVeileder(stillingsId)}/hent`,
                    JSON.stringify({ ident }),
                ]),
        }
    );

    return {
        endreSamtykke: (svar: Samtykkesvar) => trigger(svar),
        trekkSamtykke: () => trigger('TREKK'),
        isMutating,
        error,
    };
};
