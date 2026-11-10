import { z } from 'zod';

export const identDtoSchema = z.object({
    ident: z.string(),
});

// Sendes med som body til backend på veileder-kall
export type IdentDto = z.infer<typeof identDtoSchema>;

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
    svartAv: identSchema.optional(),
});

export const samtykkeSchema = z.object({
    stillingsId: z.string(),
    deltTidspunkt: datoSchema,
    svarfrist: datoSchema,
    tilstand: tilstandSchema.nullable(),
    svar: svarSchema.nullable(),
    trukket: z.boolean(),
    trukketTidspunkt: datoSchema.nullable(),
});

export const samtykkeListeSchema = z.array(samtykkeSchema);

export type Samtykke = z.infer<typeof samtykkeSchema>;