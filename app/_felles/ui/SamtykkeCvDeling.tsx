'use client';

import { BodyLong, Box, Button, ErrorMessage, Heading, Link, VStack } from '@navikt/ds-react';

import { lesSamtykkestatus } from '../types/Samtykkesvar.ts';
import { useEndreSamtykke } from '../samtykke/useEndreSamtykke.ts';
import { useHentSamtykke } from '../samtykke/useHentSamtykke.ts';
import * as eksternTekster from '../../_ekstern/samtykke/tekster.ts';
import * as internTekster from '../../_intern/samtykke/tekster.ts';
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

const Samtykkeboks = ({
    stillingsId,
    innlogget,
    personvernlenke,
    visSpørsmålsboks,
    erVeileder,
}: Props) => {
    const {
        data: samtykke,
        isLoading,
        isValidating,
        error: hentFeil,
        mutate,
    } = useHentSamtykke(stillingsId, innlogget, erVeileder);
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
    } = useEndreSamtykke(stillingsId, erVeileder);
    const tekster = erVeileder ? internTekster : eksternTekster;
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
                    {tekster.headingtekst(status)}
                </Heading>
                <div aria-live="polite">
                    {visSpørsmål ? (
                        <KontaktVeileder />
                    ) : isLoading ? (
                        <BodyLong>Henter status...</BodyLong>
                    ) : hentFeil ? null : (
                        <BodyLong>{tekster.samtykketekst(status)}</BodyLong>
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
                                    : tekster.hentFeiltekst}
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
                                        ? internTekster.ubesvartSpørsmål
                                        : eksternTekster.ubesvartSpørsmål}
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
