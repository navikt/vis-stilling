'use client';

import type { FunctionComponent, HTMLProps, MouseEvent } from 'react';

import { logEvent } from '../logg/logEvent';

interface LenkeknappProps extends HTMLProps<HTMLAnchorElement> {
    logEventOmråde?: string;
    logEventHendelse?: string;
}

const Lenkeknapp: FunctionComponent<LenkeknappProps> = ({
    className,
    children,
    logEventOmråde,
    logEventHendelse,
    onClick,
    ...rest
}) => {
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (logEventOmråde && logEventHendelse) {
            logEvent(logEventOmråde, logEventHendelse);
        }

        onClick?.(event);
    };

    return (
        <a
            {...rest}
            onClick={handleClick}
            className={`mt-5 inline-flex items-center justify-center normal-case no-underline navds-button navds-button--primary navds-button--medium ${className ?? ''}`}
        >
            {children}
        </a>
    );
};

export default Lenkeknapp;
