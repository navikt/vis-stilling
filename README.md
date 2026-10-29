# vis-stilling

Denne appen viser en webside med informasjon om en gitt direktemeldt stilling som er opprettet via [Rekrutteringsbistand](https://github.com/navikt/rekrutteringsbistand-container). En URL til denne websiden deles med en Nav-bruker, på to måter (per mars 2022):
* lenken sendes i en SMS
* lenken vises i et aktivitetskort i [Aktivitetsplanen](https://github.com/navikt/aktivitetsplan)



## Manuell testing lokalt

```sh
pnpm install
pnpm dev
```
Utviklingsserveren svarer på http://localhost:3000/arbeid/stilling. Utvid URL-en med en av stillingsID-ene fra `app/api/stilling/helpers.ts`, for eksempel `stilling`, eller en av samtykke-scenarioene i `mock/samtykke-handlers.ts` (f.eks. `samtykke-ja`).

### Se siden slik den vises i prod

```sh
pnpm dev:prod
```

Serveren later som den kjører i `prod-gcp` og svarer på http://localhost:3001/arbeid/stilling/stilling. Samtykke til deling av CV er skrudd av i prod, så boksen viser bare «Har du spørsmål om stillingen?». Stillingsdata kommer fra mockdataene i `mock/eksempler`, mens dekoratøren hentes fra prod.

## Playwright

Testene kjøres i desktop Chromium, Firefox og WebKit, samt mobilvisning med
Pixel 7 (Chromium) og iPhone 13 (WebKit). Mobilprosjektene emulerer nettleser,
skjermstørrelse og touch; de er ikke tester på fysiske enheter.
CI kjører med fire shards og 100 % workers per shard.

```sh
pnpm exec playwright install chromium firefox webkit
pnpm test
pnpm run test --project=chromium-mobile
```

Playwright starter testserveren automatisk lokalt. Bruk `PLAYWRIGHT_PORT` for å
overstyre standardporten 1337 når flere apper testes samtidig.

CI bygger med `pnpm test-build` og tester standalone-serveren. Testbygget bruker
eksisterende mockdata fra `mock/eksempler` via `NEXT_PUBLIC_PLAYWRIGHT_TEST_MODE=true`.
Vanlige produksjonsbygg bruker fortsatt stillings-APIet.

## Nettleserstøtte

Appen bruker [`@navikt/browserslist-config-public`](https://github.com/navikt/browserslist-config/tree/main/packages/config-public)
via `browserslist` i `package.json`, både i utvikling og produksjon.
Next.js leser konfigurasjonen og sender nettlesermålene til Turbopack for å
tilpasse JavaScript og CSS. Det trengs derfor ingen egen målkonfigurasjon i `next.config.ts`.

Versjon 0.3.0 angir Chrome og Edge 108, Firefox 121, Safari og iOS Safari 16,
Opera 94 og Samsung Internet 21 som minsteversjoner. Dette er kompileringsmål,
ikke en garanti for at alle funksjoner virker i disse nettleserne:

- [Tailwind CSS 4](https://tailwindcss.com/docs/compatibility#browser-support) krever
  Chrome 111, Safari 16.4 og Firefox 128. Tailwinds PostCSS-plugin bruker egne,
  faste CSS-mål. Browserslist senker ikke disse kravene, og et ekstra CSS-steg
  kan ikke erstatte alle nettleserfunksjonene Tailwind trenger.
- Pakken legger ikke til polyfills for JavaScript-API-er. API-er som mangler i
  nettlesermålene, krever en funksjonssjekk eller en egen polyfill utover dem Next.js leverer.
- Playwright tester nyere nettlesere, ikke minsteversjonene i konfigurasjonen.

`packageExtensions` i `pnpm-workspace.yaml` gjenoppretter metadata for valgfrie
Astro- og Vite-avhengigheter som mangler i pakkeregisteret for 0.3.0.
Appen bruker ikke pakkens Astro- eller Vite-integrasjoner.

## Tilgjengelighet

Guiden til tilgjengelighetserklæringen, med hva tilgjengelighetstestene sjekker automatisk og hvordan du tester hvert WCAG-kriterium manuelt, ligger på [Trello](https://trello.com/c/2RWBDYg6).

Kjør tilgjengelighetstestene med `pnpm run test:a11y` og ESLint-regelen for 2.5.2 med `pnpm run lint`.

## Manuell testing i miljø
I nettelseren, gå til følgende adresser:

- Dev: https://vis-stilling.intern.dev.nav.no/arbeid/stilling/<stillingsId>
- Prod: https://www.nav.no/arbeid/stilling/<stillingsId>

## Kode generert av GitHub Copilot
Dette repoet bruker GitHub Copilot til å generere kode.

## Henvendelser

### For Nav-ansatte
* Dette Git-repositoriet eies av [team Toi](https://teamkatalog.nav.no/team/76f378c5-eb35-42db-9f4d-0e8197be0131).
* Slack: [#arbeidsgiver-toi-dev](https://nav-it.slack.com/archives/C02HTU8DBSR)

### For folk utenfor Nav
* IT-avdelingen i [Arbeids- og velferdsdirektoratet](https://www.nav.no/no/NAV+og+samfunn/Kontakt+NAV/Relatert+informasjon/arbeids-og-velferdsdirektoratet-kontorinformasjon)
