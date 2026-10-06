'use client';

import { BodyLong, Box, Button, ErrorMessage, Heading, Link, VStack } from '@navikt/ds-react';

import { useHentSamtykke } from '../api/deling-av-cv/useHentSamtykke.ts';
import { lesSamtykkestatus, Samtykkestatus } from '../_types/Samtykkesvar.ts';
import { useEndreSamtykke } from '../api/deling-av-cv/useEndreSamtykke.ts';
import BekreftSamtykkeKnapp from './BekreftSamtykkeKnapp.tsx';

interface Props {
    stillingsId: string;
    innlogget: boolean;
    personvernlenke: string;
}

const samtykketekst = (svar: Samtykkestatus | undefined): string => {
    if (!svar) {
        return 'Her kan du gi eller trekke samtykke til at Nav deler CV-en din med arbeidsgiver.';
    }
    if (svar.harTrukketSamtykke) {
        return 'Du har trukket samtykket til at Nav kan dele CV-en din med arbeidsgiveren som har lyst ut denne stillingen.';
    }
    if (svar.harSamtykket) {
        return 'Du har sagt ja til at Nav kan dele CV-en din med arbeidsgiveren som har lyst ut denne stillingen.';
    }
    if (svar.harSvartNei) {
        return 'Du har sagt nei til at Nav kan dele CV-en din med arbeidsgiveren som har lyst ut denne stillingen.';
    }
    if (svar.harUbesvartForespørsel) {
        return (
            'Du har fått en forespørsel fra Nav om å dele CV-en din med arbeidsgiveren som har lyst ut denne stillingen. Hvis du samtykker til at CV-en din kan deles, så ' +
            'kan du når som helst trekke samtykket ditt.'
        );
    }
    return 'Hvis du samtykker, kan Nav dele CV-en din med arbeidsgiveren som har lyst ut denne stillingen.';
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
    const samtykkesvar = lesSamtykkestatus(samtykke);
    const venter = isMutating || isValidating;
    const harAktivForespørsel =
        innlogget && !isLoading && !hentFeil && samtykkesvar.harUbesvartForespørsel;

    const headingTekst = innlogget
        ? 'Vil du dele CV-en din med arbeidsgiver?'
        : 'Har du spørsmål om stillingen';

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
                    {headingTekst}
                </Heading>
                <div aria-live="polite">
                    {!innlogget ? (
                        <BodyLong>Kontakt veilederen din i dialogen i aktivitetsplanen.</BodyLong>
                    ) : isLoading ? (
                        <BodyLong>Henter samtykkestatus...</BodyLong>
                    ) : hentFeil ? null : (
                        <BodyLong>{samtykketekst(samtykkesvar)}</BodyLong>
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
                {innlogget &&
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
                        !samtykkesvar.harTrukketSamtykke &&
                        (samtykkesvar.harSamtykket ? (
                            <BekreftSamtykkeKnapp
                                handling="TREKK"
                                disabled={venter}
                                onBekreft={trekkSamtykke}
                            />
                        ) : (
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
                        ))
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
