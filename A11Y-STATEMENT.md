# Guide til tilgjengelighetserklæringen

Vis stilling skal oppfylle alle A- og AA-krav i WCAG 2.1. Denne guiden viser hvordan du tester hvert kriterium i tilgjengelighetserklæringen for appen på [a11y-statement.nav.no](https://a11y-statement.nav.no), og hva Playwright-testene allerede sjekker automatisk.

Vis stilling viser én stilling som en veileder har delt med en jobbsøker, enten i en SMS eller i aktivitetsplanen. Siden krever ikke innlogging og har ingen skjemaer. Derfor er flere kriterier ikke aktuelle.

## Slik svarer du i erklæringen

| Svar | Når |
|---|---|
| Ja | Både de automatiske testene og en manuell test viser at kravet er oppfylt på alle sider. |
| Nei | Du har funnet minst ett brudd. Beskriv avviket og planen for å rette det. |
| Ikke testet | Kriteriet er ikke testet manuelt ennå. Grønne automatiske tester alene er ikke nok til «Ja». |
| Ikke aktuelt | Appen har ikke innholdet kriteriet gjelder, for eksempel video eller skjemaer. |

De automatiske testene finner mange brudd, men de kan ikke bekrefte at et krav er oppfylt. axe kan for eksempel se at et bilde har alternativtekst, men ikke om teksten beskriver bildet.

## Hva testes automatisk

`tests/tilgjengelighet.spec.ts` bruker `@navikt/toi-next-frontend/a11y` og tester stillingssiden i seks varianter: vanlig stilling, en annen stilling, stilling med formatert annonsetekst, slettet stilling, stilling uten stillingstittel og upublisert stilling. Testene kjører i `chromium-desktop` og `chromium-mobile` og stopper deploy hvis de feiler.

Dekoratøren er merket med `data-axe-ignore` i `app/layout.tsx` og blir ikke sjekket. Den eies av et annet team.

### axe og reflow

Testen «Tilgjengelighet (WCAG 2.1 A/AA)» kjører axe med taggene `wcag2a`, `wcag2aa`, `wcag21a` og `wcag21aa`. Tabellen under viser hvilke axe-regler som hører til hvert kriterium.

Den samme testen sjekker reflow (1.4.10): vinduet settes til 320 × 256 px, og testen feiler hvis siden ruller horisontalt.

### Utvidede sjekker

Testen «Tilgjengelighet – utvidede sjekker» kjører i nettleseren på de samme variantene:

| Sjekk | Kriterier | Slik virker den |
|---|---|---|
| Tekstforstørrelse | 1.4.4 | Dobler rot-skriftstørrelsen og feiler hvis tekst blir kuttet av. |
| Tekstavstand | 1.4.12 | Legger på WCAG-tekstavstanden og feiler hvis tekst blir kuttet av. |
| Visningsretning | 1.3.4 | Laster siden i stående og liggende format og sjekker at innholdet vises i begge. |
| Tastatur | 2.1.1, 2.1.2, 2.4.7, 3.2.1 | Tabber gjennom hele siden. Feiler hvis klikkbare elementer ikke kan nås, fokus står fast, fokus ikke vises eller fokus alene åpner noe nytt. |
| Hopp til hovedinnhold | 2.4.1 | Tabber til første lenke og sjekker at den peker til et mål som finnes, og at neste Tab etter Enter går til hovedinnholdet eller videre. |

Hver kjøring legger ved `fokusrekkefølge.txt` i rapporten. Den er nyttig når du sjekker 2.4.3.

### Dette testes ikke automatisk

- Dekoratøren
- Om annonseteksten har riktig struktur og språk. Teksten kommer fra arbeidsgiveren eller fra stillingsregistreringen.
- Om tekster, alternativtekster og overskrifter gir mening
- Sidetittelen utover at den finnes

### Kjør testene lokalt

```sh
pnpm run test:a11y                                                # alle tilgjengelighetstester
pnpm exec playwright test --grep @a11y-utvidet --project='chromium*'   # bare utvidede sjekker
```

Kjører du `pnpm dev` samtidig, setter du `PLAYWRIGHT_PORT` til en ledig port.

### Legg til en ny variant

Legg mock-stillingen i `mock/eksempler`, registrer id-en i `devMockFileByIdentifier` i `app/api/stilling/helpers.ts`, og legg den til i listen `sider` i `tests/tilgjengelighet.spec.ts` med en locator som viser at siden er ferdig lastet. Ukjente id-er faller tilbake til `annen-stilling.json`, så uten registreringen kan testen bli grønn uten å teste den nye varianten.

## Verktøy for manuell testing

- **Tastatur**: Tab, Shift+Tab, Enter, mellomrom og Esc
- **VoiceOver** på Mac: slå på og av med Cmd+F5. VO+U åpner rotoren med lister over overskrifter, lenker og landemerker.
- **Zoom**: Cmd+plus til 200 % og 400 %. Endre også standard skriftstørrelse i nettleseren (Chrome: Innstillinger → Utseende → Skriftstørrelse).
- **Chrome DevTools**: fargevelgeren viser kontrastforholdet. Under Rendering kan du simulere fargeblindhet.
- **Bokmerket for tekstavstand**: [Text spacing bookmarklet](https://www.html5accessibility.com/tests/tsbookmarklet.html)
- **Testguider**: [Universell utforming på Aksel](https://aksel.nav.no/god-praksis/universell-utforming) og [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)

Test flere ekte stillinger i dev: stillinger fra Nav, stillinger fra eksterne kilder, lange annonser og annonser på engelsk.

## Kriteriene

### 1 Mulig å oppfatte

| Kriterium | Testes automatisk | Slik tester du manuelt |
|---|---|---|
| 1.1.1 Ikke-tekstlig innhold | axe: `image-alt`, `svg-img-alt`, `role-img-alt`, `input-image-alt`, `object-alt` | Gå gjennom siden med VoiceOver. Bilder og ikoner som betyr noe, skal ha en tekst som beskriver formålet. Pynteikoner skal ha `aria-hidden`. |
| 1.2.1 Bare lyd og bare video | Ingen | Ikke aktuelt så lenge siden ikke har lyd eller video. |
| 1.2.2 Teksting | axe: `video-caption` | Ikke aktuelt så lenge siden ikke har video. |
| 1.2.3 Synstolking eller mediealternativ | Ingen | Ikke aktuelt så lenge siden ikke har video. |
| 1.2.5 Synstolking | Ingen | Ikke aktuelt så lenge siden ikke har video. |
| 1.3.1 Informasjon og relasjoner | axe: `list`, `listitem`, `dlitem`, `definition-list`, `th-has-data-cells`, `td-headers-attr`, `aria-required-children`, `aria-required-parent` | Åpne overskriftslisten i VoiceOver-rotoren. Siden skal ha én `h1` med stillingstittelen, og nivåene skal speile strukturen. Sjekk at lister og overskrifter i annonseteksten vises som ekte lister og overskrifter. |
| 1.3.2 Meningsbærende rekkefølge | Ingen | La VoiceOver lese hele siden (VO+A). Rekkefølgen skal gi mening også på mobil, der kolonnene ligger under hverandre. |
| 1.3.3 Sensoriske egenskaper | Ingen | Instruksjoner skal ikke bare vise til form, farge, plassering eller lyd. |
| 1.3.4 Visningsretning | Utvidet sjekk: visningsretning | Åpne siden på mobil og bytt mellom stående og liggende format. |
| 1.3.5 Identifiser formål med inndata | axe: `autocomplete-valid` | Ikke aktuelt: siden har ingen skjemafelt. |
| 1.4.1 Bruk av farge | axe: `link-in-text-block` | Lenker i løpende tekst skal kunne skilles fra teksten rundt uten farge, for eksempel med understreking. Varsler skal ikke bare skille seg fra hverandre med farge, men også med ikon og tekst. |
| 1.4.2 Styring av lyd | axe: `no-autoplay-audio` | Ikke aktuelt så lenge siden ikke spiller lyd. |
| 1.4.3 Kontrast (minimum) | axe: `color-contrast` | Sjekk hover og fokus med fargevelgeren i DevTools. Krav: 4,5:1 for vanlig tekst og 3:1 for stor tekst. |
| 1.4.4 Endring av tekststørrelse | Utvidet sjekk: tekstforstørrelse, axe: `meta-viewport` | Zoom til 200 % og sett standard skriftstørrelse i nettleseren til «Svært stor». Ingen tekst eller funksjon skal forsvinne eller overlappe. |
| 1.4.5 Bilder av tekst | Ingen | Tekst skal ikke vises som bilde. Logoer er unntatt. |
| 1.4.10 Dynamisk tilpasning (reflow) | Reflow i hovedtesten | Sett vinduet til 1280 px og zoom til 400 %. Siden skal ikke rulle horisontalt. Test med lange ord og lenker i annonseteksten. |
| 1.4.11 Kontrast for ikke-tekstlig innhold | Ingen | Ikoner som betyr noe og fokusmarkering skal ha 3:1 mot bakgrunnen. |
| 1.4.12 Tekstavstand | Utvidet sjekk: tekstavstand, axe: `avoid-inline-spacing` | Bruk bokmerket for tekstavstand på lange annonser. Ingen tekst skal bli kuttet av. |
| 1.4.13 Pekerfølsomt innhold | Ingen | Flytt musen fra utløseren og over på hjelpeteksten eller popoveren. Innholdet skal bli værende til du flytter musen eller fokus bort, eller lukker det. Dekker innholdet annet innhold, skal det kunne lukkes med Esc uten å flytte musen eller fokus. Feilmeldinger fra validering er unntatt. |

### 2 Mulig å betjene

| Kriterium | Testes automatisk | Slik tester du manuelt |
|---|---|---|
| 2.1.1 Tastatur | Utvidet sjekk: tastatur, axe: `scrollable-region-focusable`, `frame-focusable-content` | Bruk siden med bare tastatur. Du skal nå alle lenker, også «Søk på stillingen». |
| 2.1.2 Ingen tastaturfelle | Utvidet sjekk: tastatur | Tab gjennom hele siden og tilbake. Fokus skal aldri stå fast. |
| 2.1.4 Hurtigtaster som består av ett tegn | Ingen | Ikke aktuelt så lenge appen ikke har hurtigtaster. |
| 2.2.1 Justerbar hastighet | axe: `meta-refresh` | Ikke aktuelt: siden har ingen innlogging eller tidsfrister. |
| 2.2.2 Pause, stopp, skjul | axe: `blink`, `marquee` | Innhold som beveger seg, blinker eller ruller, starter automatisk, varer mer enn 5 sekunder og vises sammen med annet innhold, skal kunne pauses, stoppes eller skjules. Innhold som oppdateres automatisk og vises sammen med annet innhold, skal kunne pauses, stoppes, skjules eller få justert hvor ofte det oppdateres, uansett hvor lenge det varer. Unntaket gjelder bare når bevegelsen eller oppdateringen er nødvendig, for eksempel en lasteindikator mens brukeren ikke kan gjøre noe annet. |
| 2.3.1 Terskelverdi på maksimalt tre glimt | Ingen | Ikke aktuelt så lenge ingenting blinker. |
| 2.4.1 Hoppe over blokker | axe: `bypass`, utvidet sjekk: hopp til hovedinnhold | Trykk Tab på siden. Dekoratørens «Hopp til hovedinnhold» skal flytte fokus til `<main id="maincontent">` i `app/_ui/Visning.tsx`. |
| 2.4.2 Sidetitler | axe: `document-title` sjekker bare at tittelen finnes | Tittelen i fanen skal beskrive siden. Den settes i `generateMetadata` i `app/layout.tsx`. Vurder om tittelen bør inneholde stillingstittelen. |
| 2.4.3 Fokusrekkefølge | Delvis: vedlegget `fokusrekkefølge.txt` | Tab gjennom siden. Rekkefølgen skal følge det visuelle, også på mobil. |
| 2.4.4 Formål med lenke (i kontekst) | axe: `link-name` | Åpne lenkelisten i VoiceOver-rotoren. Hver lenke, sammen med setningen den står i, skal forklare hvor den går. Lenker som åpner en ekstern side, bør si det. |
| 2.4.5 Flere måter | Ingen | Kriteriet gjelder sider i et sett av nettsider. Avklar hvilke innganger siden har: lenken i SMS-en, aktivitetskortet i aktivitetsplanen og, for stillinger som ikke er direktemeldte, arbeidsplassen.no. Direktemeldte stillinger finnes bare her. Vurder om siden er et resultat av eller et steg i en prosess, og beskriv vurderingen i erklæringen. |
| 2.4.6 Overskrifter og ledetekster | Ingen | Les overskriftene for seg. De skal beskrive innholdet under dem. |
| 2.4.7 Synlig fokus | Utvidet sjekk: tastatur | Tab gjennom siden. Fokusmarkeringen skal være tydelig. |
| 2.5.1 Pekerbevegelser | Ingen | Ikke aktuelt så lenge ingenting krever bevegelser med flere fingre, som å knipe, eller bevegelser som må følge en bestemt bane, som å sveipe i et mønster. Vanlig dra og slipp hører ikke til dette kriteriet. |
| 2.5.2 Pekeravbrytelse | Ingen | Handlinger skal utløses når du slipper museknappen, ikke når du trykker den ned. |
| 2.5.3 Ledetekst i navn | axe: `label-content-name-mismatch` | Når en lenke eller knapp har `aria-label`, skal den inneholde den synlige teksten, helst først. |
| 2.5.4 Bevegelsesaktivering | Ingen | Ikke aktuelt så lenge siden ikke bruker bevegelsessensorer. |

### 3 Forståelig

| Kriterium | Testes automatisk | Slik tester du manuelt |
|---|---|---|
| 3.1.1 Språk på siden | axe: `html-has-lang`, `html-lang-valid` | `<html lang="no">` er satt i `app/layout.tsx`. |
| 3.1.2 Språk på deler av innholdet | axe: `valid-lang` sjekker bare at `lang`-verdiene er gyldige | Annonser kan være skrevet på engelsk eller andre språk. Sjekk at VoiceOver leser dem med riktig uttale. Det krever `lang` på annonseteksten. Navn og faguttrykk er unntatt. |
| 3.2.1 Fokus | Utvidet sjekk: tastatur | Fokus alene skal ikke åpne nye sider, vinduer eller dialoger. |
| 3.2.2 Inndata | Ingen | Ikke aktuelt: siden har ingen skjemafelt. |
| 3.2.3 Konsekvent navigering | Ingen | Dekoratøren gir samme navigering som resten av nav.no. Sjekk at sidens egne lenker står på samme sted for alle stillinger. |
| 3.2.4 Konsekvent identifikasjon | Ingen | Samme funksjon skal ha samme navn og ikon på alle stillinger. |
| 3.3.1 Identifikasjon av feil | Ingen | Ikke aktuelt: siden har ingen skjemaer. |
| 3.3.2 Ledetekster eller instruksjoner | axe: `form-field-multiple-labels` | Ikke aktuelt: siden har ingen skjemaer. |
| 3.3.3 Forslag ved feil | Ingen | Ikke aktuelt: siden har ingen skjemaer. |
| 3.3.4 Forhindring av feil (juridiske feil, økonomiske feil, datafeil) | Ingen | Ikke aktuelt: brukeren sender ikke inn noe fra siden. |

### 4 Robust

| Kriterium | Testes automatisk | Slik tester du manuelt |
|---|---|---|
| 4.1.1 Parsing | Ingen | W3C regner kriteriet som alltid oppfylt for HTML, og det er fjernet i WCAG 2.2. Svar «Ja». |
| 4.1.2 Navn, rolle, verdi | axe: `button-name`, `link-name`, `nested-interactive`, `aria-allowed-attr`, `aria-hidden-focus`, `aria-valid-attr-value` og flere `aria-*`-regler | Gå gjennom lenker og knapper med VoiceOver. Hver kontroll skal leses med navn og rolle. |
| 4.1.3 Statusbeskjeder | Ingen | Ikke aktuelt så lenge siden ikke viser beskjeder etter at den er lastet. |
