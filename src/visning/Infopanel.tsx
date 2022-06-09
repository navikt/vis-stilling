import React, { FunctionComponent, ReactNode } from 'react';
import { Heading } from '@navikt/ds-react';
import css from './Visning.module.css';

type InfopanelProps = {
    tittel: string;
    children: ReactNode;
    framhevet?: boolean | undefined;
};

const Infopanel: FunctionComponent<InfopanelProps> = ({ tittel, children, framhevet }) => {
    let cssKlasse = css.infopanel;

    if (framhevet) {
        cssKlasse += ' ' + css.infopanelFramhevet;
    }

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
