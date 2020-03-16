const erProduksjon = window.location.href.includes('www.nav.no');

type Lenker = {
    dittNav: string;
    personopplysninger: string;
    kontaktVeileder: string;
};

const prod: Lenker = {
    dittNav: 'https://www.nav.no/no/ditt-nav',
    personopplysninger: 'https://www.nav.no/person/personopplysninger',
    kontaktVeileder: 'https://aktivitetsplan.nav.no/dialog',
};

const dev: Lenker = {
    dittNav: 'https://www-q0.nav.no/no/ditt-nav',
    personopplysninger: 'https://www-q0.nav.no/person/personopplysninger',
    kontaktVeileder: 'https://aktivitetsplan-q.nav.no/dialog',
};

const lenker = erProduksjon ? prod : dev;
export default lenker;
