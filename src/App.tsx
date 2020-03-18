import React, { useEffect, useState } from 'react';
import { Systemtittel } from 'nav-frontend-typografi';
import './App.less';
import * as api from './api/api';

const App = () => {
    const [stilling, setStilling] = useState<api.Respons>({
        status: api.Status.IkkeLastet,
    });

    useEffect(() => {
        const hentStilling = async () => {
            const stilling = await api.hentStilling('d328d737-1965-487b-a1bb-9f3872e1c1e7');
            console.log('Hentet stilling:', stilling);
            setStilling(stilling);
        };

        console.log('Prøver å hente ...');
        hentStilling();
    }, []);

    return (
        <div className="app typo-normal">
            <header className="app__header">
                <Systemtittel tag="h1" className="blokk-m">
                    Se stilling
                </Systemtittel>
            </header>
            <main className="app__main">
                {stilling.status === api.Status.Suksess ? stilling.stilling.title : '...'}
            </main>
        </div>
    );
};

export default App;
