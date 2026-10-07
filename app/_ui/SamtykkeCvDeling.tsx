'use client';

import { BodyLong, Box, Button, ErrorMessage, Heading, Link, VStack } from '@navikt/ds-react';

import { lesSamtykkestatus, Samtykkestatus } from '../_types/Samtykkesvar.ts';
import { useEndreSamtykke } from '../api/deling-av-cv/useEndreSamtykke.ts';
import { useHentSamtykke } from '../api/deling-av-cv/useHentSamtykke.ts';
import BekreftSamtykkeKnapp from './BekreftSamtykkeKnapp.tsx';

interface Props {
    stillingsId: string;
    innlogget: boolean;
    personvernlenke: string;
}

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
    }
};

const headingtekst = (status: Samtykkestatus): string => {
    switch (status) {
        case 'TRUKKET':
        case 'SAMTYKKET':
        case 'SVART_NEI':
        case 'UTLØPT':
            return 'Dele CV med arbeidsgiver';
        case 'UBESVART':
            return 'Vil du dele CV-en din med arbeidsgiveren?';
        case 'INGEN_FORESPØRSEL':
            return 'Har du spørsmål om stillingen?';
    }
};

const Samtykkeboks = ({ stillingsId, innlogget, personvernlenke }: Props) => {
    const {
        data: samtykke,
        isLoading,
        isValidating,
        error: hentFeil,
        mutate,
    } = useHentSamtykke(stillingsId, innlogget);
    const {
        endreSamtykke,
        trekkSamtykke,
        isMutating,
        error: lagreFeil,
    } = useEndreSamtykke(stillingsId);
    const status = lesSamtykkestatus(samtykke);
    const venter = isMutating || isValidating;
    const harAktivForespørsel = innlogget && !isLoading && !hentFeil && status !== 'INGEN_FORESPØRSEL';
    const visSpørsmål = !innlogget || (!isLoading && !hentFeil && status === 'INGEN_FORESPØRSEL');

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
            <VStack gap="space-16">
                <Heading level="2" size="small">
                    {headingtekst(status)}
                </Heading>
                <div aria-live="polite">
                    {visSpørsmål ? (
                        <BodyLong>Kontakt veilederen din i dialogen i aktivitetsplanen.</BodyLong>
                    ) : isLoading ? (
                        <BodyLong>Henter status...</BodyLong>
                    ) : hentFeil ? null : (
                        <BodyLong>{samtykketekst(status)}</BodyLong>
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
                                Vi kunne ikke hente samtykkestatusen din. Prøv igjen.
                            </ErrorMessage>
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={venter}
                                onClick={() => void mutate()}
                            >
                                Prøv igjen
                            </Button>
                        </>
                    ) : (
                        !isLoading &&
                        (status === 'SAMTYKKET' ? (
                            <BekreftSamtykkeKnapp
                                handling="TREKK"
                                disabled={venter}
                                onBekreft={trekkSamtykke}
                            />
                        ) : status === 'UBESVART' ? (
                            <>
                                <BodyLong>
                                    Ønsker du at Nav kan dele CV-en din med denne arbeidsgiveren for
                                    denne stillingen?
                                </BodyLong>
                                <BekreftSamtykkeKnapp
                                    handling="JA"
                                    disabled={venter}
                                    onBekreft={() => endreSamtykke('JA')}
                                />
                                <BekreftSamtykkeKnapp
                                    handling="NEI"
                                    disabled={venter}
                                    onBekreft={() => endreSamtykke('NEI')}
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

const SamtykkeCvDeling = ({ stillingsId, innlogget, personvernlenke }: Props) => {
    return (
        <Samtykkeboks
            stillingsId={stillingsId}
            innlogget={innlogget}
            personvernlenke={personvernlenke}
        />
    );
};

export default SamtykkeCvDeling;
