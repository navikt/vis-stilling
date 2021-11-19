import React, { FunctionComponent, ReactNode } from 'react';
import { Undertittel } from 'nav-frontend-typografi';

type InfopanelProps = {
    tittel: string;
    children: ReactNode;
    framhevet?: boolean | undefined;
};

const Infopanel: FunctionComponent<InfopanelProps> = ({ tittel, children, framhevet }) => {

    const cssKlasse = framhevet ? "visning__infopanel visning__infopanel--blaa" : "visning__infopanel"

    return (
        <div className={cssKlasse}>
            <Undertittel className="visning__infopaneltittel">{tittel}</Undertittel>
            {children}
        </div>
    );
};

export default Infopanel;
