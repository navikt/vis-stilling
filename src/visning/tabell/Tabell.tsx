import React, { FunctionComponent, ReactNode } from 'react';
import css from './Tabell.module.css';

type TabellProps = {
    children: ReactNode;
};

type RadProps = {
    label: string;
    children: ReactNode;
};

const Tabell: FunctionComponent<TabellProps> = ({ children }) => (
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
