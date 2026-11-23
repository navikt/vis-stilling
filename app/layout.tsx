import { versionFromImage } from '@nais/apm';
import type { Metadata, Viewport } from 'next';
import { connection } from 'next/server';

import type { ReactNode } from 'react';
import EksternRamme from './_ekstern/EksternRamme.tsx';
import InternRamme from './_intern/InternRamme.tsx';
import { APPNAVN } from './_felles/utils/sidetittel';
import { erVeileder } from './_felles/utils/util.ts';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
    await connection();
    return {
        title: APPNAVN,
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
    if (erVeileder) {
        return <InternRamme>{children}</InternRamme>;
    }

    return <EksternRamme>{children}</EksternRamme>;
};

export default RootLayout;
