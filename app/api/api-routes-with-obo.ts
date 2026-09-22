const miljø = process.env.NAIS_CLUSTER_NAME;

export interface Iroute {
    api_route: string;
    api_url: string;
    internUrl: string;
    scope: string;
}

export const DelingAvCv: Iroute = {
    api_route: '/rest/cv',
    api_url: process.env.TOI_DELING_AV_CV_API ?? '',
    internUrl: '/arbeid/stilling/api/deling-av-cv',
    scope: `${miljø}:toi:toi-deling-av-cv-api`,
};
