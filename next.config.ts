import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 's2.coinmarketcap.com',
                port: '',
                pathname: '/static/img/**',
                search: ''
            }
        ]
    }
};

export default nextConfig;
