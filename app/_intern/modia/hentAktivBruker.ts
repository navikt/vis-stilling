import useSWRImmutable from 'swr';
import { z } from 'zod';
import { ModiaContextHolder } from '../../_felles/api/api-routes-with-obo.ts';

export type AktivBruker =
    | { ok: true; fnr: string }
    | { ok: false; årsak: 'INGEN_AKTIV_BRUKER' | 'IKKE_AUTENTISERT' | 'FEIL' };

export const INGEN_AKTIV_BRUKER = 'INGEN_AKTIV_BRUKER';

const aktivBrukerSchema = z.object({
    aktivBruker: z.string().nullable(),
});

export type AktivBrukerRespons = z.infer<typeof aktivBrukerSchema>;

const hentOgValiderAktivBruker = async (url: string): Promise<AktivBrukerRespons> => {
    const respons = await fetch(url);
    if (!respons.ok) {
        throw new Error(`modiacontextholder svarte ${respons.status} på aktiv bruker`);
    }
    return aktivBrukerSchema.parse(await respons.json());
};

export const useAktivBruker = async () => {
    return useSWRImmutable<AktivBrukerRespons>(
        `${ModiaContextHolder.api_url}/api/context/v2/aktivbruker`,
        hentOgValiderAktivBruker
    );
};
