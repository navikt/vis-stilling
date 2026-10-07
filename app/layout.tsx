import { versionFromImage } from '@nais/apm';
import { fetchDecoratorReact } from '@navikt/nav-dekoratoren-moduler/ssr';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { connection } from 'next/server';

import type { ReactNode } from 'react';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
    await connection();
    return {
        title: 'Se stilling',
        description: 'Visning av en arbeidsstilling',
        other: {
            'nais-app': process.env.NAIS_APP_NAME ?? 'vis-stilling',
            'nais-team': 'toi',
            'nais-cluster': process.env.NAIS_CLUSTER_NAME ?? 'local',
            'nais-version': versionFromImage(process.env.NAIS_APP_IMAGE) ?? 'local',
            ...(process.env.NAIS_FRONTEND_TELEMETRY_COLLECTOR_URL && {
                'nais-telemetry-url': process.env.NAIS_FRONTEND_TELEMETRY_COLLECTOR_URL,
            }),
        },
    };
}

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
