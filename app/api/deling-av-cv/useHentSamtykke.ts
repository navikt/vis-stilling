'use client';

import { createFetcher } from '@navikt/toi-next-frontend/api';
import { z } from 'zod';
import { useSWRGet } from '@navikt/toi-next-frontend/swr';
import { samtykkeEndepunkt } from './samtykkeEndepunkt.ts';

const tilstandSchema = z.enum([
    'OPPRETTET',
    'KAN_IKKE_OPPRETTE',
    'PROVER_VARSLING',
    'HAR_VARSLET',
    'KAN_IKKE_VARSLE',
    'HAR_SVART',
    'AVBRUTT',
    'SVARFRIST_UTLOPT',
]);
const datoSchema = z.string().pipe(z.coerce.date());

const identSchema = z.object({
    ident: z.string(),
    identType: z.enum(['AKTOR_ID', 'FNR', 'NAV_IDENT']),
});

const svarSchema = z.object({
    harSvartJa: z.boolean(),
    svarTidspunkt: datoSchema,
    svartAv: identSchema,
});

const samtykkeSchema = z.object({
    stillingsId: z.string(),
    deltTidspunkt: datoSchema,
    svarfrist: datoSchema,
    tilstand: tilstandSchema.nullable(),
    svar: svarSchema.nullable(),
    trukket: z.boolean(),
    trukketTidspunkt: datoSchema.nullable(),
});

const samtykkeListeSchema = z.array(samtykkeSchema);

export type Samtykke = z.infer<typeof samtykkeSchema>;

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

export const useHentSamtykke = (stillingsId: string) => {
    const result = useSWRGet(
        stillingsId ? samtykkeEndepunkt(stillingsId) : null,
        samtykkeListeSchema,
        ({ endpoint, schema }) => fetcher.getMedSchema(schema, endpoint)
    );

    return {
        ...result,
        data: result.data ? hentSisteSamtykke(result.data) : undefined,
    };
};
