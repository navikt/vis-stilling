'use client';

import { BodyShort, Button, Heading } from '@navikt/ds-react';
import { useEffect } from 'react';

import { rapporterFeil } from './_utils/apm';
import './globals.css';

const GlobalError = ({
    error,
    retry,
}: {
    error: Error & { digest?: string };
    retry: () => void;
}) => {
    useEffect(() => {
        rapporterFeil(error);
    }, [error]);

    return (
        <html lang="no">
            <body>
                <div className="mx-auto my-10 w-full text-center">
                    <Heading level="1" size="small" className="mb-2">
                        Det skjedde en ukjent feil
                    </Heading>
                    <BodyShort className="mb-4">Vennligst prøv igjen senere.</BodyShort>
                    <Button onClick={retry}>Prøv igjen</Button>
                </div>
            </body>
        </html>
    );
};

export default GlobalError;
