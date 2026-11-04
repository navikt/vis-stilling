import { ModiaContextHolder } from '../api/api-routes-with-obo.ts';

const erProd = () => process.env.NAIS_CLUSTER_NAME === 'prod-gcp';

// Dynamisk oppslag, ellers bygger Next inn NEXT_PUBLIC_-verdien ved byggetid i stedet for å lese den fra Nais
const DECORATOR_SRC = 'NEXT_PUBLIC_DECORATOR_SRC';

export const modiaDekoratorSrc = () =>
    process.env[DECORATOR_SRC] ??
    'https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/dev/latest/dist/internarbeidsflate-decorator.wc.js';

export const ModiaDekoratorScript = () => <script type="module" src={modiaDekoratorSrc()} />;

const ModiaDekorator = () => (
    <internarbeidsflate-decorator
        app-name="Vis stilling"
        environment={erProd() ? 'prod' : 'q2'}
        url-format="NAV_NO"
        proxy={ModiaContextHolder.internUrl}
        show-enheter
        show-search-area
        show-hotkeys={false}
        fetch-active-enhet-on-mount
        fetch-active-user-on-mount
    />
);

export default ModiaDekorator;
