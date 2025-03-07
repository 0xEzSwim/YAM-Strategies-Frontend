'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTokens } from '@/hooks';
import { AssetModel } from '@/models';

// Components
import { Search } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TokenListProps {
    onSelectToken: (token: AssetModel) => void;
    selectedToken?: AssetModel;
}

const TokenList = ({ onSelectToken, selectedToken }: TokenListProps) => {
    const { currentTokens: tokens, isLoading, currentPage, setCurrentPage, totalPages, pageSize, setSearchTerm } = useTokens();

    const [searchQuery, setSearchQuery] = useState('');
    const [displayedTokens, setDisplayedTokens] = useState<AssetModel[]>([]);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const lastTokenRef = useRef<HTMLDivElement | null>(null);

    // Mettre à jour le terme de recherche dans le hook useTokens
    useEffect(() => {
        setSearchTerm(searchQuery);
    }, [searchQuery, setSearchTerm]);

    // Initialiser displayedTokens avec les tokens initiaux
    useEffect(() => {
        if (currentPage === 1) {
            setDisplayedTokens(tokens);
        } else {
            // Accumuler les tokens
            setDisplayedTokens((prev) => {
                // Éviter les doublons en vérifiant les adresses
                const existingAddresses = new Set(prev.map((token) => token.address));
                const newTokens = tokens.filter((token) => !existingAddresses.has(token.address));
                return [...prev, ...newTokens];
            });
        }
    }, [tokens, currentPage]);

    // Fonction pour gérer le scroll infini
    const handleScroll = useCallback(() => {
        if (currentPage < totalPages && !isLoading) {
            setCurrentPage(currentPage + 1);
        }
    }, [currentPage, totalPages, isLoading, setCurrentPage]);

    // Configuration de l'observer pour le dernier élément
    useEffect(() => {
        if (isLoading) return;

        // Déconnecter l'observer précédent s'il existe
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        // Créer un nouvel observer
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    handleScroll();
                }
            },
            { threshold: 0.1 }
        );

        // Observer le dernier élément s'il existe
        if (lastTokenRef.current) {
            observerRef.current.observe(lastTokenRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [handleScroll, isLoading, displayedTokens]);

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="pb-4 flex-shrink-0">
                <div className="flex flex-col gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tokens..."
                            className="pl-8 focus-visible:ring-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Showing {displayedTokens.length} of {pageSize * totalPages} results
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-6 flex-1 overflow-y-auto min-h-0">
                <div className="flex flex-col gap-2">
                    {isLoading && displayedTokens.length === 0 ? (
                        Array.from({ length: 10 }).map((_, index) => (
                            <Button key={index} variant="outline" className="w-full h-auto flex items-center justify-between p-4" disabled>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>
                            </Button>
                        ))
                    ) : (
                        <>
                            {displayedTokens.map((token, index) => (
                                <div key={token.address} ref={index === displayedTokens.length - 1 ? lastTokenRef : null}>
                                    <Button
                                        variant={selectedToken?.address === token.address ? 'default' : 'outline'}
                                        className="w-full h-auto flex items-center justify-between p-4"
                                        onClick={() => onSelectToken(token)}
                                        disabled={selectedToken?.address === token.address}
                                    >
                                        <div className="flex items-start gap-2 overflow-hidden">
                                            <div className="flex-shrink-0 mt-1">
                                                {token.logoUrl ? (
                                                    <Image
                                                        src={token.logoUrl}
                                                        alt={`${token.shortName} logo`}
                                                        width={32}
                                                        height={32}
                                                        className="rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-accent" />
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 min-w-0 text-left">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="font-medium overflow-hidden text-ellipsis whitespace-nowrap block">
                                                                {token.shortName}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{token.shortName}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="text-sm text-secondary overflow-hidden text-ellipsis whitespace-nowrap block">
                                                                {token.address}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{token.address}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>
                                    </Button>
                                </div>
                            ))}
                            {isLoading && displayedTokens.length > 0 && (
                                <div className="py-2 flex justify-center">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export { TokenList };
