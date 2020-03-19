import React, { FunctionComponent } from 'react';
import Lenke from 'nav-frontend-lenker';

import { hentSøknadsfrist, hentAdresse, formaterDato } from './stillingUtils';
import { Stilling } from '../Stilling';
import Infopanel from './Infopanel';
import Tabell, { Rad } from './Tabell';

interface Props {
    stilling: Stilling;
}

const Stillingsinfo: FunctionComponent<Props> = ({ stilling }) => {
    const { properties } = stilling;
    const kontaktinfo =
        stilling.contactList && stilling.contactList.length > 0 && stilling.contactList[0];

    const bedriftensAdresse = stilling.employer.location && hentAdresse(stilling.employer.location);

    const bedriftensNettside = stilling.properties.employerhomepage && (
        <Lenke href={stilling.properties.employerhomepage}>
            {stilling.properties.employerhomepage}
        </Lenke>
    );

    const kontaktinfoEpost = kontaktinfo && kontaktinfo.email && (
        <Lenke href={`mailto:${kontaktinfo.email}`}>{kontaktinfo.email}</Lenke>
    );

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
                    <Rad label="Arbeidstidsordning">{properties.jobarrangement}</Rad>
                    <Rad label="Omfang">{properties.extent}</Rad>
                    <Rad label="Arbeidsdager">{properties.workday.join(', ')}</Rad>
                    <Rad label="Arbeidstid">{properties.workhours.join(', ')}</Rad>
                    <Rad label="Antall stillinger">{properties.positioncount}</Rad>
                    <Rad label="Sektor">{properties.sector}</Rad>
                    <Rad label="Oppstart">{properties.starttime}</Rad>
                </Tabell>
            </Infopanel>
            {kontaktinfo && (
                <Infopanel tittel="Kontaktperson for stillingen">
                    <Tabell>
                        <Rad label="Kontaktperson">{kontaktinfo.name}</Rad>
                        <Rad label="Stillingstittel">{kontaktinfo.title}</Rad>
                        <Rad label="Telefon">{kontaktinfo.phone}</Rad>
                        <Rad label="E-post">{kontaktinfoEpost}</Rad>
                    </Tabell>
                </Infopanel>
            )}
            <Infopanel tittel="Om bedriften">
                <Tabell>
                    <Rad label="Bedriftens navn">{stilling.employer.publicName}</Rad>
                    <Rad label="Adresse">{bedriftensAdresse}</Rad>
                    <Rad label="Nettsted">{bedriftensNettside}</Rad>
                </Tabell>

                {stilling.properties.employerdescription && (
                    <div
                        className="visning__kortOmBedriften"
                        dangerouslySetInnerHTML={{
                            __html: stilling.properties.employerdescription,
                        }}
                    />
                )}
            </Infopanel>
            <Infopanel tittel="Om annonsen">
                <Tabell>
                    <Rad label="Sist endret">{formaterDato(stilling.updated)}</Rad>
                    <Rad label="Hentet fra">{stilling.source}</Rad>
                    <Rad label="Annonsenummer">{stilling.id}</Rad>
                </Tabell>
            </Infopanel>
        </>
    );
};

export default Stillingsinfo;
