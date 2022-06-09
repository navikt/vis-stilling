import React, { FunctionComponent } from 'react';
import { Dialog } from '@navikt/ds-icons';
import { Link } from '@navikt/ds-react';

import {
    hentSøknadsfrist,
    hentAdresse,
    formaterDato,
    lagInnerHtml,
    hentBedriftensVisningsnavn,
} from './stillingUtils';
import { Stilling } from '../Stilling';
import Infopanel from './Infopanel';
import Tabell, { Rad } from './tabell/Tabell';
import Lenkeknapp from './Lenkeknapp';
import SosialeMedier from './SosialeMedier';
import { logEvent } from '../amplitude/amplitude';
import css from './Visning.module.css';

interface Props {
    stilling: Stilling;
}

const Stillingsinfo: FunctionComponent<Props> = ({ stilling }) => {
    const { properties } = stilling;
    const { starttime } = properties;

    const kontaktinfo = stilling.contactList?.[0];

    const bedriftensNavn = hentBedriftensVisningsnavn(stilling);
    const bedriftensAdresse = stilling.employer.location && hentAdresse(stilling.employer.location);

    const bedriftensNettside = properties.employerhomepage && (
        <Link href={properties.employerhomepage}>{properties.employerhomepage}</Link>
    );

    const bedriftsbeskrivelse = properties.employerdescription && (
        <div
            className="visning__kort-om-bedriften"
            dangerouslySetInnerHTML={lagInnerHtml(properties.employerdescription)}
        />
    );

    const bedriftensEpost = stilling.contactList?.[0]?.email;
    const lenkeTilBedriftensEpost = bedriftensEpost && (
        <Link href={`mailto:${bedriftensEpost}`}>{bedriftensEpost}</Link>
    );

    const harSosialeMedier =
        properties.facebookpage || properties.linkedinpage || properties.twitteraddress;

    let stillingensOppstart;
    if (starttime) {
        stillingensOppstart = starttime === 'Etter avtale' ? starttime : formaterDato(starttime);
    }

    return (
        <>
            <Infopanel tittel="Søknad">
                <Tabell>
                    <Rad label="Søknadsfrist">{hentSøknadsfrist(properties)}</Rad>
                    {!properties.applicationurl && properties.applicationemail && (
                        <Rad label="Søknad sendes til">
                            <Link href={`mailto:ola.nordmann@firma.no`}>
                                {properties.applicationemail}
                            </Link>
                        </Rad>
                    )}
                </Tabell>
                {properties.applicationurl && (
                    <Lenkeknapp
                        href={properties.applicationurl}
                        onClick={() => {
                            logEvent('søkeknapp', 'klikk');
                        }}
                    >
                        Søk på stillingen
                    </Lenkeknapp>
                )}
            </Infopanel>
            <Infopanel tittel="Om stillingen">
                <Tabell>
                    <Rad label="Stillingstittel">{properties.jobtitle}</Rad>
                    <Rad label="Arbeidssted">{hentAdresse(stilling.location)}</Rad>
                    <Rad label="Ansettelsesform">{properties.engagementtype}</Rad>
                    <Rad label="Arbeidstidsordning">{properties.jobarrangement}</Rad>
                    <Rad label="Omfang">{properties.extent}</Rad>
                    <Rad label="Arbeidsdager">{properties.workday?.join(', ')}</Rad>
                    <Rad label="Arbeidstid">{properties.workhours?.join(', ')}</Rad>
                    <Rad label="Antall stillinger">{properties.positioncount}</Rad>
                    <Rad label="Sektor">{properties.sector}</Rad>
                    <Rad label="Oppstart">{stillingensOppstart}</Rad>
                </Tabell>
            </Infopanel>
            {stilling.source === 'DIR' && (
                <Infopanel framhevet tittel="Har du spørsmål om stillingen?">
                    <div className={css.kontaktVeileder}>
                        <Dialog aria-hidden role="img" fr="" />
                        Kontakt veilederen din i dialogen i aktivitetsplanen.
                    </div>
                </Infopanel>
            )}
            {kontaktinfo && stilling.source !== 'DIR' && (
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
                    {harSosialeMedier && (
                        <Rad label="Sosiale medier">
                            <SosialeMedier properties={properties} />
                        </Rad>
                    )}
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
