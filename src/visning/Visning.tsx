import React, { FunctionComponent } from 'react';
import { Sidetittel } from 'nav-frontend-typografi';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';

import { hentKommuneOgEllerBy, lagInnerHtml } from './stillingUtils';
import { Stilling } from '../Stilling';
import Stillingsinfo from './Stillingsinfo';
import './Visning.less';

interface Props {
    stilling: Stilling;
}

const Visning: FunctionComponent<Props> = ({ stilling }) => (
    <>
        <header className="visning__header">
            <div className="visning__header-inner">
                {hentKommuneOgEllerBy(stilling.location)}
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
                    dangerouslySetInnerHTML={lagInnerHtml(stilling.properties.adtext)}
                />
                <aside className="visning__stillingsinfo">
                    <Stillingsinfo stilling={stilling} />
                </aside>
            </main>
        </div>
    </>
);

export default Visning;
