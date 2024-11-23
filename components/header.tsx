'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Moon, Sun } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useRouter, usePathname } from 'next/navigation';

export const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { setTheme } = useTheme();

    return (
        <header className="flex shrink-0 justify-between px-4">
            <div className="flex h-16 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        {pathname
                            .split('/')
                            .reduce((paths: string[], path: string) => {
                                if (path !== '') {
                                    paths.push(decodeURI(path));
                                }
                                return paths;
                            }, [])
                            .map((breadcrumb: string, index: number, breadcrumbs: string[]) => (
                                <div key={`${breadcrumb}-${index}`} className="contents">
                                    {index + 1 === breadcrumbs.length ? (
                                        <BreadcrumbItem className={index + 1 === breadcrumbs.length ? '' : 'hidden md:block'}>
                                            <BreadcrumbPage>{breadcrumb}</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    ) : (
                                        <>
                                            <BreadcrumbItem className={index + 1 === breadcrumbs.length ? '' : 'cursor-pointer hidden md:block'}>
                                                <BreadcrumbLink onClick={() => router.push(`/${breadcrumb}`)}>{breadcrumb}</BreadcrumbLink>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator className="hidden md:block" />
                                        </>
                                    )}
                                </div>
                            ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <ConnectButton />
            </div>
        </header>
    );
};
