import type { FunctionComponent, ReactNode } from 'react';

type TabellProps = {
    children: ReactNode;
};

type RadProps = {
    label: string;
    children: ReactNode;
};

const Tabell: FunctionComponent<TabellProps> = ({ children }) => (
    <dl className="space-y-4">{children}</dl>
);

export const Rad: FunctionComponent<RadProps> = ({ label, children }) => {
    if (!children) return null;

    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
            <dt className={`font-extralight text-[#49515E] sm:min-w-40 sm:shrink-0 lg:min-w-44`}>
                {`${label}:`}
            </dt>
            <dd className="sm:flex-[2.3] lg:flex-[1.5]">{children}</dd>
        </div>
    );
};

export default Tabell;
