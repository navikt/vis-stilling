import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    transpilePackages: ['@navikt/ds-react', '@navikt/ds-css'],
    reactStrictMode: true,
    basePath: '/arbeid/stilling',
    distDir: '.next',
};

export default nextConfig;
