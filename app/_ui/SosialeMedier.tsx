import { Link } from '@navikt/ds-react';
import { Fragment, FunctionComponent } from 'react';
import { Properties } from '../types/Stilling';
import { lagEksternLenke } from '../_utils/lenke';

type Props = { properties: Properties };

const SosialeMedier: FunctionComponent<Props> = ({ properties }) => {
    const sosialeMedier = {
        LinkedIn: lagEksternLenke(properties.linkedinpage),
        Twitter: lagEksternLenke(properties.twitteraddress),
        Facebook: lagEksternLenke(properties.facebookpage),
    };

    const bedriftensSosialeMedier = Object.entries(sosialeMedier).filter(
        (medie): medie is [string, string] => Boolean(medie[1])
    );
    if (bedriftensSosialeMedier.length === 0) {
        return null;
    }

    return (
        <>
            {bedriftensSosialeMedier.map(([plattform, href], index) => {
                const skilletegn = index !== 0 ? ' / ' : '';

                return (
                    <Fragment key={href}>
                        {skilletegn}
                        <Link href={href}>{plattform}</Link>
                    </Fragment>
                );
            })}
        </>
    );
};

export default SosialeMedier;
