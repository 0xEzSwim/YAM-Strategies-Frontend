'use client';

import { AssetModel } from '@/models';

// Components
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DEFAULT_TOKEN_IMAGE = '/logo.png';

interface UserLiquidityToken {
    offerTokens: string;
    buyerTokens: string;
    availableAmount: number;
}

interface ActiveLiquidityProps {
    stablecoins: AssetModel[];
    userLiquidityTokens: UserLiquidityToken[];
    isStablecoinsLoading: boolean;
    onFilterChange: (tokenAddresses: string[]) => void;
}

const ActiveLiquidity = ({ stablecoins, userLiquidityTokens, isStablecoinsLoading, onFilterChange }: ActiveLiquidityProps) => {
    const handleStablecoinClick = (stablecoin: AssetModel) => {
        const filteredTokens = userLiquidityTokens
            .filter((liquidity) => liquidity.offerTokens === stablecoin.address)
            .map((liquidity) => liquidity.buyerTokens);
        onFilterChange(filteredTokens);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Liquidity</CardTitle>
                <CardDescription>Your active liquidity positions</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {isStablecoinsLoading ? (
                        <Skeleton className="h-9 w-24" />
                    ) : (
                        stablecoins.map((stablecoin) => {
                            const liquidityCount = userLiquidityTokens.filter((liquidity) => liquidity.offerTokens === stablecoin.address).length;

                            if (liquidityCount === 0) return null;

                            return (
                                <Button
                                    key={stablecoin.address}
                                    variant="outline"
                                    onClick={() => handleStablecoinClick(stablecoin)}
                                    className="flex items-center gap-2"
                                >
                                    <Image
                                        src={stablecoin.logoUrl || DEFAULT_TOKEN_IMAGE}
                                        alt={stablecoin.shortName}
                                        width={20}
                                        height={20}
                                        className="rounded-full"
                                    />
                                    <span>{stablecoin.shortName}</span>
                                    <Badge variant="secondary">{liquidityCount}</Badge>
                                </Button>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export { ActiveLiquidity };
