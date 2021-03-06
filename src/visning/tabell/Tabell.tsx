import React, { FunctionComponent, ReactNode } from 'react';
import './Tabell.less';

type RadProps = {
    label: string;
    children: ReactNode;
};

const Tabell: FunctionComponent = ({ children }) => <dl className="tabell">{children}</dl>;

export const Rad: FunctionComponent<RadProps> = ({ label, children }) => {
    if (!children) return null;

    return (
        <div className="tabell__rad">
            <dt className="tabell__label">{`${label}:`}</dt>
            <dd>{children}</dd>
        </div>
    );
};

export default Tabell;
