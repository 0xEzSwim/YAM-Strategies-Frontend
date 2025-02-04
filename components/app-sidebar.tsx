'use client';

import Image from 'next/image';
import { Home, ChartBarIncreasing } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';
import Link from 'next/link';

// Menu items.
const items = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: Home
    },
    {
        title: 'Strategies',
        url: '/strategies',
        icon: ChartBarIncreasing
    }
    // {
    //     title: 'Settings',
    //     url: '/settings',
    //     icon: Settings
    // },
    // {
    //     title: 'Help',
    //     url: '/help',
    //     icon: HelpCircle
    // }
];

export const AppSidebar = () => {
    return (
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                                    <Image src={`/logo.png`} alt={''} width="64" height="64" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">YAM Strategies</span>
                                    <span className="truncate text-xs">EzSwim &copy;{new Date().getFullYear()}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    {/* <SidebarGroupLabel>Startegy</SidebarGroupLabel> */}
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};
