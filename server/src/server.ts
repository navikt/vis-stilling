import path from 'path';
import express, { RequestHandler } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import getAccessToken from './accessTokenClient';
import { injectDecoratorServerSide } from '@navikt/nav-dekoratoren-moduler/ssr';

const PORT = 3000;
const BASE_PATH = '/arbeid/stilling';
const EKSPONERT_STILLING_URL = `${process.env.REKRUTTERINGSBISTAND_STILLING_API}/rekrutteringsbistand/ekstern/api/v1/stilling`;

const buildPath = path.join(__dirname, '../../build');
const server = express();

type HTML = string;

const startServer = async (indexHtml: HTML) => {
    server.use(
        `${BASE_PATH}/api`,
        brukAccessToken,
        setupProxy(`${BASE_PATH}/api`, EKSPONERT_STILLING_URL)
    );

    server.get(`${BASE_PATH}/internal/isAlive`, (req, res) => res.sendStatus(200));
    server.get(`${BASE_PATH}/internal/isReady`, (req, res) => res.sendStatus(200));

    server.use(BASE_PATH, express.static(buildPath, { index: false }));

    server.get([BASE_PATH, `${BASE_PATH}/:id`], (req, res) => {
        res.send(indexHtml);
    });

    server.listen(PORT, () => {
        console.log('Server kjører på port', PORT);
    });
};

const brukAccessToken: RequestHandler = async (req, res, next) => {
    const accessToken = await getAccessToken();

    req.headers = {
        ...req.headers,
        Authorization: `Bearer ${accessToken.access_token}`,
    };

    next();
};

const setupProxy = (fraPath: string, tilTarget: string): RequestHandler =>
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

const renderAppMedDekoratør = (): Promise<HTML> => {
    const env = process.env.NAIS_CLUSTER_NAME === 'prod-gcp' ? 'prod' : 'dev';
    return injectDecoratorServerSide({ env, filePath: `${buildPath}/index.html` });
};

const logError = (feil: string) => (error: string) => {
    console.error('> ' + feil);
    console.error('> ' + error);

    process.exit(1);
};

console.log('\nInitialiserer server ...');
renderAppMedDekoratør().then(startServer, logError('Kunne ikke rendre app!'));
