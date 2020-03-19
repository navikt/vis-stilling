import React, { FunctionComponent, ReactNode } from 'react';

type RadProps = {
    label: string;
    skjul?: boolean;
    children: ReactNode;
};

const Tabell: FunctionComponent = ({ children }) => (
    <div className="visning__tabell">{children}</div>
);

export const Rad: FunctionComponent<RadProps> = ({ label, skjul = false, children }) => {
    if (skjul) return null;

    return (
        <div className="visning__rad">
            <span className="visning__label">{`${label}:`}</span>
            <span>{children}</span>
        </div>
    );
};

export default Tabell;
