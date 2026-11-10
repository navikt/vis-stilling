export const logEvent = (område: string, hendelse: string, data?: Object): void => {
    //TODO Bytt ut med UMAMI
    console.log(['#vis-stilling', område, hendelse].join('-'), data);
};
