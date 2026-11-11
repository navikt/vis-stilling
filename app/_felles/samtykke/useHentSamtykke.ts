'use client';

import { useHentSamtykkePersonbruker } from '../../_ekstern/samtykke/useHentSamtykkePersonbruker.ts';
import { useHentSamtykkeVeileder } from '../../_intern/samtykke/useHentSamtykkeVeileder.ts';

export { hentSisteSamtykke } from './hentSisteSamtykke.ts';

export const useHentSamtykke = (
    stillingsId: string,
    innlogget: boolean,
    erVeileder: boolean,
    ident?: string
) =>
    erVeileder
        ? useHentSamtykkeVeileder(stillingsId, innlogget, ident)
        : useHentSamtykkePersonbruker(stillingsId, innlogget);
