import { ChatIcon } from '@navikt/aksel-icons';
import { Link } from '@navikt/ds-react';
import { FunctionComponent, ReactNode } from 'react';

import { Stilling } from '../types/Stilling';
import Infopanel from './Infopanel';
import Lenkeknapp from './Lenkeknapp';
import SosialeMedier from './SosialeMedier';
import {
    hentAdresse,
    hentAdresser,
    hentBedriftensVisningsnavn,
    hentSøknadsfrist,
    lagInnerHtml,
} from '../_utils/stillingUtils.ts';
import Tabell, { Rad } from './tabell/Tabell';
import { formaterNorskDato } from '../_utils/dato.ts';

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
            className="mt-8 space-y-4"
            dangerouslySetInnerHTML={lagInnerHtml(properties.employerdescription)}
        />
    );

    const bedriftensEpost = stilling.contactList?.[0]?.email;
    const lenkeTilBedriftensEpost = bedriftensEpost && (
        <div data-pa11y-ignore="mailto-link">
            <Link href={`mailto:${bedriftensEpost}`}>{bedriftensEpost}</Link>
        </div>
    );

    const kontaktRader: Array<{ label: string; innhold: ReactNode }> = [
        { label: 'Kontaktperson', innhold: kontaktinfo?.name },
        { label: 'Stillingstittel', innhold: kontaktinfo?.title },
        { label: 'Telefon', innhold: kontaktinfo?.phone },
        { label: 'E-post', innhold: lenkeTilBedriftensEpost },
    ].filter((rad) => Boolean(rad.innhold));

    const harSosialeMedier =
        properties.facebookpage || properties.linkedinpage || properties.twitteraddress;

    let stillingensOppstart;
    if (starttime) {
        stillingensOppstart =
            starttime === 'Etter avtale'
                ? starttime
                : formaterNorskDato({
                      dato: starttime,
                      visning: 'tall',
                  });
    }
    return (
        <div className="flex flex-col gap-10">
            <Infopanel tittel="Søknad">
                <Tabell>
                    <Rad label="Søknadsfrist">{hentSøknadsfrist(properties)}</Rad>
                    {!properties.applicationurl && properties.applicationemail && (
                        <Rad label="Søknad sendes til">
                            <Link href={`mailto:${properties.applicationemail}`}>
                                {properties.applicationemail}
                            </Link>
                        </Rad>
                    )}
                </Tabell>
                {properties.applicationurl && (
                    <Lenkeknapp
                        href={properties.applicationurl}
                        logEventOmråde="søkeknapp"
                        logEventHendelse="klikk"
                    >
                        Søk på stillingen
                    </Lenkeknapp>
                )}
            </Infopanel>
            <Infopanel tittel="Om stillingen">
                <Tabell>
                    <Rad label="Stillingstittel">{properties.jobtitle}</Rad>
                    <Rad label="Arbeidssted">{hentAdresser(stilling.locationList)}</Rad>
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
                    <div className="mt-3 flex items-center gap-3">
                        <ChatIcon aria-hidden role="img" className="text-2xl" />
                        <span>Kontakt veilederen din i dialogen i aktivitetsplanen.</span>
                    </div>
                </Infopanel>
            )}
            {kontaktRader.length > 0 && stilling.source !== 'DIR' && (
                <Infopanel tittel="Kontaktperson for stillingen">
                    <Tabell>
                        {kontaktRader.map((rad) => (
                            <Rad key={rad.label} label={rad.label}>
                                {rad.innhold}
                            </Rad>
                        ))}
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
                    <Rad label="Sist endret">
                        {formaterNorskDato({
                            dato: stilling.updated,
                            visning: 'tall',
                        })}
                    </Rad>
                    <Rad label="Annonsenummer">{stilling.annonsenr}</Rad>
                </Tabell>
            </Infopanel>
        </div>
    );
};

export default Stillingsinfo;
