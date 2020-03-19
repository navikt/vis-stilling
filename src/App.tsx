import React, { useEffect, useState } from 'react';
import { Systemtittel, Sidetittel } from 'nav-frontend-typografi';
import { Respons, Status, hentStilling } from './api/api';
import './App.less';

const getUuidFromPath = () => window.location.pathname.split('/')[3];

const App = () => {
    const uuidFraUrl = getUuidFromPath();
    const [stilling, setStilling] = useState<Respons>({
        status: Status.IkkeLastet,
    });

    const hentStillingMedUuid = async (uuid: string) => {
        const stilling = await hentStilling(uuid);

        console.log('Stilling fra rekrutteringsbistand-api:', stilling);
        setStilling(stilling);
    };

    useEffect(() => {
        hentStillingMedUuid(uuidFraUrl);
    }, [uuidFraUrl]);

    return (
        <div className="app typo-normal">
            <header className="app__header">
                <Sidetittel tag="h1" className="blokk-m">
                    Se stilling
                </Sidetittel>
            </header>
            <main className="app__main">
                {stilling.status === Status.Suksess ? (
                    <article>
                        <Systemtittel>{stilling.data.title}</Systemtittel>
                        <div
                            dangerouslySetInnerHTML={{ __html: stilling.data.properties.adtext }}
                        ></div>
                    </article>
                ) : (
                    '...'
                )}
            </main>
        </div>
    );
};

export default App;
