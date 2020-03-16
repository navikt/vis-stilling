import React from 'react';
import { Systemtittel } from 'nav-frontend-typografi';
import './App.less';

const App = () => {
    return (
        <div className="app typo-normal">
            <header className="app__header">
                <Systemtittel tag="h1" className="blokk-m">
                    Se stilling
                </Systemtittel>
            </header>
            <main className="app__main">...</main>
        </div>
    );
};

export default App;
