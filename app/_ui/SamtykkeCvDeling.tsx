'use client';

import { BodyLong, Box, Button, Heading, ReadMore, VStack } from '@navikt/ds-react';

import { useHentSamtykke } from '../api/deling-av-cv/useHentSamtykke.ts';
import { lesSamtykkestatus, Samtykkestatus } from '../_types/Samtykkesvar.ts';
import { useEndreSamtykke } from '../api/deling-av-cv/useEndreSamtykke.ts';

interface Props {
    stillingsId: string;
}

const samtykketekst = (svar: Samtykkestatus | undefined): string => {
    if (!svar) {
        return 'Her kan du gi eller trekke samtykke til at Nav deler CV-en din med arbeidsgiver.';
    }
    // if (!svar.innlogget) {
    //     return 'Logg inn med knappen øverst på siden for å gi eller trekke samtykke til at Nav deler CV-en din med arbeidsgiver.';
    // }
    if (svar.harSamtykket) {
        return 'Du har sagt ja til at Nav kan dele CV-en din med arbeidsgiveren som har lyst ut denne stillingen.';
    }
    if (svar.harUbesvartForespørsel) {
        return 'Du har fått en forespørsel fra Nav om å dele CV-en din med arbeidsgiveren som har lyst ut denne stillingen.';
    }
    return 'Hvis du samtykker, kan Nav dele CV-en din med arbeidsgiveren som har lyst ut denne stillingen.';
};

const Samtykkeboks = ({ stillingsId }: Props) => {
    const samtykke = useHentSamtykke(stillingsId).data;
    const samtykkesvar = lesSamtykkestatus(samtykke);

    const samtykket = samtykke?.svar?.harSvartJa;

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
                    <BodyLong>{samtykketekst(samtykkesvar)}</BodyLong>
                </div>
                <ReadMore header="Hva innebærer det å dele CV-en?">
                    <BodyLong>
                        Dette er en midlertidig tekst. Her skal det stå hvilke opplysninger som
                        deles, hvem som får se dem, hvor lenge de lagres, og hvordan du kan trekke
                        samtykket ditt igjen.
                    </BodyLong>
                </ReadMore>
                {/*Ikke last inn knappen før samtykke er hentet ferdig*/}
                {/*{svar?.innlogget && (*/}
                <Button type="button" variant={samtykket ? 'secondary' : 'primary'} onClick={async () => {
                    await useEndreSamtykke(samtykket)
                }}>
                    {samtykket ? 'Trekk samtykke' : 'Gi samtykke'}
                </Button>
            </VStack>
        </Box>
    );
};

const SamtykkeCvDeling = ({ stillingsId }: Props) => {
    return <Samtykkeboks stillingsId={stillingsId} />;
};

export default SamtykkeCvDeling;
