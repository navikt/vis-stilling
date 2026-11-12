import type { Samtykkestatus } from '../../_felles/types/Samtykkesvar.ts';

export const samtykketekst = (status: Samtykkestatus): string => {
    switch (status) {
        case 'TRUKKET':
            return 'Du har trukket samtykket til at Nav kan dele CV-en din med arbeidsgiveren som har lyst ut denne stillingen.';
        case 'SAMTYKKET':
            return 'Du har sagt ja til at Nav kan dele CV-en din med arbeidsgiveren som har lyst ut denne stillingen. Du kan når som helst trekke samtykket ditt og stoppe delingen av CV-en din med arbeidsgiveren.';
        case 'SVART_NEI':
            return 'Du har sagt nei til at Nav kan dele CV-en din med arbeidsgiveren som har lyst ut denne stillingen. Ønsker du at Nav skal dele CV-en din med arbeidsgiveren, kan du kontakte veilederen din i dialogen i aktivitetsplanen.';
        case 'UBESVART':
            return (
                'Du har fått en forespørsel fra Nav om å dele CV-en din med arbeidsgiveren som har lyst ut denne stillingen. Hvis du samtykker til at CV-en din kan deles, så ' +
                'kan du når som helst trekke samtykket ditt.'
            );
        case 'UTLØPT':
            return 'Svarfristen for forespørselen har gått ut. Hvis du ønsker at Nav skal dele CV-en din med arbeidsgiveren, kan du kontakte veilederen din i dialogen i aktivitetsplanen.';
        case 'INGEN_FORESPØRSEL':
            return 'Hvis du samtykker, kan Nav dele CV-en din med arbeidsgiveren som har lyst ut denne stillingen.';
        case 'AVBRUTT_FORESPØRSEL':
            return 'Du kan ikke svare på spørsmålet fordi aktiviteten er avbrutt.';
    }
};

export const headingtekst = (status: Samtykkestatus): string => {
    switch (status) {
        case 'TRUKKET':
        case 'SAMTYKKET':
        case 'SVART_NEI':
        case 'UTLØPT':
            return 'Dele CV med arbeidsgiver';
        case 'AVBRUTT_FORESPØRSEL':
        case 'UBESVART':
            return 'Vil du dele CV-en din med arbeidsgiveren?';
        case 'INGEN_FORESPØRSEL':
            return 'Har du spørsmål om stillingen?';
    }
};

export const ubesvartSpørsmål =
    'Ønsker du at Nav kan dele CV-en din med denne arbeidsgiveren for denne stillingen?';

export const hentFeiltekst = 'Vi kunne ikke hente samtykkestatusen din. Prøv igjen.';

export const bekreftSamtykkeTekster = {
    JA: {
        knappetekst: 'Gi samtykke',
        tittel: 'Vil du gi samtykke?',
        beskrivelse:
            'Du gir Nav samtykke til å dele CV-en din med arbeidsgiveren for denne stillingen.',
        bekreftTekst: 'Bekreft samtykke',
    },
    NEI: {
        knappetekst: 'Avvis samtykke',
        tittel: 'Vil du svare nei?',
        beskrivelse:
            'Du svarer nei til at Nav kan dele CV-en din med arbeidsgiveren for denne stillingen.',
        bekreftTekst: 'Bekreft nei',
    },
    TREKK: {
        knappetekst: 'Trekk samtykke',
        tittel: 'Vil du trekke samtykket?',
        beskrivelse:
            'Du trekker samtykket til at Nav kan dele CV-en din med arbeidsgiveren for denne stillingen.',
        bekreftTekst: 'Bekreft tilbaketrekking',
    },
};
