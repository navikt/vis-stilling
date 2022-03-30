import React, { FunctionComponent } from 'react';
// import '../../node_modules/nav-frontend-knapper-style/src/index.less';

const Lenkeknapp: FunctionComponent<React.HTMLProps<HTMLAnchorElement>> = (props) => {
    return (
        <a {...props} className="lenkeknapp knapp knapp--hoved">
            {props.children}
        </a>
    );
};

export default Lenkeknapp;
