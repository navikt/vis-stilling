import { fetchDecoratorReact } from '@navikt/nav-dekoratoren-moduler/ssr';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
    title: 'Se stilling',
    description: 'Visning av en arbeidsstilling',
};

export const viewport: Viewport = {
    themeColor: '#000000',
};

interface RootLayoutProps {
    children: ReactNode;
}

const RootLayout = async ({ children }: RootLayoutProps) => {
    const env = process.env.NAIS_CLUSTER_NAME === 'prod-gcp' ? 'prod' : 'dev';

    const Decorator = await fetchDecoratorReact({
        env: env,
        params: {
            chatbot: false,
        },
    });

    return (
        <html lang="no">
            <head>
                <Decorator.HeadAssets />
            </head>
            <body>
                <noscript>Du må aktivere JavaScript for å bruke denne applikasjonen.</noscript>
                <div data-pa11y-ignore="decorator-header">
                    <Decorator.Header />
                </div>
                {children}
                <div data-pa11y-ignore="decorator-footer">
                    <Decorator.Footer />
                </div>
                <Decorator.Scripts loader={Script} />
            </body>
        </html>
    );
};

export default RootLayout;
