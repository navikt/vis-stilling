import React, { FunctionComponent } from 'react';
import '../../node_modules/nav-frontend-knapper-style/src/index.less';

interface Props {
    href: string;
}

const Lenkeknapp: FunctionComponent<Props> = ({ href, children }) => {
    return (
        <a href={href} className="lenkeknapp knapp knapp--hoved">
            {children}
        </a>
    );
};

export default Lenkeknapp;
