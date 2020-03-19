import React, { FunctionComponent } from 'react';
import Lenke from 'nav-frontend-lenker';

import { hentSøknadsfrist, hentAdresse } from './stillingUtils';
import { Stilling } from '../Stilling';
import Infopanel from './Infopanel';
import Tabell, { Rad } from './Tabell';

interface Props {
    stilling: Stilling;
}

const Stillingsinfo: FunctionComponent<Props> = ({ stilling }) => {
    const { properties } = stilling;

    return (
        <>
            <Infopanel tittel="Søknad">
                <Tabell>
                    <Rad label="Søknadsfrist">{hentSøknadsfrist(stilling.properties)}</Rad>
                    <Rad label="Søknad sendes til">
                        <Lenke href={`mailto:ola.nordmann@firma.no`}>ola.nordmann@firma.no</Lenke>
                    </Rad>
                </Tabell>
            </Infopanel>
            <Infopanel tittel="Om stillingen">
                <Tabell>
                    <Rad label="Stillingstittel">{properties.jobtitle}</Rad>
                    <Rad label="Arbeidssted">{hentAdresse(stilling.location)}</Rad>
                    <Rad label="Ansettelsesform">{properties.engagementtype}</Rad>
                    <Rad label="Arbeidstidsordning" skjul={!properties.jobarrangement}>
                        {properties.jobarrangement}
                    </Rad>
                    <Rad label="Omfang">{properties.extent}</Rad>
                    <Rad label="Arbeidsdager">{properties.workday.join(', ')}</Rad>
                    <Rad label="Arbeidstid">{properties.workhours.join(', ')}</Rad>
                    <Rad label="Antall stillinger">{properties.positioncount}</Rad>
                    <Rad label="Sektor" skjul={!properties.starttime}>
                        {properties.sector}
                    </Rad>
                    <Rad label="Oppstart">{properties.starttime}</Rad>
                </Tabell>
            </Infopanel>
        </>
    );
};

export default Stillingsinfo;
