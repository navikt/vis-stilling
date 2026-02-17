import { BodyShort, Heading } from '@navikt/ds-react';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import Visning from '../_ui/Visning';
import { stillingInneholderPåkrevdeFelter, stillingenErPublisert } from '../_utils/stillingUtils.ts';
import { Status, hentStilling } from '../api/api';
import { logEvent } from '../logg/logEvent';

export const dynamic = 'force-dynamic';

type StillingPageProps = {
    params: Promise<{ stillingsId: string }>;
};

const Feilmelding = ({ children }: { children: ReactNode }) => (
    <div className="mx-auto my-10 w-full text-center">{children}</div>
);

const StillingPage = async ({ params }: StillingPageProps) => {
    const { stillingsId } = await params;

    if (!stillingsId) {
        notFound();
    }

    logEvent('stilling', 'åpne');

    const respons = await hentStilling(stillingsId);

    const fantIkkeStilling =
        respons.status === Status.UgyldigId ||
        (respons.status === Status.Feil && respons.statusKode === 404);

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

    if (fantIkkeStilling) {
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
