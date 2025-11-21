import type { Metadata, Viewport } from 'next';
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

const RootLayout = ({ children }: RootLayoutProps) => (
    <html lang="no">
        <body>
            <noscript>Du må aktivere JavaScript for å bruke denne applikasjonen.</noscript>
            {children}
        </body>
    </html>
);

export default RootLayout;
