import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import localFont from 'next/font/local';
import './globals.css';
import { CustomProvider } from '@/app/custom-provider';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/header';
import { Loader2 } from 'lucide-react';

const geistSans = localFont({
    src: './fonts/GeistVF.woff',
    variable: '--font-geist-sans',
    weight: '100 900'
});
const geistMono = localFont({
    src: './fonts/GeistMonoVF.woff',
    variable: '--font-geist-mono',
    weight: '100 900'
});

export const metadata: Metadata = {
    title: 'YAM Strategies',
    description: 'YAM Strategies'
};

export default async function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <SidebarProvider defaultOpen={defaultOpen}>
                    <AppSidebar />
                    <SidebarInset>
                        <CustomProvider>
                            <Header />
                            <div className="flex flex-col max-w-6xl mx-auto gap-8 p-4">{children}</div>
                        </CustomProvider>
                    </SidebarInset>
                </SidebarProvider>
                <Toaster
                    richColors
                    toastOptions={{
                        classNames: {
                            toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                            description: 'group-[.toast]:text-muted-foreground',
                            actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                            cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-primary-foreground',
                            error: 'group toast group-[.toaster]:bg-red group-[.toaster]:text-red-600 group-[.toaster]:shadow-lg',
                            success: 'group toast group-[.toaster]:bg-green group-[.toaster]:text-green-600 group-[.toaster]:shadow-lg',
                            warning: 'group toast group-[.toaster]:bg-yellow group-[.toaster]:text-yellow-600 group-[.toaster]:shadow-lg',
                            info: 'group toast group-[.toaster]:bg-blue group-[.toaster]:text-blue-600 group-[.toaster]:shadow-lg'
                        }
                    }}
                    icons={{
                        loading: <Loader2 className="animate-spin" />
                    }}
                    closeButton
                />
            </body>
        </html>
    );
}
