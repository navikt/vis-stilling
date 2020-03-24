import React, { FunctionComponent } from 'react';
import { Sidetittel } from 'nav-frontend-typografi';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';

import { hentKommuneOgEllerBy, lagInnerHtml, hentBedriftensVisningsnavn } from './stillingUtils';
import { Stilling } from '../Stilling';
import Stillingsinfo from './Stillingsinfo';
import './Visning.less';

interface Props {
    stilling: Stilling;
}

const Visning: FunctionComponent<Props> = ({ stilling }) => {
    const annonsetekst = lagInnerHtml(stilling.properties.adtext);
    const hvemOgHvor = `${hentBedriftensVisningsnavn(stilling)}, ${hentKommuneOgEllerBy(
        stilling.location
    )}`;

    return (
        <>
            <header className="visning__header">
                <div className="visning__header-inner">
                    {hvemOgHvor}
                    <Sidetittel>{stilling.title}</Sidetittel>
                </div>
            </header>

            <div className="visning__container">
                <AlertStripeInfo className="visning__advarsel">
                    Denne stillingen er meldt direkte fra en arbeidsgiver til NAV. Den er bare
                    tilgjengelig via denne lenken.
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
