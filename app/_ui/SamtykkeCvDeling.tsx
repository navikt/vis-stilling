'use client';

import { BodyLong, Box, Button, ErrorMessage, Heading, ReadMore, VStack } from '@navikt/ds-react';

import { useHentSamtykke } from '../api/deling-av-cv/useHentSamtykke.ts';
import { lesSamtykkestatus, Samtykkestatus } from '../_types/Samtykkesvar.ts';
import { useEndreSamtykke } from '../api/deling-av-cv/useEndreSamtykke.ts';

interface Props {
    stillingsId: string;
    innlogget: boolean;
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
        return 'Du har fått en forespørsel fra Nav om å dele CV-en din med arbeidsgiveren som har lyst ut denne stillingen.';
    }
    return 'Hvis du samtykker, kan Nav dele CV-en din med arbeidsgiveren som har lyst ut denne stillingen.';
};

const Samtykkeboks = ({ stillingsId, innlogget }: Props) => {
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
                    Vil du dele CV-en din med arbeidsgiver?
                </Heading>
                <div aria-live="polite">
                    {!innlogget ? (
                        <BodyLong>
                            Har du mottatt en forespørsel om å dele CV-en din med arbeidsgiveren for
                            denne stillingen? Logg inn for å svare.
                        </BodyLong>
                    ) : isLoading ? (
                        <BodyLong>Henter samtykkestatus...</BodyLong>
                    ) : hentFeil ? null : (
                        <BodyLong>{samtykketekst(samtykkesvar)}</BodyLong>
                    )}
                    {innlogget && isMutating && <BodyLong>Lagrer endringen...</BodyLong>}
                </div>
                <ReadMore header="Hva innebærer det å dele CV-en?">
                    <BodyLong>
                        Dette er en midlertidig tekst. Her skal det stå hvilke opplysninger som
                        deles, hvem som får se dem, hvor lenge de lagres, og hvordan du kan trekke
                        samtykket ditt igjen.
                    </BodyLong>
                </ReadMore>
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
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={venter}
                                onClick={() => void trekkSamtykke()}
                            >
                                Trekk samtykke
                            </Button>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="primary"
                                    disabled={venter}
                                    onClick={() => void endreSamtykke('JA')}
                                >
                                    Ja, jeg samtykker til at CV-en min kan deles med arbeidsgiver
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={venter}
                                    onClick={() => void endreSamtykke('NEI')}
                                >
                                    Nei, jeg samtykker ikke til at Nav kan dele CV-en min med
                                    arbeidsgiver
                                </Button>
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

const SamtykkeCvDeling = ({ stillingsId, innlogget }: Props) => {
    return <Samtykkeboks stillingsId={stillingsId} innlogget={innlogget} />;
};

export default SamtykkeCvDeling;
