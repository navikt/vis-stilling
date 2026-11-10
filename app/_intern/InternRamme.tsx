import type { ReactNode } from 'react';

import ModiaDekorator, { ModiaDekoratorScript } from './ModiaDekorator.tsx';

interface InternRammeProps {
    children: ReactNode;
}

const InternRamme = ({ children }: InternRammeProps) => (
    <html lang="no">
        <head>
            <ModiaDekoratorScript />
        </head>
        <body className="flex min-h-dvh flex-col">
            <noscript>Du må aktivere JavaScript for å bruke denne applikasjonen.</noscript>
            <div data-axe-ignore>
                <ModiaDekorator />
            </div>
            <div className="flex-1">{children}</div>
        </body>
    </html>
);

export default InternRamme;
