'use client';

import { createFetcher } from '@navikt/toi-next-frontend/api';
import { DelingAvCv } from '../api-routes-with-obo.ts';

const trekkSamtykkeEndepunkt = (stillingsId: string) =>
    `${DelingAvCv.internUrl}/rest/cv/samtykker/${stillingsId}`;

const giSamtykkeEndepunkt = (stillingsId: string, svar: string) =>
    `${DelingAvCv.internUrl}/rest/cv/samtykker/${stillingsId}/${svar}`;

const fetcher = createFetcher();


export const useEndreSamtykke = async (samtykket: boolean | undefined) => {
  if (samtykket) {
      return fetcher.delete(trekkSamtykkeEndepunkt(samtykket.toString()));
  } else {
      return fetcher.put()

  }
};