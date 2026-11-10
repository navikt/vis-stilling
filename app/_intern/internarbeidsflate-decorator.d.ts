// Web component fra https://github.com/navikt/internarbeidsflatedecorator
import type { HTMLAttributes } from 'react';

interface InternarbeidsflateDecoratorAttributter extends HTMLAttributes<HTMLElement> {
    'app-name': string;
    environment: 'q0' | 'q1' | 'q2' | 'q3' | 'q4' | 'prod' | 'local' | 'mock';
    'url-format': 'NAV_NO' | 'ANSATT' | 'LOCAL';
    'show-enheter': boolean;
    'show-search-area': boolean;
    'show-hotkeys': boolean;
    fnr?: string;
    enhet?: string;
    'fnr-sync-mode'?: 'sync' | 'writeOnly' | 'ignore';
    'enhet-sync-mode'?: 'sync' | 'writeOnly' | 'ignore';
    'enable-hotkeys'?: boolean;
    'fetch-active-enhet-on-mount'?: boolean;
    'fetch-active-user-on-mount'?: boolean;
    'include-credentials'?: boolean;
    markup?: string;
    proxy?: string;
    'websocket-url'?: string;
    'access-token'?: string;
    'user-key'?: string;
}

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'internarbeidsflate-decorator': InternarbeidsflateDecoratorAttributter;
        }
    }
}
