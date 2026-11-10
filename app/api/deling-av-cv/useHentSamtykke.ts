'use client';

import { createFetcher } from '@navikt/toi-next-frontend/api';
import { useSWRGet, useSWRPost } from '@navikt/toi-next-frontend/swr';
import { samtykkeEndepunkt, samtykkeEndepunktVeileder } from './samtykkeEndepunkt.ts';
import { type Samtykke, samtykkeListeSchema } from './samtykkeSchema.ts';
import { erVeileder } from '../../_utils/util.ts';

export const hentSisteSamtykke = (samtykker: readonly Samtykke[]): Samtykke | undefined =>
    samtykker.reduce<Samtykke | undefined>(
        (siste, samtykke) =>
            !siste ||
            new Date(samtykke.deltTidspunkt).getTime() > new Date(siste.deltTidspunkt).getTime()
                ? samtykke
                : siste,
        undefined
    );

const fetcher = createFetcher();

const useHentSamtykkePersonbruker = (stillingsId: string, innlogget: boolean) => {
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

const useHentSamtykkeVeileder = (stillingsId: string, innlogget: boolean) => {
    const result = useSWRPost(
        innlogget && stillingsId ? `${samtykkeEndepunktVeileder(stillingsId)}/hent` : null,
        samtykkeListeSchema,
        // Proxyen setter inn identen til aktiv bruker, men useSWRPost henter ikke uten body
        {},
        ({ endpoint, schema, body }) =>
            fetcher
                .post<unknown>(endpoint, body)
                .then((data) => fetcher.validerSchema(schema, data)),
        { nonImmutable: true }
    );

    return {
        ...result,
        data: innlogget && result.data ? hentSisteSamtykke(result.data) : undefined,
    };
};

export const useHentSamtykke = (stillingsId: string, innlogget: boolean) =>
    erVeileder
        ? useHentSamtykkeVeileder(stillingsId, innlogget)
        : useHentSamtykkePersonbruker(stillingsId, innlogget);
