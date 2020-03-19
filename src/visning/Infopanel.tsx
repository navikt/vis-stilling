import React, { FunctionComponent, ReactNode } from 'react';
import { Undertittel } from 'nav-frontend-typografi';

type InfopanelProps = {
    tittel: string;
    children: ReactNode;
};

const Infopanel: FunctionComponent<InfopanelProps> = ({ tittel, children }) => {
    return (
        <div className="visning__infopanel">
            <Undertittel className="visning__infopaneltittel">{tittel}</Undertittel>
            {children}
        </div>
    );
};

export default Infopanel;
