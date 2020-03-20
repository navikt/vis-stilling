import React, { FunctionComponent } from 'react';
import Lenke from 'nav-frontend-lenker';
import { Properties } from '../Stilling';

type Props = { properties: Properties };

const SosialeMedier: FunctionComponent<Props> = ({ properties }) => {
    const { linkedinpage, twitteraddress, facebookpage } = properties;

    const sosialeMedier: {
        [s: string]: string | undefined;
    } = {
        LinkedIn: linkedinpage,
        Twitter: twitteraddress,
        Facebook: facebookpage,
    };

    if (Object.values(sosialeMedier).filter(medie => medie).length === 0) {
        return null;
    }

    return (
        <div className="visning__sosiale-medier">
            <span>Bedriften på </span>
            {Object.entries(sosialeMedier).map(([plattform, href], index) =>
                href ? (
                    <>
                        {index !== 0 ? ' / ' : ''}
                        <Lenke href={href}>{plattform}</Lenke>
                    </>
                ) : null
            )}
        </div>
    );
};

export default SosialeMedier;
