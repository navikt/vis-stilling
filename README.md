# vis-stilling

Denne appen viser en webside med informasjon om en gitt direktemeldt stilling som er opprettet via [Rekrutteringsbistand](https://github.com/navikt/rekrutteringsbistand-container). En URL til denne websiden deles med en Nav-bruker, på to måter (per mars 2022):
* lenken sendes i en SMS
* lenken vises i et aktivitetskort i [Aktivitetsplanen](https://github.com/navikt/aktivitetsplan)


## Manuell testing lokalt

```sh
npm install
npm run start:mock
```
Et nettleservindu skal åpne seg. Utvid URL-en med en av stillingsID-ene fra filen `src/mock/mock-api.ts`

## Manuell testing i miljø
I nettelseren, gå til følgende adresser:

- Dev: https://vis-stilling.intern.dev.nav.no/arbeid/stilling/<stillingsId>
- Prod: https://www.nav.no/arbeid/stilling/<stillingsId>


## Henvendelser

### For Nav-ansatte
* Dette Git-repositoriet eies av [team Toi](https://teamkatalog.nav.no/team/76f378c5-eb35-42db-9f4d-0e8197be0131).
* Slack: [#arbeidsgiver-toi-dev](https://nav-it.slack.com/archives/C02HTU8DBSR)

### For folk utenfor Nav
* IT-avdelingen i [Arbeids- og velferdsdirektoratet](https://www.nav.no/no/NAV+og+samfunn/Kontakt+NAV/Relatert+informasjon/arbeids-og-velferdsdirektoratet-kontorinformasjon)
