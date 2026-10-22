import { BodyShort, Heading } from '@navikt/ds-react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { cache, type ReactNode } from 'react';

import Visning from '../_ui/Visning';
import { sidetittel } from '../_utils/sidetittel';
import { tolkStillingsId } from '../_utils/stillingsId';
import { stillingInneholderPåkrevdeFelter, stillingenErPublisert } from '../_utils/stillingUtils';
import { type Respons, Status, hentStilling } from '../api/api';
import { logEvent } from '../logg/logEvent';

export const dynamic = 'force-dynamic';

type StillingPageProps = {
    params: Promise<{ stillingsId: string }>;
};

// Deler oppslaget mellom generateMetadata og siden i samme forespørsel
const hentStillingMedCache = cache(hentStilling);

const fantIkkeStillingen = (respons: Respons) =>
    respons.status === Status.UgyldigId ||
    (respons.status === Status.Feil && respons.statusKode === 404);

const lagTittel = (respons: Respons): string => {
    if (respons.status === Status.Suksess) {
        const stilling = respons.data;
        if (stillingInneholderPåkrevdeFelter(stilling) && stillingenErPublisert(stilling)) {
            return stilling.title?.trim() || 'Stilling';
        }
        return 'Stillingen er ikke publisert';
    }
    if (fantIkkeStillingen(respons)) {
        return 'Fant ikke stillingen';
    }
    return 'Feil ved visning av stilling';
};

export const generateMetadata = async ({ params }: StillingPageProps): Promise<Metadata> => {
    const { stillingsId } = await params;
    if (!stillingsId || tolkStillingsId(stillingsId).type === 'omdiriger') {
        return {};
    }
    return { title: sidetittel(lagTittel(await hentStillingMedCache(stillingsId))) };
};

const Feilmelding = ({ children }: { children: ReactNode }) => (
    <main id="maincontent" className="mx-auto my-10 w-full text-center">
        {children}
    </main>
);

const StillingPage = async ({ params }: StillingPageProps) => {
    const { stillingsId } = await params;

    if (!stillingsId) {
        notFound();
    }

    const tolketStillingsId = tolkStillingsId(stillingsId);
    if (tolketStillingsId.type === 'omdiriger') {
        permanentRedirect(`/${tolketStillingsId.stillingsId}`);
    }

    logEvent('stilling', 'åpne');

    const respons = await hentStillingMedCache(stillingsId);

    if (respons.status === Status.Suksess) {
        if (stillingInneholderPåkrevdeFelter(respons.data) && stillingenErPublisert(respons.data)) {
            return <Visning stilling={respons.data} />;
        }

        return (
            <Feilmelding>
                <p>
                    Stillingen med tittel "{respons.data.title}" er ikke publisert, og kan derfor
                    ikke vises.
                </p>
            </Feilmelding>
        );
    }

    if (fantIkkeStillingen(respons)) {
        return (
            <Feilmelding>
                <Heading level="1" size="small" className="mb-2">
                    Fant ikke stillingen
                </Heading>
                <BodyShort>Er du sikker på at du har skrevet inn riktig URL?</BodyShort>
            </Feilmelding>
        );
    }

    if (respons.status === Status.Feil) {
        return (
            <Feilmelding>
                <Heading level="1" size="xlarge">
                    {respons.statusKode}
                </Heading>
                <p>Det skjedde dessverre en feil</p>
            </Feilmelding>
        );
    }

    if (respons.status === Status.Kjøretidsfeil) {
        return (
            <Feilmelding>
                <p>Det skjedde en ukjent feil, vennligst prøv igjen senere</p>
            </Feilmelding>
        );
    }

    return notFound();
};

export default StillingPage;
