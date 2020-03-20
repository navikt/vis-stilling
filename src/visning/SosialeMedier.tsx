import React, { FunctionComponent } from 'react';
import Lenke from 'nav-frontend-lenker';
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
                    <>
                        {skilletegn}
                        <Lenke href={href || '#'}>{plattform}</Lenke>
                    </>
                );
            })}
        </>
    );
};

export default SosialeMedier;
