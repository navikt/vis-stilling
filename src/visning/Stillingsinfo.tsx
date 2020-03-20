import React, { FunctionComponent } from 'react';
import Lenke from 'nav-frontend-lenker';

import { hentSøknadsfrist, hentAdresse, formaterDato, lagInnerHtml } from './stillingUtils';
import { Stilling } from '../Stilling';
import Infopanel from './Infopanel';
import Tabell, { Rad } from './tabell/Tabell';
import Lenkeknapp from './Lenkeknapp';
import SosialeMedier from './SosialeMedier';

interface Props {
    stilling: Stilling;
}

const Stillingsinfo: FunctionComponent<Props> = ({ stilling }) => {
    const { properties } = stilling;

    const kontaktinfo = stilling.contactList?.[0];

    const bedriftensNavn =
        stilling.businessName || stilling.employer.publicName || stilling.employer.name;

    const bedriftensAdresse = stilling.employer.location && hentAdresse(stilling.employer.location);

    const bedriftensNettside = stilling.properties.employerhomepage && (
        <Lenke href={stilling.properties.employerhomepage}>
            {stilling.properties.employerhomepage}
        </Lenke>
    );

    const bedriftsbeskrivelse = stilling.properties.employerdescription && (
        <div
            className="visning__kort-om-bedriften"
            dangerouslySetInnerHTML={lagInnerHtml(stilling.properties.employerdescription)}
        />
    );

    const bedriftensEpost = stilling.contactList?.[0]?.email;
    const lenkeTilBedriftensEpost = bedriftensEpost && (
        <Lenke href={`mailto:${bedriftensEpost}`}>{bedriftensEpost}</Lenke>
    );

    return (
        <>
            <Infopanel tittel="Søknad">
                <Tabell>
                    <Rad label="Søknadsfrist">{hentSøknadsfrist(stilling.properties)}</Rad>
                    {!properties.applicationurl && properties.applicationemail && (
                        <Rad label="Søknad sendes til">
                            <Lenke href={`mailto:ola.nordmann@firma.no`}>
                                {properties.applicationemail}
                            </Lenke>
                        </Rad>
                    )}
                </Tabell>
                {properties.applicationurl && (
                    <Lenkeknapp href={properties.applicationurl}>Søk på stillingen</Lenkeknapp>
                )}
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
                        <Rad label="E-post">{lenkeTilBedriftensEpost}</Rad>
                    </Tabell>
                </Infopanel>
            )}
            <Infopanel tittel="Om bedriften">
                <Tabell>
                    <Rad label="Bedriftens navn">{bedriftensNavn}</Rad>
                    <Rad label="Adresse">{bedriftensAdresse}</Rad>
                    <Rad label="Nettsted">{bedriftensNettside}</Rad>
                    <Rad label="Sosiale medier">
                        <SosialeMedier properties={properties} />
                    </Rad>
                </Tabell>
                {bedriftsbeskrivelse}
            </Infopanel>
            <Infopanel tittel="Om annonsen">
                <Tabell>
                    <Rad label="Sist endret">{formaterDato(stilling.updated)}</Rad>
                    <Rad label="Annonsenummer">{stilling.id}</Rad>
                </Tabell>
            </Infopanel>
        </>
    );
};

export default Stillingsinfo;
