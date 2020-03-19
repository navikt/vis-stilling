import React, { FunctionComponent, ReactNode } from 'react';

type RadProps = {
    label: string;
    children: ReactNode;
};

const Tabell: FunctionComponent = ({ children }) => (
    <div className="visning__tabell">{children}</div>
);

export const Rad: FunctionComponent<RadProps> = ({ label, children }) => {
    if (!children) return null;

    return (
        <div className="visning__rad">
            <span className="visning__label">{`${label}:`}</span>
            <span>{children}</span>
        </div>
    );
};

export default Tabell;
