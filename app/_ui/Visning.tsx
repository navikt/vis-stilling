import { Alert, Heading, Link } from '@navikt/ds-react';
import { FunctionComponent } from 'react';

import { Annonsestatus, Stilling } from '../types/Stilling';
import NaturligLinjeskift from './NaturligLinjeskift';
import Stillingsinfo from './Stillingsinfo';
import { hentAdresser, hentBedriftensVisningsnavn, lagInnerHtml } from './stillingUtils';

interface Props {
    stilling: Stilling;
}

const Visning: FunctionComponent<Props> = ({ stilling }) => {
    const annonsetekst = lagInnerHtml(stilling.properties.adtext);
    const stillingPåArbeidsplassen = `https://arbeidsplassen.nav.no/stillinger/stilling/${stilling.uuid}`;
    const hvemOgHvor = `${hentBedriftensVisningsnavn(stilling)}, ${hentAdresser(
        stilling.locationList
    )}`;

    const headerClass =
        'flex flex-col bg-[#cce1f3] border-b-[5px] border-b-[#99c2e8] px-4 py-6 sm:px-8 sm:py-10';
    const headerInnerClass = 'mx-auto w-full max-w-[75rem]';
    const containerClass = 'mx-auto mb-14 w-full px-4 sm:px-8 lg:max-w-[79rem]';
    const alertClass = 'my-4 sm:my-10';
    const mainClass = 'flex flex-col justify-between lg:flex-row lg:items-start';
    const articleClass =
        'mb-4 w-full rounded bg-white p-4 sm:mb-10 sm:mr-8 sm:p-10 lg:max-w-[45rem]';
    const asideClass = 'w-full lg:max-w-[25rem]';

    return (
        <>
            <header className={headerClass}>
                <div className={headerInnerClass}>
                    {hvemOgHvor}
                    <Heading level="1" size="xlarge">
                        <NaturligLinjeskift>{stilling.title}</NaturligLinjeskift>
                    </Heading>
                </div>
            </header>

            <div className={containerClass}>
                <Alert variant="info" className={alertClass}>
                    {stilling.source !== 'DIR' ? (
                        <>
                            <Link href={stillingPåArbeidsplassen}>Denne stillingen</Link> kan du
                            også finne på arbeidsplassen.no
                        </>
                    ) : (
                        'Dette er en stilling Nav jobber med for arbeidsgiver. Den er kun tilgjengelig her.'
                    )}
                </Alert>
                {stilling.status === Annonsestatus.Slettet && (
                    <Alert variant="warning" className={alertClass}>
                        Denne stillingen er slettet og er ikke lenger aktiv.
                    </Alert>
                )}
                <main className={mainClass}>
                    <article className={articleClass} dangerouslySetInnerHTML={annonsetekst} />
                    <aside className={asideClass}>
                        <Stillingsinfo stilling={stilling} />
                    </aside>
                </main>
            </div>
        </>
    );
};

export default Visning;
