import React, { FunctionComponent, ReactNode } from 'react';
import { Heading } from '@navikt/ds-react';

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
            <Heading spacing level="2" size="small">
                {tittel}
            </Heading>
            {children}
        </div>
    );
};

export default Infopanel;
