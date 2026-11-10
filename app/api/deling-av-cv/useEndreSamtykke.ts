'use client';

import { createFetcher } from '@navikt/toi-next-frontend/api';
import useSWRMutation from 'swr/mutation';
import { samtykkeEndepunkt, samtykkeEndepunktVeileder } from './samtykkeEndepunkt.ts';
import { erVeileder } from '../../_utils/util.ts';

type Samtykkesvar = 'JA' | 'NEI';
type Samtykkehandling = Samtykkesvar | 'TREKK';

// Backend svarer 204 (utført) eller 202 (ikke utført) uten body
type EndreSamtykkeResponsPersonbruker = undefined;
// Backend svarer 200 med en bekreftelse i text/plain
type EndreSamtykkeResponsVeileder = string;
export type EndreSamtykkeRespons = EndreSamtykkeResponsPersonbruker | EndreSamtykkeResponsVeileder;

const fetcher = createFetcher();

const useEndreSamtykkePersonbruker = (stillingsId: string) => {
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

const useEndreSamtykkeVeileder = (stillingsId: string) => {
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
        { throwOnError: false }
    );

    return {
        endreSamtykke: (svar: Samtykkesvar) => trigger(svar),
        trekkSamtykke: () => trigger('TREKK'),
        isMutating,
        error,
    };
};

export const useEndreSamtykke = (stillingsId: string) =>
    erVeileder ? useEndreSamtykkeVeileder(stillingsId) : useEndreSamtykkePersonbruker(stillingsId);
