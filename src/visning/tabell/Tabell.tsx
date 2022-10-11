import React, { FunctionComponent, ReactNode } from 'react';
import css from './Tabell.module.css';

type RadProps = {
    label: string;
    children: ReactNode;
};

const Tabell: FunctionComponent<{ children: React.ReactNode }> = ({ children }) => (
    <dl className="tabell">{children}</dl>
);

export const Rad: FunctionComponent<RadProps> = ({ label, children }) => {
    if (!children) return null;

    return (
        <div className={css.rad}>
            <dt className={css.label}>{`${label}:`}</dt>
            <dd>{children}</dd>
        </div>
    );
};

export default Tabell;
