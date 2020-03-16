if (process.env.REACT_APP_MOCK) {
    // require('../mock/mock.ts');
}

export enum Status {
    IkkeLastet,
    LasterInn,
    Suksess,
    Feil,
    UkjentFeil,
}

type IkkeLastet = {
    status: Status.IkkeLastet;
};

type LasterInn = {
    status: Status.LasterInn;
};

type Suksess = {
    status: Status.Suksess;
    stilling: any;
};

type Feil = {
    status: Status.Feil;
    statusKode: number;
};

type UkjentFeil = {
    status: Status.UkjentFeil;
};

export type Respons = IkkeLastet | LasterInn | Suksess | Feil | UkjentFeil;
