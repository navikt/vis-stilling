import type { Samtykkestatus } from '../../_felles/types/Samtykkesvar.ts';

export const samtykketekst = (status: Samtykkestatus): string => {
    switch (status) {
        case 'TRUKKET':
            return 'Samtykket til at Nav kan dele CV-en med arbeidsgiveren for denne stillingen, er trukket.';
        case 'SAMTYKKET':
            return 'Brukeren har sagt ja til at Nav kan dele CV-en med arbeidsgiveren for denne stillingen. Du kan trekke samtykket på vegne av brukeren.';
        case 'SVART_NEI':
            return 'Brukeren har sagt nei til at Nav kan dele CV-en med arbeidsgiveren for denne stillingen.';
        case 'UBESVART':
            return 'Brukeren har fått en forespørsel om å dele CV-en med arbeidsgiveren for denne stillingen, men har ikke svart ennå. Du kan svare på vegne av brukeren.';
        case 'UTLØPT':
            return 'Svarfristen for forespørselen har gått ut.';
        case 'INGEN_FORESPØRSEL':
            return 'Brukeren har ikke fått en forespørsel om å dele CV-en med arbeidsgiveren for denne stillingen.';
        case 'AVBRUTT_FORESPØRSEL':
            return 'Forespørselen kan ikke besvares fordi aktiviteten er avbrutt.';
    }
};

export const headingtekst = (_status: Samtykkestatus): string => 'Deling av CV med arbeidsgiver';

export const ubesvartSpørsmål =
    'Vil brukeren at Nav skal dele CV-en med arbeidsgiveren for denne stillingen?';

export const hentFeiltekst = 'Vi kunne ikke hente samtykkestatusen til brukeren. Prøv igjen.';

export const bekreftSamtykkeTekster = {
    JA: {
        knappetekst: 'Svar ja for brukeren',
        tittel: 'Vil du svare ja på vegne av brukeren?',
        beskrivelse:
            'Du svarer ja på vegne av brukeren. Nav kan da dele CV-en med arbeidsgiveren for denne stillingen.',
        bekreftTekst: 'Bekreft ja',
    },
    NEI: {
        knappetekst: 'Svar nei for brukeren',
        tittel: 'Vil du svare nei på vegne av brukeren?',
        beskrivelse:
            'Du svarer nei på vegne av brukeren. Nav kan da ikke dele CV-en med arbeidsgiveren for denne stillingen.',
        bekreftTekst: 'Bekreft nei',
    },
    TREKK: {
        knappetekst: 'Trekk samtykket for brukeren',
        tittel: 'Vil du trekke samtykket på vegne av brukeren?',
        beskrivelse:
            'Du trekker samtykket på vegne av brukeren. Nav kan da ikke lenger dele CV-en med arbeidsgiveren for denne stillingen.',
        bekreftTekst: 'Bekreft tilbaketrekking',
    },
};
