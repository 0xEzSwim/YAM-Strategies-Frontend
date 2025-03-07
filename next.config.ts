import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        optimizePackageImports: ['hooks', 'models', 'lib', 'sonner']
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 's2.coinmarketcap.com',
                port: '',
                pathname: '/static/img/**',
                search: ''
            },
            {
                protocol: 'https',
                hostname: 'tokens.1inch.io',
                port: '',
                pathname: '/**',
                search: ''
            }
        ]
    }
};

export default nextConfig;
