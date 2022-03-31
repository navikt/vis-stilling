import React, { FunctionComponent } from 'react';

const Lenkeknapp: FunctionComponent<React.HTMLProps<HTMLAnchorElement>> = (props) => {
    return (
        <a
            {...props}
            className="lenkeknapp navds-button navds-button--primary navds-button--medium"
        >
            {props.children}
        </a>
    );
};

export default Lenkeknapp;
