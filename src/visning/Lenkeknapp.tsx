import React, { FunctionComponent } from 'react';
import css from './Visning.module.css';

const Lenkeknapp: FunctionComponent<React.HTMLProps<HTMLAnchorElement>> = (props) => {
    return (
        <a
            {...props}
            className={css.lenkeknapp + ' navds-button navds-button--primary navds-button--medium'}
        >
            {props.children}
        </a>
    );
};

export default Lenkeknapp;
