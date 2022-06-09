import React, { useEffect, useState, ReactNode } from 'react';
import { BodyShort, Heading, Loader } from '@navikt/ds-react';

import { logEvent } from './amplitude/amplitude';
import { Respons, Status, hentStilling } from './api/api';
import { stillingInneholderPåkrevdeFelter, stillingenErPublisert } from './visning/stillingUtils';
import Visning from './visning/Visning';
import css from './App.module.css';

const hentStillingsIdFraUrl = () => window.location.pathname.split('/')[3];

const Feilmelding = ({ children }: { children: ReactNode }) => (
    <div className={css.feilmelding}>{children}</div>
);

const App = () => {
    const stillingsId = hentStillingsIdFraUrl();

    const [stilling, setStilling] = useState<Respons>({
        status: Status.IkkeLastet,
    });

    useEffect(() => {
        logEvent('stilling', 'åpne');
    }, []);

    const hentStillingMedUuid = async (uuid: string) => {
        setStilling(await hentStilling(uuid));
    };

    useEffect(() => {
        hentStillingMedUuid(stillingsId);
    }, [stillingsId]);

    const fantIkkeStilling =
        stilling.status === Status.UgyldigId ||
        (stilling.status === Status.Feil && stilling.statusKode === 404);

    if (stilling.status === Status.Suksess) {
        if (
            stillingInneholderPåkrevdeFelter(stilling.data) &&
            stillingenErPublisert(stilling.data)
        ) {
            return <Visning stilling={stilling.data} />;
        } else {
            return (
                <Feilmelding>
                    <p>
                        Stillingen med tittel "{stilling.data.title}" er ikke publisert, og kan
                        derfor ikke vises.
                    </p>
                </Feilmelding>
            );
        }
    } else if (fantIkkeStilling) {
        return (
            <Feilmelding>
                <Heading level="1" size="small" className="blokk-xxs">
                    Fant ikke stillingen
                </Heading>
                <BodyShort>Er du sikker på at du har skrevet inn riktig URL?</BodyShort>
            </Feilmelding>
        );
    } else if (stilling.status === Status.Feil) {
        return (
            <Feilmelding>
                <Heading level="1" size="xlarge">
                    {stilling.statusKode}
                </Heading>
                <p>Det skjedde dessverre en feil</p>
            </Feilmelding>
        );
    } else if (stilling.status === Status.Kjøretidsfeil) {
        return (
            <Feilmelding>
                <p>Det skjedde en ukjent feil, vennligst prøv igjen senere</p>
            </Feilmelding>
        );
    }

    return <Loader className={css.loading} />;
};

export default App;
