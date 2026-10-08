import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    transpilePackages: ['@navikt/ds-react', '@navikt/ds-css'],
    serverExternalPackages: ['@navikt/next-logger'],
    reactStrictMode: true,
    basePath: '/arbeid/stilling',
    assetPrefix: process.env.CDN_ASSET_PREFIX,
    crossOrigin: 'anonymous',
    productionBrowserSourceMaps: true,
    distDir: '.next',
};

export default nextConfig;
