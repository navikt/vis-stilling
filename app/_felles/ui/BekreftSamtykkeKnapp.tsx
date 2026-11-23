'use client';

import { Button, Dialog } from '@navikt/ds-react';
import { useId, useRef } from 'react';
import type { EndreSamtykkeRespons } from '../samtykke/useEndreSamtykke.ts';
import { bekreftSamtykkeTekster as eksternBekreftTekster } from '../../_ekstern/samtykke/tekster.ts';
import { bekreftSamtykkeTekster as internBekreftTekster } from '../../_intern/samtykke/tekster.ts';

interface Props {
    handling: keyof typeof eksternBekreftTekster;
    disabled: boolean;
    onBekreft: () => Promise<EndreSamtykkeRespons>;
    erVeileder: boolean;
}

const BekreftSamtykkeKnapp = ({ handling, disabled, onBekreft, erVeileder }: Props) => {
    const avbrytRef = useRef<HTMLButtonElement>(null);
    const beskrivelseId = useId();
    const tekster = erVeileder ? internBekreftTekster : eksternBekreftTekster;
    const tekst = tekster[handling];

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
