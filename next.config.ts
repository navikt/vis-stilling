import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    transpilePackages: ['@navikt/ds-react', '@navikt/ds-css'],
    reactStrictMode: true,
    basePath: '/arbeid/stilling',
    distDir: '.next',
};

export default nextConfig;
