const jsdom = require('jsdom');
const request = require('request');

const { JSDOM } = jsdom;

const QUERY_PARAMS = 'header-withmenu=true&styles=true&scripts=true&footer-withmenu=true';
const URL_PROD = `https://appres.nav.no/common-html/v4/navno?${QUERY_PARAMS}`;
const URL_DEV = `https://appres-q0.nav.no/common-html/v4/navno?${QUERY_PARAMS}`;

const url = process.env.NAIS_CLUSTER_NAME === 'prod-sbs' ? URL_PROD : URL_DEV;

const hentDekoratørFraUrl = behandleRespons => request(url, behandleRespons);

const hentDataFraBody = body => {
    const { document } = new JSDOM(body).window;
    const prop = 'innerHTML';

    return {
        NAV_SCRIPTS: document.getElementById('scripts')[prop],
        NAV_STYLES: document.getElementById('styles')[prop],
        NAV_HEADING: document.getElementById('header-withmenu')[prop],
        NAV_FOOTER: document.getElementById('footer-withmenu')[prop],
        NAV_MENU_RESOURCES: document.getElementById('megamenu-resources')[prop],
    };
};

const hentDekoratør = () =>
    new Promise((resolve, reject) => {
        hentDekoratørFraUrl((error, response, body) => {
            if (!error && response.statusCode >= 200 && response.statusCode < 400) {
                resolve(hentDataFraBody(body));
            } else {
                reject(new Error(error));
            }
        });
    });

module.exports = hentDekoratør;
