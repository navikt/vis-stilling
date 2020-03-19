import React, { useEffect, useState, FunctionComponent } from 'react';
import { Sidetittel } from 'nav-frontend-typografi';
import Loading from 'nav-frontend-spinner';

import { Respons, Status, hentStilling } from './api/api';
import Visning from './visning/Visning';
import './App.less';

const getUuidFromPath = () => window.location.pathname.split('/')[3];

const Feilmelding: FunctionComponent = ({ children }) => (
    <div className="app__feilmelding">{children}</div>
);

const App: FunctionComponent = () => {
    const uuidFraUrl = getUuidFromPath();
    const [stilling, setStilling] = useState<Respons>({
        status: Status.IkkeLastet,
    });

    const hentStillingMedUuid = async (uuid: string) => {
        setStilling(await hentStilling(uuid));
    };

    useEffect(() => {
        hentStillingMedUuid(uuidFraUrl);
    }, [uuidFraUrl]);

    const renderInnhold = () => {
        if (stilling.status === Status.Suksess) {
            return <Visning stilling={stilling.data} />;
        } else if (stilling.status === Status.Feil && stilling.statusKode === 404) {
            return <Feilmelding>Fant ingen stilling med gitt id {uuidFraUrl}</Feilmelding>;
        } else if (stilling.status === Status.Feil) {
            return (
                <Feilmelding>
                    <Sidetittel tag="p">{stilling.statusKode}</Sidetittel>
                    <p>Det skjedde dessverre en feil</p>
                </Feilmelding>
            );
        }

        return <Loading className="app__loading" />;
    };

    return <div className="app typo-normal">{renderInnhold()}</div>;
};

export default App;
