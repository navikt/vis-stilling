const proxy = require('http-proxy-middleware');

const envProperties = {
    API_GATEWAY: process.env.APIGW_URL || 'http://localhost:8080',
    APIGW_HEADER: process.env.APIGW_HEADER,
};

const proxyConfig = {
    changeOrigin: true,
    target: envProperties.API_GATEWAY,
    pathRewrite: {
        '^/arbeid/stilling/api': '/rekrutteringsbistand/api/v1/stilling',
    },
    secure: true,
    xfwd: true,
};

if (envProperties.APIGW_HEADER) {
    proxyConfig.headers = {
        'x-nav-apiKey': envProperties.APIGW_HEADER,
    };
}

module.exports = proxy(proxyConfig);
