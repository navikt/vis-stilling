import React, { useEffect, useState, FunctionComponent, ReactNode } from 'react';
import { BodyShort, Heading, Loader } from '@navikt/ds-react';

import { logEvent } from './amplitude/amplitude';
import { Respons, Status, hentStilling } from './api/api';
import { Stilling } from './Stilling';
import { stillingInneholderPåkrevdeFelter, stillingenErPublisert } from './visning/stillingUtils';
import Visning from './visning/Visning';
import './App.less';

const hentStillingsIdFraUrl = () => window.location.pathname.split('/')[3];

const Feilmelding: FunctionComponent = ({ children }) => (
    <div className="app__feilmelding">{children}</div>
);

const App: FunctionComponent = () => {
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

    const renderStilling = (stilling: Stilling): ReactNode => {
        if (stillingInneholderPåkrevdeFelter(stilling) && stillingenErPublisert(stilling)) {
            return <Visning stilling={stilling} />;
        } else {
            return (
                <Feilmelding>
                    <p>
                        Stillingen med tittel "{stilling.title}" er ikke publisert, og kan derfor
                        ikke vises.
                    </p>
                </Feilmelding>
            );
        }
    };

    const renderInnhold = (): ReactNode => {
        const fantIkkeStilling =
            stilling.status === Status.UgyldigId ||
            (stilling.status === Status.Feil && stilling.statusKode === 404);

        if (stilling.status === Status.Suksess) {
            return renderStilling(stilling.data);
        } else if (fantIkkeStilling) {
            return (
                <Feilmelding>
                    <Heading size="small" className="blokk-xxs">
                        Fant ikke stillingen
                    </Heading>
                    <BodyShort>Er du sikker på at du har skrevet inn riktig URL?</BodyShort>
                </Feilmelding>
            );
        } else if (stilling.status === Status.Feil) {
            return (
                <Feilmelding>
                    <Heading size="xlarge">{stilling.statusKode}</Heading>
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

        return <Loader className="app__loading" />;
    };

    return <div className="app typo-normal">{renderInnhold()}</div>;
};

export default App;
