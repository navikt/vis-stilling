import { describe, expect, test } from 'vitest';
import { transformerTilStilling } from './api';
import { Stilling, Workday, Workhour } from '../Stilling';

describe('parsing av workhours og workday fra stilling-API-et', () => {
    test('feltene kan være en vanlig string', async () => {
        const workdayString: string = Workday.Ukedager;
        const workhourString: string = Workhour.Dagtid;
        const s: string = stillingJson(workdayString, workhourString);

        const parsed = JSON.parse(s);
        const actual: Stilling = transformerTilStilling(parsed);

        expect(actual.properties.workhours).toEqual([Workhour.Dagtid]);
        expect(actual.properties.workday).toEqual([Workday.Ukedager]);
    });

    test('feltene kan være en JSON array (string) som inneholder én verdi', async () => {
        const s: string = stillingJson('["Ukedager"]', '["Dagtid"]');
        const parsed = JSON.parse(s);

        const actual: Stilling = transformerTilStilling(parsed);

        expect(actual.properties.workhours).toEqual([Workhour.Dagtid]);
        expect(actual.properties.workday).toEqual([Workday.Ukedager]);
    });

    test('feltene kan være en JSON array (string) som inneholder to verdier', async () => {
        const s: string = stillingJson('["Ukedager","Lørdag"]', '["Dagtid", "Natt"]');
        const parsed = JSON.parse(s);

        const actual: Stilling = transformerTilStilling(parsed);

        expect(actual.properties.workhours).toEqual([Workhour.Dagtid, Workhour.Natt]);
        expect(actual.properties.workday).toEqual([Workday.Ukedager, Workday.Lørdag]);
    });

    function stillingJson(workday: string, workhours: string): string {
        const stilling = {
            id: 2261329,
            uuid: '40022b10-b283-4166-af57-e9dda0c342b6',
            updated: '2023-03-20T00:00:14.56287',
            contactList: [],
            title: 'Jurist (rådgiver/seniorrådgiver)',
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
                workhours: workhours,
                employerhomepage: 'http://www.fhi.no',
                applicationdue: '2023-03-19T00:00:00',
                workday: workday,
                jobtitle: 'Jurist (rådgiver/seniorrådgiver)',
                positioncount: '1',
                engagementtype: 'Fast',
                employerdescription: 'dummyEmployerdescription',
                adtext: 'dummyAdText',
                applicationurl: 'https://dummy.nav.no',
                sector: 'Offentlig',
            },
            source: 'IMPORTAPI',
        };

        return JSON.stringify(stilling);
    }
});
