import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { anvil, gnosis } from 'wagmi/chains';

// API
export const DEVELOPMENT: boolean = process.env.NODE_ENV === 'development';
export const TEST: boolean = process.env.NODE_ENV === 'test'; // jest set it to `test` on `nmp run test`
export const SERVER_HOSTNAME: string = DEVELOPMENT || TEST || !process.env.SERVER_HOSTNAME ? 'localhost' : process.env.SERVER_HOSTNAME;
export const HTTP_SERVER_PORT: number = DEVELOPMENT || TEST || !process.env.HTTP_SERVER_PORT ? 8080 : Number(process.env.HTTP_SERVER_PORT);
export const HTTPS_SERVER_PORT: number = DEVELOPMENT || TEST || !process.env.HTTPS_SERVER_PORT ? 1337 : Number(process.env.HTTPS_SERVER_PORT);
export const BLOCKCHAIN_CLIENT = getDefaultConfig({
    appName: 'YAM Strategies',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID ?? '',
    chains: [DEVELOPMENT || TEST ? anvil : gnosis],
    ssr: true // If your dApp uses server side rendering (SSR)
});

export const config = {
    SERVER_HOSTNAME,
    HTTP_SERVER_PORT,
    HTTPS_SERVER_PORT,
    BLOCKCHAIN_CLIENT
};
