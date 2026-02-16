import { Heading } from '@navikt/ds-react';
import type { FunctionComponent, ReactNode } from 'react';

type InfopanelProps = {
    tittel: string;
    children: ReactNode;
    framhevet?: boolean | undefined;
};

const Infopanel: FunctionComponent<InfopanelProps> = ({ tittel, children, framhevet }) => {
    const panelClass = framhevet ? 'rounded bg-[#cce1ff] p-5' : 'xl:px-5';

    return (
        <div className={panelClass}>
            <Heading spacing level="2" size="small" className="mb-3">
                {tittel}
            </Heading>
            {children}
        </div>
    );
};

export default Infopanel;
