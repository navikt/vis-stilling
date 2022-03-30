import React, { FunctionComponent } from 'react';
import { Alert, Heading, Link } from '@navikt/ds-react';

import { hentKommuneOgEllerBy, lagInnerHtml, hentBedriftensVisningsnavn } from './stillingUtils';
import { Stilling } from '../Stilling';
import NaturligLinjeskift from './NaturligLinjeskift';
import Stillingsinfo from './Stillingsinfo';
import './Visning.less';

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
                    <Heading size="xlarge">
                        <NaturligLinjeskift>{stilling.title}</NaturligLinjeskift>
                    </Heading>
                </div>
            </header>

            <div className="visning__container">
                <Alert variant="info" className="visning__advarsel">
                    {stilling.source !== 'DIR' ? (
                        <>
                            <Link href={stillingPåArbeidsplassen}>Denne stillingen</Link> kan du
                            også finne på arbeidsplassen.no
                        </>
                    ) : (
                        'Dette er en stilling NAV jobber med for arbeidsgiver. Den er kun tilgjengelig her.'
                    )}
                </Alert>
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
