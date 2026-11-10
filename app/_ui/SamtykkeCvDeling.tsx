'use client';

import { BodyLong, Box, Button, ErrorMessage, Heading, Link, VStack } from '@navikt/ds-react';

import { lesSamtykkestatus, Samtykkestatus } from '../_types/Samtykkesvar.ts';
import { useEndreSamtykke } from '../api/deling-av-cv/useEndreSamtykke.ts';
import { useHentSamtykke } from '../api/deling-av-cv/useHentSamtykke.ts';
import BekreftSamtykkeKnapp from './BekreftSamtykkeKnapp.tsx';
import { ChatIcon } from '@navikt/aksel-icons';
import { ApiError } from '@navikt/toi-next-frontend';
import { useEffect } from 'react';

interface Props {
    stillingsId: string;
    innlogget: boolean;
    personvernlenke: string;
    visSpørsmålsboks: boolean;
    erVeileder: boolean;
}

const KontaktVeileder = () => (
    <div className="flex items-center gap-3">
        <ChatIcon aria-hidden className="text-2xl shrink-0" />
        <BodyLong>Kontakt veilederen din i dialogen i aktivitetsplanen.</BodyLong>
    </div>
);

const Spørsmålsboks = () => (
    <Box
        as="section"
        aria-label="Spørsmål om stillingen"
        padding="space-16"
        background="accent-soft"
        borderColor="info-subtle"
        borderWidth="1"
        borderRadius="8"
    >
        <VStack gap="space-12">
            <Heading level="2" size="small">
                Har du spørsmål om stillingen?
            </Heading>
            <KontaktVeileder />
        </VStack>
    </Box>
);

const samtykketekst = (status: Samtykkestatus): string => {
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
const veilederSamtykketekst = (status: Samtykkestatus): string => {
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

const headingtekst = (status: Samtykkestatus, erVeileder: boolean): string => {
    if (erVeileder) {
        return 'Deling av CV med arbeidsgiver';
    }
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

const Samtykkeboks = ({ stillingsId, innlogget, personvernlenke, visSpørsmålsboks, erVeileder }: Props) => {
    const {
        data: samtykke,
        isLoading,
        isValidating,
        error: hentFeil,
        mutate,
    } = useHentSamtykke(stillingsId, innlogget);
    useEffect(() => {
        if (!erVeileder) {
            return;
        }

        const oppdaterSamtykke = () => void mutate();
        document.addEventListener('fnr-changed', oppdaterSamtykke);
        return () => document.removeEventListener('fnr-changed', oppdaterSamtykke);
    }, [erVeileder, mutate]);
    const {
        endreSamtykke,
        trekkSamtykke,
        isMutating,
        error: lagreFeil,
    } = useEndreSamtykke(stillingsId);
    const status = lesSamtykkestatus(samtykke);
    const venter = isMutating || isValidating;
    const harAktivForespørsel =
        innlogget &&
        !isLoading &&
        !hentFeil &&
        status !== 'INGEN_FORESPØRSEL' &&
        status !== 'AVBRUTT_FORESPØRSEL';
    const visSpørsmål =
        !erVeileder && (!innlogget || (!isLoading && !hentFeil && status === 'INGEN_FORESPØRSEL'));
    const ingenAktivBruker = hentFeil instanceof ApiError && hentFeil.status === 409;

    if (!visSpørsmålsboks && (visSpørsmål || isLoading)) {
        return null;
    }

    return (
        <Box
            as="section"
            aria-label="Samtykke til deling av CV"
            padding="space-16"
            background="accent-soft"
            borderColor="info-subtle"
            borderWidth="1"
            borderRadius="8"
        >
            <VStack gap="space-12">
                <Heading level="2" size="small">
                    {headingtekst(status, erVeileder)}
                </Heading>
                <div aria-live="polite">
                    {visSpørsmål ? (
                        <KontaktVeileder />
                    ) : isLoading ? (
                        <BodyLong>Henter status...</BodyLong>
                    ) : hentFeil ? null : (
                        <BodyLong>
                            {erVeileder ? veilederSamtykketekst(status) : samtykketekst(status)}
                        </BodyLong>
                    )}
                    {innlogget && isMutating && <BodyLong>Lagrer endringen...</BodyLong>}
                </div>
                {harAktivForespørsel && (
                    <BodyLong>
                        <Link href={personvernlenke}>
                            Her kan du lese mer om å dele CV-en med arbeidsgiver
                        </Link>
                    </BodyLong>
                )}
                {!visSpørsmål &&
                    (hentFeil ? (
                        <>
                            <ErrorMessage showIcon role="alert">
                                {ingenAktivBruker
                                    ? 'Velg en bruker i Modia for å se samtykkestatusen.'
                                    : erVeileder
                                      ? 'Vi kunne ikke hente samtykkestatusen til brukeren. Prøv igjen.'
                                      : 'Vi kunne ikke hente samtykkestatusen din. Prøv igjen.'}
                            </ErrorMessage>
                            {!ingenAktivBruker && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={venter}
                                    onClick={() => void mutate()}
                                >
                                    Prøv igjen
                                </Button>
                            )}
                        </>
                    ) : (
                        !isLoading &&
                        (status === 'SAMTYKKET' ? (
                            <BekreftSamtykkeKnapp
                                handling="TREKK"
                                disabled={venter}
                                onBekreft={trekkSamtykke}
                                erVeileder={erVeileder}
                            />
                        ) : status === 'UBESVART' ? (
                            <>
                                <BodyLong>
                                    {erVeileder
                                        ? 'Vil brukeren at Nav skal dele CV-en med arbeidsgiveren for denne stillingen?'
                                        : 'Ønsker du at Nav kan dele CV-en din med denne arbeidsgiveren for denne stillingen?'}
                                </BodyLong>
                                <BekreftSamtykkeKnapp
                                    handling="JA"
                                    disabled={venter}
                                    onBekreft={() => endreSamtykke('JA')}
                                    erVeileder={erVeileder}
                                />
                                <BekreftSamtykkeKnapp
                                    handling="NEI"
                                    disabled={venter}
                                    onBekreft={() => endreSamtykke('NEI')}
                                    erVeileder={erVeileder}
                                />
                            </>
                        ) : null)
                    ))}
                {innlogget && lagreFeil && (
                    <ErrorMessage showIcon role="alert">
                        Vi kunne ikke lagre endringen. Prøv igjen.
                    </ErrorMessage>
                )}
            </VStack>
        </Box>
    );
};

const SamtykkeCvDeling = ({
    stillingsId,
    innlogget,
    personvernlenke,
    visSamtykke,
    visSpørsmålsboks,
    erVeileder,
}: Props & { visSamtykke: boolean }) => {
    if (!visSamtykke) {
        return visSpørsmålsboks ? <Spørsmålsboks /> : null;
    }

    return (
        <Samtykkeboks
            stillingsId={stillingsId}
            innlogget={innlogget}
            personvernlenke={personvernlenke}
            visSpørsmålsboks={visSpørsmålsboks}
            erVeileder={erVeileder}
        />
    );
};

export default SamtykkeCvDeling;
