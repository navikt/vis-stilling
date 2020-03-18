const path = require('path');
const express = require('express');
const hentDekoratør = require('./dekoratør');
const mustacheExpress = require('mustache-express');
const cookieParser = require('cookie-parser');
// const sonekryssing = require('./sonekryssing.js');

const PORT = 3000;
const BASE_PATH = '/arbeid/stilling';

const buildPath = path.join(__dirname, '../build');
const server = express();

const startServer = html => {
    server.use(BASE_PATH, express.static(buildPath, { index: false }));

    server.get(BASE_PATH, (req, res) => {
        res.send(html);
    });

    // TODO: Legg til sonekryssing av uuid-endepunkt

    server.get(`${BASE_PATH}/internal/isAlive`, (req, res) => res.sendStatus(200));
    server.get(`${BASE_PATH}/internal/isReady`, (req, res) => res.sendStatus(200));

    server.listen(PORT, () => {
        console.log('Server kjører på port', PORT);
    });
};

const renderAppMedDekoratør = dekoratør =>
    new Promise((resolve, reject) => {
        server.render('index.html', dekoratør, (err, html) => {
            if (err) {
                reject(err);
            } else {
                resolve(html);
            }
        });
    });

const logError = feil => error => {
    console.error('> ' + feil);
    console.error('> ' + error);

    process.exit(1);
};

const initialiserServer = () => {
    console.log('Initialiserer server ...');

    server.engine('html', mustacheExpress());
    server.set('view engine', 'mustache');
    server.set('views', buildPath);
    server.use(cookieParser());

    hentDekoratør()
        .catch(logError('Kunne ikke hente dekoratør!'))
        .then(renderAppMedDekoratør, logError('Kunne ikke injisere dekoratør!'))
        .then(startServer, logError('Kunne ikke rendre app!'));
};

initialiserServer();
