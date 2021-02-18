import React, { FunctionComponent } from 'react';
import { Sidetittel } from 'nav-frontend-typografi';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';

import { hentBedriftensVisningsnavn, hentKommuneOgEllerBy, lagInnerHtml } from './stillingUtils';
import { Privacy, Stilling } from '../Stilling';
import NaturligLinjeskift from './NaturligLinjeskift';
import Stillingsinfo from './Stillingsinfo';
import './Visning.less';
import Lenke from 'nav-frontend-lenker';

interface Props {
    stilling: Stilling;
}

const Visning: FunctionComponent<Props> = ({ stilling }) => {
    const annonsetekst = lagInnerHtml(stilling.properties.adtext);
    const stillingPåArbeidsplassen = `https://arbeidsplassen.nav.no/stillinger/stilling/${stilling.uuid}`;
    const hvemOgHvor = `${hentBedriftensVisningsnavn(stilling)}, ${hentKommuneOgEllerBy(
        stilling.location
    )}`;

    return (
        <>
            <header className="visning__header">
                <div className="visning__header-inner">
                    {hvemOgHvor}
                    <Sidetittel>
                        <NaturligLinjeskift>{stilling.title}</NaturligLinjeskift>
                    </Sidetittel>
                </div>
            </header>

            <div className="visning__container">
                <AlertStripeInfo className="visning__advarsel">
                    {stilling.privacy === Privacy.Arbeidsplassen ? (
                        <>
                            <Lenke href={stillingPåArbeidsplassen}>Denne stillingen</Lenke> kan du
                            også finne på arbeidsplassen.no
                        </>
                    ) : (
                        'Denne stillingen er meldt direkte fra en arbeidsgiver til NAV. Den er bare tilgjengelig via denne lenken.'
                    )}
                </AlertStripeInfo>
                <main className="visning__main">
                    <article
                        className="visning__stillingstekst"
                        dangerouslySetInnerHTML={annonsetekst}
                    />
                    <aside className="visning__stillingsinfo">
                        <Stillingsinfo stilling={stilling} />
                    </aside>
                </main>
            </div>
        </>
    );
};

export default Visning;
