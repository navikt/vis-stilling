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
    const containerClass = 'mx-auto w-full lg:max-w-[79rem]';
    const alertClass = 'm-5';
    const mainClass = 'flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between px-10 py-5';
    const articleClass =
        'w-full rounded bg-white lg:max-w-[45rem] [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-5 [&_*]:mb-4';
    const asideClass = 'w-full lg:max-w-[25rem] lg:px-5';

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
                <main id="maincontent" className={mainClass}>
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
