import { erVeileder } from '../_utils/util.ts';

const miljø = process.env.NAIS_CLUSTER_NAME;

// Veiledere får Azure OBO-token, personbrukere får TokenX-token
const lagScope = (namespace: string, app: string) =>
    erVeileder ? `api://${miljø}.${namespace}.${app}/.default` : `${miljø}:${namespace}:${app}`;

export interface Iroute {
    api_route: string;
    api_url: string;
    internUrl: string;
    internUrlWithoutBaseUrl: string;
    scope: string;
}

export const DelingAvCv: Iroute = {
    api_route: '/rest/cv',
    api_url: process.env.TOI_DELING_AV_CV_API ?? '',
    internUrl: '/arbeid/stilling/api/deling-av-cv',
    internUrlWithoutBaseUrl: '/api/deling-av-cv',
    scope: lagScope('toi', 'toi-deling-av-cv-api'),
};
