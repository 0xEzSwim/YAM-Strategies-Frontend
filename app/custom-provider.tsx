'use client';
import { config } from '@/config';
import { cssStringFromTheme, cssObjectFromTheme, darkTheme, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();
export const CustomProvider = ({
    children
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <NextThemesProvider attribute="class" enableSystem defaultTheme="system" disableTransitionOnChange>
            <WagmiProvider config={config.BLOCKCHAIN_CLIENT}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider theme={darkTheme({ ...darkTheme, accentColor: '#1d4ed8', borderRadius: 'medium', fontStack: 'system' })}>
                        {children}
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </NextThemesProvider>
    );
};
