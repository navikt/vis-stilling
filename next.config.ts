import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    transpilePackages: ['@navikt/ds-react', '@navikt/ds-css', '@navikt/stilling-react'],
    serverExternalPackages: ['@navikt/next-logger'],
    reactStrictMode: true,
    basePath: '/arbeid/stilling',
    assetPrefix: process.env.CDN_ASSET_PREFIX,
    crossOrigin: 'anonymous',
    productionBrowserSourceMaps: true,
    // Playwright kjører ekstern og intern dev-server samtidig, og next dev låser distDir
    distDir: process.env.NEXT_DIST_DIR ?? '.next',
};

export default nextConfig;
