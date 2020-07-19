import amplitude from 'amplitude-js';

const getApiKey = () => {
    return window.location.hostname === 'www.nav.no'
        ? '3a6fe32c3457e77ce81c356bb14ca886'
        : '55477baea93c5227d8c0f6b813653615';
};

const instance = amplitude.getInstance();
instance.init(getApiKey(), '', {
    apiEndpoint: 'amplitude.nav.no/collect',
    saveEvents: false,
    includeUtm: true,
    batchEvents: false,
    includeReferrer: true,
});

export const logEvent = (område: string, hendelse: string, data?: Object): void => {
    instance.logEvent(['#vis-stilling', område, hendelse].join('-'), data);
};