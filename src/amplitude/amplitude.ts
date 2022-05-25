import amplitude from 'amplitude-js';

const getApiKey = () => {
    return window.location.hostname === 'www.nav.no'
        ? 'a8243d37808422b4c768d31c88a22ef4'
        : '6ed1f00aabc6ced4fd6fcb7fcdc01b30';
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
