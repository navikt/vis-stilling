import { Link } from '@navikt/ds-react';
import { Fragment, FunctionComponent } from 'react';
import { Properties } from '../Stilling';

type Props = { properties: Properties };

const SosialeMedier: FunctionComponent<Props> = ({ properties }) => {
    const sosialeMedier = {
        LinkedIn: properties.linkedinpage,
        Twitter: properties.twitteraddress,
        Facebook: properties.facebookpage,
    };

    const bedriftensSosialeMedier = Object.entries(sosialeMedier).filter(([, href]) => href);
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
                        <Link href={href || '#'}>{plattform}</Link>
                    </Fragment>
                );
            })}
        </>
    );
};

export default SosialeMedier;
