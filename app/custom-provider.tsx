'use client';

import { config } from '@/config';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

const customLightTheme = {
    blurs: {
        modalOverlay: 'blur(0px)'
    },
    colors: {
        accentColor: 'hsl(215.24, 98.1%, 58.82%)',
        accentColorForeground: 'hsl(0, 0%, 100%)',
        actionButtonBorder: 'hsl(211, 23.06%, 86.67%)',
        actionButtonBorderMobile: 'hsl(211, 23.06%, 86.67%)',
        actionButtonSecondaryBackground: 'hsl(213.71, 81.65%, 78.63%)',
        closeButton: 'hsl(215.17, 30.53%, 18.63%)',
        closeButtonBackground: 'hsl(210, 38.68%, 86.2%)',
        connectButtonBackground: 'hsl(215.24, 98.1%, 58.82%)',
        connectButtonBackgroundError: 'hsl(11.63, 70.49%, 35.88%)',
        connectButtonInnerBackground: 'linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
        connectButtonText: 'hsl(0, 0%, 100%)',
        connectButtonTextError: 'hsl(0, 0%, 100%)',
        connectionIndicator: 'hsl(215.24, 98.1%, 58.82%)',
        downloadBottomCardBackground: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.05) 100%)',
        downloadTopCardBackground: 'linear-gradient(0deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.05) 100%)',
        error: 'hsl(11.63, 70.49%, 35.88%)',
        generalBorder: 'hsl(211, 23.06%, 86.67%)',
        generalBorderDim: 'hsl(211, 23.06%, 86.67%)',
        menuItemBackground: 'hsl(210, 38.68%, 86.2%)',
        modalBackdrop: 'rgba(0, 0, 0, 0.5)',
        modalBackground: 'hsl(210, 13.33%, 94.12%)',
        modalBorder: 'hsl(211, 23.06%, 86.67%)',
        modalText: 'hsl(215.17, 30.53%, 18.63%)',
        modalTextDim: 'hsl(199.92, 4.26%, 44.02%)',
        modalTextSecondary: 'hsl(215.17, 30.53%, 18.63%)',
        profileAction: 'hsl(215.24, 98.1%, 58.82%)',
        profileActionHover: 'hsl(213.71, 81.65%, 78.63%)',
        profileForeground: 'hsl(210, 13.33%, 94.12%)',
        selectedOptionBorder: 'hsl(211, 23.06%, 86.67%)',
        standby: 'hsl(215.24, 98.1%, 58.82%)'
    },
    fonts: {
        body: 'Rubik, -apple-system, system-ui, sans-serif'
    },
    radii: {
        actionButton: '0.5rem',
        connectButton: '0.5rem',
        menuButton: '0.5rem',
        modal: '0.5rem',
        modalMobile: '0.5rem'
    },
    shadows: {
        connectButton: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        dialog: '0px 8px 32px rgba(0, 0, 0, 0.32)',
        profileDetailsAction: '0px 2px 6px rgba(37, 41, 46, 0.04)',
        selectedOption: '0px 2px 6px rgba(0, 0, 0, 0.24)',
        selectedWallet: '0px 2px 6px rgba(0, 0, 0, 0.24)',
        walletLogo: '0px 2px 16px rgba(0, 0, 0, 0.16)'
    }
};

const customDarkTheme = {
    blurs: {
        modalOverlay: 'blur(0px)'
    },
    colors: {
        accentColor: 'hsl(211, 100%, 50%)',
        accentColorForeground: 'hsl(0, 0%, 100%)',
        actionButtonBorder: 'hsl(211, 70.22%, 23.05%)',
        actionButtonBorderMobile: 'hsl(211, 70.22%, 23.05%)',
        actionButtonSecondaryBackground: 'hsl(211, 34.51%, 51.06%)',
        closeButton: 'hsl(211, 33%, 100%)',
        closeButtonBackground: 'hsl(211, 83.91%, 20.63%)',
        connectButtonBackground: 'hsl(211, 100%, 50%)',
        connectButtonBackgroundError: 'hsl(4, 100%, 60%)',
        connectButtonInnerBackground: 'linear-gradient(0deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 100%)',
        connectButtonText: 'hsl(0, 0%, 100%)',
        connectButtonTextError: 'hsl(0, 0%, 100%)',
        connectionIndicator: 'hsl(211, 100%, 50%)',
        downloadBottomCardBackground: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 100%)',
        downloadTopCardBackground: 'linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 100%)',
        error: 'hsl(4, 100%, 60%)',
        generalBorder: 'hsl(211, 70.22%, 23.05%)',
        generalBorderDim: 'hsl(211, 70.22%, 23.05%)',
        menuItemBackground: 'hsl(211, 83.91%, 20.63%)',
        modalBackdrop: 'rgba(0, 0, 0, 0.8)',
        modalBackground: 'hsl(215.08, 84.42%, 15.1%)',
        modalBorder: 'hsl(211, 70.22%, 23.05%)',
        modalText: 'hsl(211, 33%, 100%)',
        modalTextDim: 'hsl(211, 13.32%, 66.57%)',
        modalTextSecondary: 'hsl(211, 33%, 100%)',
        profileAction: 'hsl(211, 100%, 50%)',
        profileActionHover: 'hsl(211, 34.51%, 51.06%)',
        profileForeground: 'hsl(215.08, 84.42%, 15.1%)',
        selectedOptionBorder: 'hsl(211, 70.22%, 23.05%)',
        standby: 'hsl(211, 100%, 50%)'
    },
    fonts: {
        body: 'Rubik, -apple-system, system-ui, sans-serif'
    },
    radii: {
        actionButton: '0.5rem',
        connectButton: '0.5rem',
        menuButton: '0.5rem',
        modal: '0.5rem',
        modalMobile: '0.5rem'
    },
    shadows: {
        connectButton: '0px 4px 12px rgba(0, 0, 0, 0.3)',
        dialog: '0px 8px 32px rgba(0, 0, 0, 0.5)',
        profileDetailsAction: '0px 2px 6px rgba(37, 41, 46, 0.2)',
        selectedOption: '0px 2px 6px rgba(0, 0, 0, 0.4)',
        selectedWallet: '0px 2px 6px rgba(0, 0, 0, 0.4)',
        walletLogo: '0px 2px 16px rgba(0, 0, 0, 0.3)'
    }
};

const RainbowKitThemeWrapper = ({ children }: { children: React.ReactNode }) => {
    const { resolvedTheme } = useTheme();
    const theme = resolvedTheme === 'dark' ? customDarkTheme : customLightTheme;

    return <RainbowKitProvider theme={theme}>{children}</RainbowKitProvider>;
};

const CustomProvider = ({
    children
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <NextThemesProvider attribute="class" enableSystem defaultTheme="system" disableTransitionOnChange>
            <WagmiProvider config={config.BLOCKCHAIN_CLIENT}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitThemeWrapper>{children}</RainbowKitThemeWrapper>
                </QueryClientProvider>
            </WagmiProvider>
        </NextThemesProvider>
    );
};

export { CustomProvider };
