type Location = {
    address?: string;
    postalCode?: string;
    county?: string;
    municipal?: string;
    municipalCode?: string;
    city?: string;
    country?: string;
};

enum Workhour {
    Dagtid = 'Dagtid',
    Kveld = 'Kveld',
    Natt = 'Natt',
}

enum Workday {
    Ukedager = 'Ukedager',
    Lørdag = 'Lørdag',
    Søndag = 'Søndag',
}

enum Sector {
    Privat = 'Privat',
    Offentlig = 'Offentlig',
    IkkeOppgitt = 'Ikke oppgitt',
}

enum Extent {
    Heltid = 'Heltid',
    Deltid = 'Deltid',
}

type Due = Date | 'Snarest';

type Properties = {
    // Praktiske opplysninger
    engagementtype: string;
    jobarrangement?: string;
    extent: Extent;
    workday: Workday[];
    workhours: Workhour[];
    sector: Sector;
    positioncount: string;
    applicationdue: Due;
    starttime: string;

    // Hvordan sende søknad?
    applicationurl?: string;
    applicationemail?: string;

    // Om bedriften
    employerdescription?: string;
    employerhomepage?: string;

    // Om stillingen
    jobtitle?: string;
    adtext: string;
};

type Contact = {
    name?: string;
    email?: string;
    phone?: string;
    title?: string;
};

type Employer = {
    publicName: string;
    orgnr: string;
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
    businessName?: string;

    // Kontaktinformasjon
    contactList?: Contact[];

    // Om annonsen
    id: number;
    source: string;
    status: string;
};
