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
            const stilling = await api.hentStilling('e4b3531a-7728-4150-8e1d-f948497f8482');
            console.log('Hentet stilling:', stilling);
            setStilling(stilling);
        };

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
