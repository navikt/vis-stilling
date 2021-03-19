import mustacheExpress from 'mustache-express';
import path from 'path';
import express from 'express';
import hentDekoratør from './dekoratør';
import cookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import getAccessToken from './accessTokenClient';

const PORT = 3000;
const BASE_PATH = '/arbeid/stilling';
const EKSPONERT_STILLING_URL = `${process.env.REKRUTTERINGSBISTAND_STILLING_API}/rekrutteringsbistand/ekstern/api/v1/stilling`;

const buildPath = path.join(__dirname, './build');
const server = express();

type HTML = string;

const startServer = async (indexHtml: HTML) => {
    server.use(setupProxy(`${BASE_PATH}/api`, EKSPONERT_STILLING_URL));

    server.get(`${BASE_PATH}/internal/isAlive`, (req, res) => res.sendStatus(200));
    server.get(`${BASE_PATH}/internal/isReady`, (req, res) => res.sendStatus(200));

    server.use(BASE_PATH, express.static(buildPath, { index: false }));

    server.get([BASE_PATH, `${BASE_PATH}/:id`], (req, res) => {
        res.send(indexHtml);
    });

    server.listen(PORT, () => {
        console.log('Server kjører på port', PORT);
    });

    try {
        const accessToken = await getAccessToken();
        console.log(
            `Fikk access token med ${Object.keys(accessToken).length} felter. Token har lengde ${
                accessToken.access_token.length
            }`
        );
    } catch (e) {
        console.error('Klarte ikke å hente access token:', e);
    }
};

const setupProxy = (fraPath: string, tilTarget: string) =>
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

const renderAppMedDekoratør = (dekoratør: any): Promise<HTML> =>
    new Promise((resolve, reject) => {
        server.render('index.html', dekoratør, (err, html) => {
            if (err) {
                reject(err);
            } else {
                resolve(html);
            }
        });
    });

const logError = (feil: string) => (error: string) => {
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
