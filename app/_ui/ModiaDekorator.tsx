import { ModiaContextHolder } from '../api/api-routes-with-obo.ts';

const erProd = () => process.env.NAIS_CLUSTER_NAME === 'prod-gcp';

export const modiaDekoratorSrc = () =>
    `https://cdn.nav.no/personoversikt/internarbeidsflate-decorator-v3/${erProd() ? 'prod' : 'dev'}/latest/dist/internarbeidsflate-decorator.wc.js`;

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
