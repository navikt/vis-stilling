import { StillingVisning } from '@navikt/stilling-react';
import { Theme } from '@navikt/ds-react/Theme';
import { FunctionComponent } from 'react';

import { konverterStilling } from '../_utils/stillingUtils';
import { Stilling } from '../types/Stilling';
import SamtykkeCvDeling from './SamtykkeCvDeling';
import { Link } from '@navikt/ds-react';
import { InfoCard, InfoCardMessage } from '@navikt/ds-react/InfoCard';
import { InformationSquareIcon } from '@navikt/aksel-icons';
import { ikkeErProd } from '../_utils/util.ts';

interface Props {
    stilling: Stilling;
    innlogget: boolean;
    personvernlenke: string;
    visSamtykke: boolean;
}

const lagArbeidsplassenLenke = (uuid: string) => {
    if (ikkeErProd()) {
        return `https://arbeidsplassen.intern.dev.nav.no/stillinger/stilling/${uuid}`;
    } else {
        return `https://arbeidsplassen.nav.no/stillinger/stilling/${uuid}`;
    }
};

const VisStilling: FunctionComponent<Props> = ({
    stilling,
    innlogget,
    personvernlenke,
    visSamtykke,
}) => {
    const stillingDTO = konverterStilling(stilling);
    const stillingPåArbeidsplassen = lagArbeidsplassenLenke(stilling.uuid);
    const erDirektemeldt = stilling.source === 'DIR';

    // søknadSlot vises som egen boks til høyre på desktop, og rett under
    // sammendraget på mobil.
    return (
        <Theme>
            <main id="maincontent" tabIndex={-1} className="focus:outline-none">
                {!erDirektemeldt && (
                    <InfoCard data-color="info" className="rounded-none ">
                        <InfoCardMessage
                            icon={<InformationSquareIcon aria-hidden />}
                            className=" rounded-none text-center justify-center"
                        >
                            <span>
                                Denne stillingen kan du også finne på{' '}
                                <Link data-color="neutral" href={stillingPåArbeidsplassen}>
                                    arbeidsplassen.no
                                </Link>
                            </span>
                        </InfoCardMessage>
                    </InfoCard>
                )}
                <StillingVisning
                    data={stillingDTO}
                    søknadSlot={
                        // Uten søknadSlot får innholdet full bredde i stedet for en tom sidekolonne.
                        visSamtykke || erDirektemeldt ? (
                            <SamtykkeCvDeling
                                key={stilling.uuid}
                                stillingsId={stilling.uuid}
                                innlogget={innlogget}
                                personvernlenke={personvernlenke}
                                visSamtykke={visSamtykke}
                                visSpørsmålsboks={erDirektemeldt}
                            />
                        ) : undefined
                    }
                />
            </main>
        </Theme>
    );
};

export default VisStilling;
