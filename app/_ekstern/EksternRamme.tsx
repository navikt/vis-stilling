import { fetchDecoratorReact } from '@navikt/nav-dekoratoren-moduler/ssr';
import Script from 'next/script';
import type { ReactNode } from 'react';

import { dekoratorMockScript } from '../../mock/dekorator.ts';
import { skalMocke } from '../_felles/utils/util.ts';

interface EksternRammeProps {
    children: ReactNode;
}

const EksternRamme = async ({ children }: EksternRammeProps) => {
    const env = process.env.NAIS_CLUSTER_NAME === 'prod-gcp' ? 'prod' : 'dev';

    const Decorator = await fetchDecoratorReact({
        env: env,
        params: {
            redirectToApp: true,
            chatbot: false,
        },
    });

    return (
        <html lang="no">
            <head>
                {skalMocke && <script dangerouslySetInnerHTML={{ __html: dekoratorMockScript }} />}
                <Decorator.HeadAssets />
            </head>
            <body className="flex min-h-dvh flex-col">
                <noscript>Du må aktivere JavaScript for å bruke denne applikasjonen.</noscript>
                <div data-axe-ignore>
                    <Decorator.Header />
                </div>
                <div className="flex-1">{children}</div>
                <div data-axe-ignore>
                    <Decorator.Footer />
                </div>
                <Decorator.Scripts loader={Script} />
            </body>
        </html>
    );
};

export default EksternRamme;
