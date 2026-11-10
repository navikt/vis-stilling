'use client';

import { useEndreSamtykkePersonbruker } from '../../_ekstern/samtykke/useEndreSamtykkePersonbruker.ts';
import { useEndreSamtykkeVeileder } from '../../_intern/samtykke/useEndreSamtykkeVeileder.ts';

export type Samtykkesvar = 'JA' | 'NEI';
export type Samtykkehandling = Samtykkesvar | 'TREKK';

// Backend svarer 204 (utført) eller 202 (ikke utført) uten body
export type EndreSamtykkeResponsPersonbruker = undefined;
// Backend svarer 200 med en bekreftelse i text/plain
export type EndreSamtykkeResponsVeileder = string;
export type EndreSamtykkeRespons = EndreSamtykkeResponsPersonbruker | EndreSamtykkeResponsVeileder;

export const useEndreSamtykke = (stillingsId: string, erVeileder: boolean) =>
    erVeileder ? useEndreSamtykkeVeileder(stillingsId) : useEndreSamtykkePersonbruker(stillingsId);
