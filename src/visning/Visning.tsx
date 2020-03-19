import React, { FunctionComponent, ReactNode } from 'react';
import { Sidetittel } from 'nav-frontend-typografi';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import Lenke from 'nav-frontend-lenker';

import { Stilling, Location } from '../Stilling';
import './Visning.less';
import Infopanel from './Infopanel';

interface Props {
    stilling: Stilling;
}

const normaliserNavn = (navn: string) => {
    if (navn.length > 0) {
        return navn[0] + (navn.length > 1 ? navn.substring(1).toLowerCase() : '');
    } else {
        return '';
    }
};

const hentStedPåKortform = (location: Location) => {
    if (location.municipal) {
        return normaliserNavn(location.municipal);
    }

    return null;
};

const hentAdresse = (location: Location) => {
    if (location.address) {
        if (location.postalCode && location.city) {
            return `${location.address}, ${location.postalCode} ${normaliserNavn(location.city)}`;
        }
    } else return hentStedPåKortform(location);
};

const Tabell: FunctionComponent = ({ children }) => (
    <div className="visning__tabell">{children}</div>
);

type RadProps = {
    label: string;
    children: ReactNode;
};

const Rad: FunctionComponent<RadProps> = ({ label, children }) => (
    <div className="visning__rad">
        <span className="visning__label">{`${label}:`}</span>
        <span>{children}</span>
    </div>
);

const Visning: FunctionComponent<Props> = ({ stilling }) => {
    const { properties } = stilling;

    const søknadsfrist =
        properties.applicationdue === 'Snarest'
            ? properties.applicationdue
            : new Date(properties.applicationdue).toLocaleDateString();

    return (
        <>
            <header className="visning__header">
                <div className="visning__header-inner">
                    {hentStedPåKortform(stilling.location)}
                    <Sidetittel>{stilling.title}</Sidetittel>
                </div>
            </header>

            <div className="visning__container">
                <AlertStripeInfo className="visning__advarsel">
                    Dette er en intern NAV-stilling. Stillingen er kun tilgjengelig via denne
                    lenken, og kan ikke søkes opp på Arbeidsplassen.no
                </AlertStripeInfo>
                <main className="visning__main">
                    <article
                        className="visning__stillingstekst"
                        dangerouslySetInnerHTML={{ __html: properties.adtext }}
                    />
                    <aside className="visning__stillingsinfo">
                        <Infopanel tittel="Søknad">
                            <Tabell>
                                <Rad label="Søknadsfrist">{søknadsfrist}</Rad>
                                <Rad label="Søknad sendes til">
                                    <Lenke href={`mailto:ola.nordmann@firma.no`}>
                                        ola.nordmann@firma.no
                                    </Lenke>
                                </Rad>
                            </Tabell>
                        </Infopanel>
                        <Infopanel tittel="Om stillingen">
                            <Tabell>
                                <Rad label="Stillingstittel">{properties.jobtitle}</Rad>
                                <Rad label="Arbeidssted">{hentAdresse(stilling.location)}</Rad>
                                <Rad label="Ansettelsesform">{properties.engagementtype}</Rad>
                                {properties.jobarrangement && (
                                    <Rad label="Arbeidstidsordning">
                                        {properties.jobarrangement}
                                    </Rad>
                                )}
                                <Rad label="Omfang">{properties.extent}</Rad>
                                <Rad label="Arbeidsdager">{properties.workday.join(', ')}</Rad>
                                <Rad label="Arbeidstid">{properties.workhours.join(', ')}</Rad>
                                <Rad label="Antall stillinger">{properties.positioncount}</Rad>
                                <Rad label="Sektor">{properties.sector}</Rad>
                                {properties.starttime && (
                                    <Rad label="Oppstart">{properties.starttime}</Rad>
                                )}
                            </Tabell>
                        </Infopanel>
                    </aside>
                </main>
            </div>
        </>
    );
};

export default Visning;
