export type Location = {
    address?: string;
    postalCode?: string;
    county?: string;
    municipal?: string;
    municipalCode?: string;
    city?: string;
    country?: string;
};

export enum Workhour {
    Dagtid = 'Dagtid',
    Kveld = 'Kveld',
    Natt = 'Natt',
}

export enum Workday {
    Ukedager = 'Ukedager',
    Lørdag = 'Lørdag',
    Søndag = 'Søndag',
}

export enum Sector {
    Privat = 'Privat',
    Offentlig = 'Offentlig',
    IkkeOppgitt = 'Ikke oppgitt',
}

export enum Extent {
    Heltid = 'Heltid',
    Deltid = 'Deltid',
}

export type Due = Date | 'Snarest';

export type StartTime = Date | 'Etter avtale';

export type Properties = {
    // Praktiske opplysninger
    engagementtype: string;
    jobarrangement?: string;
    extent: Extent;
    workday: Workday[];
    workhours: Workhour[];
    sector: Sector;
    positioncount: string;
    applicationdue: Due;
    starttime?: StartTime;

    // Hvordan sende søknad?
    applicationurl?: string;
    applicationemail?: string;

    // Om bedriften
    employerdescription?: string;
    employerhomepage?: string;
    twitteraddress?: string;
    facebookpage?: string;
    linkedinpage?: string;

    // Om stillingen
    jobtitle?: string;
    adtext: string;
};

export type Contact = {
    name?: string;
    email?: string;
    phone?: string;
    title?: string;
};

export enum Annonsestatus {
    Aktiv = 'ACTIVE',
    Inaktiv = 'INACTIVE',
    Stoppet = 'STOPPED',
}

export type Employer = {
    name: string;
    publicName: string;
    location: Location;
};

export type Stilling = {
    // Metainformasjon
    uuid: string;
    updated: Date;

    // Stillingsinformasjon
    title: string;
    properties: Properties;

    // Arbeidssted
    location: Location;

    // Fra Altinn
    employer: Employer;
    businessName: string | null;

    // Kontaktinformasjon
    contactList: Contact[];

    // Om annonsen
    id: number;
    status: Annonsestatus;
    source: string;
    deactivatedByExpiry: boolean;
};
