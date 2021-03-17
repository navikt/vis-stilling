const path = require('path');
const express = require('express');
const hentDekoratør = require('./dekoratør');
const mustacheExpress = require('mustache-express');
const cookieParser = require('cookie-parser');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { getAccessToken } = require('./accessTokenClient');

const PORT = 3000;
const BASE_PATH = '/arbeid/stilling';
const EKSPONERT_STILLING_URL = `${process.env.REKRUTTERINGSBISTAND_STILLING_API}/rekrutteringsbistand/ekstern/api/v1/stilling`;

const buildPath = path.join(__dirname, '../build');
const server = express();

const startServer = async html => {
    server.use(setupProxy(`${BASE_PATH}/api`, EKSPONERT_STILLING_URL));

    server.get(`${BASE_PATH}/internal/isAlive`, (req, res) => res.sendStatus(200));
    server.get(`${BASE_PATH}/internal/isReady`, (req, res) => res.sendStatus(200));

    server.use(BASE_PATH, express.static(buildPath, { index: false }));

    server.get([BASE_PATH, `${BASE_PATH}/:id`], (req, res) => {
        res.send(html);
    });

    server.listen(PORT, () => {
        console.log('Server kjører på port', PORT);
    });

    const accessToken = await getAccessToken();
    console.log(
        `Fikk access token med ${Object.keys(accessToken).length} felter. Token har lengde ${
            accessToken?.access_token?.length
        }`
    );
};

const setupProxy = (fraPath, tilTarget) =>
    createProxyMiddleware(fraPath, {
        target: tilTarget,
        changeOrigin: true,
        secure: true,
        pathRewrite: path => {
            const nyPath = path.replace(fraPath, '');
            console.log(`Proxy fra '${path}' til '${tilTarget + nyPath}'`);
            return nyPath;
        },
    });

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
    console.log('\nInitialiserer server ...');

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
