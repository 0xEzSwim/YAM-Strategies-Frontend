'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetModel } from '@/models';
import Image from 'next/image';

interface TokenListProps {
    tokens: AssetModel[];
    isLoading: boolean;
    isLoadingMore: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    onSelectToken: (token: AssetModel) => void;
    onSearch: (query: string) => void;
    searchQuery: string;
}

export const TokenList = ({ tokens, isLoading, isLoadingMore, hasMore, onLoadMore, onSelectToken, onSearch, searchQuery }: TokenListProps) => {
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoading && !isLoadingMore && hasMore) {
                    onLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [isLoading, isLoadingMore, hasMore, onLoadMore]);

    return (
        <div className="flex flex-col h-full">
            <div className="relative mb-4 flex-shrink-0">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search tokens..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <div className="flex-1 overflow-auto min-h-0 pr-2">
                <div className="flex flex-col gap-2">
                    {isLoading ? (
                        Array.from({ length: 10 }).map((_, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="flex flex-col gap-1">
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            {tokens.map((token) => (
                                <button
                                    key={token.address}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                                    onClick={() => onSelectToken(token)}
                                >
                                    <div className="flex items-center gap-2">
                                        {token.logoUrl ? (
                                            <Image src={token.logoUrl} alt={`${token.symbol} logo`} width={32} height={32} className="rounded-full" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-accent" />
                                        )}
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium">{token.symbol}</span>
                                            <span className="text-sm text-muted-foreground">{token.address.slice(0, 8)}...</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="font-medium">{token.supply.toFixed(2)}</span>
                                        <span className="text-sm text-muted-foreground">{token.decimals} decimals</span>
                                    </div>
                                </button>
                            ))}
                            {(hasMore || isLoadingMore) && (
                                <div ref={observerTarget} className="flex items-center justify-between p-3 rounded-lg border">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="h-5 w-24" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Skeleton className="h-5 w-16" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
