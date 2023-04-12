import { describe, test } from '@jest/globals';
import { transformerTilStilling } from './api';
import { Stilling, Workday, Workhour } from '../Stilling';

describe('asdf', () => {
    test('simpleString', async () => {
        const workdayString: string = JSON.stringify(Workday.Ukedager);
        const workhourString: string = JSON.stringify(Workhour.Dagtid);
        const s: string = stillingJson(workdayString, workhourString);

        const parsed = JSON.parse(s);
        const actual: Stilling = transformerTilStilling(parsed);

        console.log(JSON.stringify(actual));
    });

    test('arrayOneElement', async () => {
        // const uke1 = Workday.Ukedager
        // console.log("uke1=" + uke1)
        // const uke2 = "[\"" + uke1 + "\"]"
        // console.log("uke2=" + uke2)
        // const uke3 = JSON.stringify(uke2)
        // console.log("uke3=" + uke3)

        const workdayArray: string[] = [];
        workdayArray.push(Workday.Ukedager);
        const workdayString: string = JSON.stringify(workdayArray);
        console.log('workdayString=' + workdayString);

        const workhoursArray: string[] = [];
        workhoursArray.push(Workhour.Dagtid);
        const workhoursString: string = JSON.stringify(workhoursArray);
        console.log('workhoursString=' + workhoursString);

        const s: string = stillingJson(workdayString, workhoursString);
        const parsed = JSON.parse(s);

        const actual: Stilling = transformerTilStilling(parsed);

        console.log(JSON.stringify(actual));
    });

    test('arrayTwoElements', async () => {
        const s: string = stillingJson('["Ukedager","Lørdag"]', '["Dagtid", "Natt"]');
        const parsed = JSON.parse(s);

        const actual: Stilling = transformerTilStilling(parsed);

        console.log(JSON.stringify(actual));
    });

    test('objectIstedenforArray', async () => {
        const s: string = stillingJson('{}', '{}');
        const parsed = JSON.parse(s);

        const actual: Stilling = transformerTilStilling(parsed);

        console.log(JSON.stringify(actual));
    });

    function stillingJson(workdayString: string, workhoursString: string): string {
        // const workdayString: string = JSON.stringify(workday)
        // const workhoursString: string = JSON.stringify(workhours)

        const stilling = {
            id: 2261329,
            uuid: '40022b10-b283-4166-af57-e9dda0c342b6',
            updated: '2023-03-20T00:00:14.56287',
            contactList: [
                {
                    name: 'Unni Marsteinstredet Aagedal',
                    email: null,
                    phone: '95765849',
                    title: 'Direktør for Instituttstab',
                },
            ],
            title: 'Jurist (rådgiver/seniorrådgiver) ',
            medium: 'talentech',
            employer: {
                contactList: [],
                location: {
                    address: 'Lovisenberggata 8',
                    postalCode: '0456',
                    county: 'OSLO',
                    municipal: 'OSLO',
                    municipalCode: '0301',
                    city: 'OSLO',
                    country: 'NORGE',
                    latitude: '59.93394890465518',
                    longitude: '10.745259443345768',
                },
                properties: {},
                name: 'FOLKEHELSEINSTITUTTET AVD OSLO LINDERN',
                publicName: 'FOLKEHELSEINSTITUTTET AVD OSLO LINDERN',
            },
            businessName: 'Juridiske tjenester, Folkehelseinstituttet FHI',
            status: 'INACTIVE',
            location: {
                address: 'Myrens verksted 6H',
                postalCode: '0473',
                county: 'OSLO',
                municipal: 'OSLO',
                municipalCode: '0301',
                city: 'OSLO',
                country: 'NORGE',
                latitude: '59.93420171496874',
                longitude: '10.759017596892564',
            },
            properties: {
                extent: 'Heltid',
                workhours: workhoursString,
                employerhomepage: 'http://www.fhi.no',
                applicationdue: '2023-03-19T00:00:00',
                workday: workdayString,
                jobtitle: 'Jurist (rådgiver/seniorrådgiver)',
                positioncount: '1',
                engagementtype: 'Fast',
                employerdescription:
                    '<p><em>Folkehelseinstituttets visjon er bedre helse for alle. Vi produserer, oppsummerer og kommuniserer kunnskap for folkehelsearbeidet og helse- og omsorgstjenestene. Kjerneoppgavene er beredskap, kunnskap og infrastruktur. Infrastruktur omfatter bl.a. registre, helseundersøkelser, biobanker og laboratorievirksomhet. Folkehelseinstituttet er en etat under Helse- og omsorgsdepartementet. Vi er i dag om lag 1100 ansatte lokalisert i Oslo og Bergen.</em></p>\\n<p><em>\\nFolkehelseinstituttet  er opptatt av mangfold. Vi ønsker at kvalifiserte kandidater søker jobb hos oss uavhengig av kjønn, alder, funksjonsevne, hull i CVen, etnisk eller nasjonal bakgrunn.</em></p>',
                adtext: 'dummyAdText',
                applicationurl:
                    'https://candidate.webcruiter.com/cv?advertid=4618348348&language=nb&link_source_id=17',
                sector: 'Offentlig',
            },
            source: 'IMPORTAPI',
        };

        return JSON.stringify(stilling);
    }
});
