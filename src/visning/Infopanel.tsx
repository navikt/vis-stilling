import { Heading } from '@navikt/ds-react';
import React, { FunctionComponent, ReactNode } from 'react';

type InfopanelProps = {
    tittel: string;
    children: ReactNode;
    framhevet?: boolean | undefined;
};

const Infopanel: FunctionComponent<InfopanelProps> = ({ tittel, children, framhevet }) => {
    const cssKlasse = framhevet
        ? 'visning__infopanel visning__infopanel--blaa'
        : 'visning__infopanel';

    return (
        <div className={cssKlasse}>
            <Heading level="2" size="small" className="visning__infopaneltittel">
                {tittel}
            </Heading>
            {children}
        </div>
    );
};

export default Infopanel;
