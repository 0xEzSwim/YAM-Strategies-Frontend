'use client';

import { Skeleton } from '@/components/ui/skeleton';

export const PagePlaceholder = () => {
    return (
        <>
            <Skeleton className="h-4 w-[250px]" />
            <div className="grid auto-rows-min gap-8 md:grid-cols-3">
                <Skeleton className="aspect-video rounded-xl bg-muted/50" />
                <Skeleton className="aspect-video rounded-xl bg-muted/50" />
                <Skeleton className="aspect-video rounded-xl bg-muted/50" />
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50"></div>
        </>
    );
};
