import { StillingVisning } from '@navikt/stilling-react';
import { Theme } from '@navikt/ds-react/Theme';
import { FunctionComponent } from 'react';

import { konverterStilling } from '../_utils/stillingUtils';
import { Stilling } from '../types/Stilling';
import SamtykkeCvDeling from './SamtykkeCvDeling';

interface Props {
    stilling: Stilling;
    innlogget: boolean;
}

const VisStilling: FunctionComponent<Props> = ({ stilling, innlogget }) => {
    const stillingDTO = konverterStilling(stilling);

    // søknadSlot vises som egen boks til høyre på desktop, og rett under
    // sammendraget på mobil.
    return (
        <Theme>
            <StillingVisning
                data={stillingDTO}
                søknadSlot={
                    <SamtykkeCvDeling
                        key={stilling.uuid}
                        stillingsId={stilling.uuid}
                        innlogget={innlogget}
                    />
                }
            />
        </Theme>
    );
};

export default VisStilling;
