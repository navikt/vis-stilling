import useSWRImmutable from 'swr';
import { ModiaContextHolder } from '../../_felles/api/api-routes-with-obo.ts';
import { skalMocke } from '../../_felles/utils/util.ts';
import { z } from 'zod';

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
    const baseUrl = skalMocke ? 'http://mock-api' : ModiaContextHolder.api_url;

    return useSWRImmutable<AktivBrukerRespons>(
        `${baseUrl}/api/context/v2/aktivbruker`,
        hentOgValiderAktivBruker,
    );
};