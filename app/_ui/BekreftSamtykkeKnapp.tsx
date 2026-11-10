'use client';

import { Button, Dialog } from '@navikt/ds-react';
import { useId, useRef } from 'react';
import type { EndreSamtykkeRespons } from '../api/deling-av-cv/useEndreSamtykke.ts';

const handlinger = {
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

const veilederhandlinger = {
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

interface Props {
    handling: keyof typeof handlinger;
    disabled: boolean;
    onBekreft: () => Promise<EndreSamtykkeRespons>;
    erVeileder: boolean;
}

const BekreftSamtykkeKnapp = ({ handling, disabled, onBekreft, erVeileder }: Props) => {
    const avbrytRef = useRef<HTMLButtonElement>(null);
    const beskrivelseId = useId();
    const tekst = erVeileder ? veilederhandlinger[handling] : handlinger[handling];

    return (
        <Dialog>
            <Dialog.Trigger>
                <Button
                    type="button"
                    variant={handling === 'JA' ? 'primary' : 'secondary'}
                    disabled={disabled}
                >
                    {tekst.knappetekst}
                </Button>
            </Dialog.Trigger>
            <Dialog.Popup
                role="alertdialog"
                aria-describedby={beskrivelseId}
                width="small"
                closeOnOutsideClick={false}
                initialFocusTo={avbrytRef}
            >
                <Dialog.Header>
                    <Dialog.Title>{tekst.tittel}</Dialog.Title>
                    <Dialog.Description id={beskrivelseId}>{tekst.beskrivelse}</Dialog.Description>
                </Dialog.Header>
                <Dialog.Footer>
                    <Dialog.CloseTrigger>
                        <Button type="button" variant="secondary" ref={avbrytRef}>
                            Avbryt
                        </Button>
                    </Dialog.CloseTrigger>
                    <Dialog.CloseTrigger>
                        <Button type="button" disabled={disabled} onClick={() => void onBekreft()}>
                            {tekst.bekreftTekst}
                        </Button>
                    </Dialog.CloseTrigger>
                </Dialog.Footer>
            </Dialog.Popup>
        </Dialog>
    );
};

export default BekreftSamtykkeKnapp;
