if (process.env.REACT_APP_MOCK) {
    require('../mock/mock-api.ts');
}

const API = '/arbeid/stilling/api';

export enum Status {
    IkkeLastet = 'IkkeLastet',
    LasterInn = 'LasterInn',
    Suksess = 'Suksess',
    Feil = 'Feil',
    UkjentFeil = 'UkjentFeil',
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

export const hentStilling = async (uuid: string): Promise<Respons> => {
    try {
        const respons = await fetch(`${API}/${uuid}`, {
            method: 'GET',
        });

        if (respons.ok) {
            const stilling = await respons.json();

            return {
                status: Status.Suksess,
                stilling: stilling.default,
            };
        }

        return {
            status: Status.Feil,
            statusKode: respons.status,
        };
    } catch (error) {
        return {
            status: Status.UkjentFeil,
        };
    }
};
