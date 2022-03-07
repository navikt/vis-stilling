# vis-stilling

Denne appen viser en webside med informasjon om en gitt direktemeldt stilling som er opprettet via [Rekrutteringsbistand](https://github.com/navikt/rekrutteringsbistand-container). En URL til denne websiden deles med en Nav-bruker, på to måter (per mars 2022):
* lenken sendes i en SMS
* lenken vises i et aktivitetskort i [Aktivitetsplanen](https://github.com/navikt/aktivitetsplan)


## Manuell testing lokalt
Fungerer ikke med Node versjon større enn 16 per mars 2023. Tips: Installer [nvm](https://github.com/nvm-sh/nvm) for lett å kunne bytte mellom ulike versjoner av Node.

```sh
npm install
npm run start:mock
```
Et nettleservindu skal åpne seg. Utvid URL-en med en av stillingsID-ene fra filen `src/mock/mock-api.ts`

## Manuell testing i miljø
I nettelseren, gå til følgende adresser:

- Dev: https://vis-stilling.dev.nav.no/arbeid/stilling/<stillingsId>
- Prod: https://www.nav.no/arbeid/stilling/<stillingsId>


# Henvendelser

## For Nav-ansatte
* Dette Git-repositoriet eies av [Team tiltak og inkludering (TOI) i Produktområde arbeidsgiver](https://teamkatalog.nais.adeo.no/team/0150fd7c-df30-43ee-944e-b152d74c64d6).
* Slack-kanaler:
  * [#arbeidsgiver-toi-dev](https://nav-it.slack.com/archives/C02HTU8DBSR)
  * [#arbeidsgiver-utvikling](https://nav-it.slack.com/archives/CD4MES6BB)

## For folk utenfor Nav
* Opprett gjerne en issue i Github for alle typer spørsmål
* IT-utviklerne i Github-teamet https://github.com/orgs/navikt/teams/toi
* IT-avdelingen i [Arbeids- og velferdsdirektoratet](https://www.nav.no/no/NAV+og+samfunn/Kontakt+NAV/Relatert+informasjon/arbeids-og-velferdsdirektoratet-kontorinformasjon)
