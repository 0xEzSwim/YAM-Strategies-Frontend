'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetModel } from '@/models';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useActiveOrders } from '../hooks/use-active-orders';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TokenDetailsProps {
    token: AssetModel | null;
    isLoading: boolean;
}

const stablecoins = [
    {
        symbol: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as `0x${string}`,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
        decimals: 6
    },
    {
        symbol: 'USDT',
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' as `0x${string}`,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
        decimals: 6
    }
];

export const TokenDetails = ({ token, isLoading: isTokenLoading }: TokenDetailsProps) => {
    const [selectedStablecoin, setSelectedStablecoin] = useState(stablecoins[0]);
    const [amount, setAmount] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const { activeOrder, isLoading: isOrderLoading, removeOrder } = useActiveOrders(token?.address);
    const isLoading = isTokenLoading || isOrderLoading;

    useEffect(() => {
        setIsEditing(false);
    }, [token?.address]);

    useEffect(() => {
        if (activeOrder && isEditing) {
            setAmount(activeOrder.orderAmount.toString());
            const orderStablecoin = stablecoins.find((s) => s.symbol === activeOrder.targetStablecoin);
            if (orderStablecoin) {
                setSelectedStablecoin(orderStablecoin);
            }
        }
    }, [activeOrder, isEditing]);

    const handleCreateNewOrder = async () => {
        if (!token?.address) return;

        try {
            await removeOrder(token.address);
            setAmount('');
            setSelectedStablecoin(stablecoins[0]);
        } catch (error) {
            console.error('Failed to remove order:', error);
        }
    };

    const handleCancelOrder = async () => {
        if (!token?.address) return;

        try {
            await removeOrder(token.address);
            setAmount('');
            setSelectedStablecoin(stablecoins[0]);
        } catch (error) {
            console.error('Failed to cancel order:', error);
        }
    };

    if (isLoading) {
        return (
            <Card className="h-full flex flex-col">
                <CardHeader className="flex-none">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 flex-1 overflow-y-auto min-h-0">
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-4 items-end">
                            <div>
                                <Skeleton className="h-4 w-20 mb-2" />
                                <div className="p-2 rounded-lg border bg-muted">
                                    <div className="flex items-center gap-2 h-7">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>
                                <Skeleton className="h-3 w-32 mt-1" />
                            </div>

                            <div>
                                <Skeleton className="h-4 w-20 mb-2" />
                                <div className="flex items-center gap-2 p-1 rounded-lg border bg-muted">
                                    <Skeleton className="h-9 flex-1" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                                <Skeleton className="h-3 w-32 mt-1" />
                            </div>

                            <div className="self-center flex justify-center gap-4">
                                <Skeleton className="h-8 w-8 rounded" />
                            </div>

                            <div>
                                <Skeleton className="h-4 w-20 mb-2" />
                                <div className="flex items-center gap-2 p-1 rounded-lg border bg-muted">
                                    <div className="flex items-center gap-2 h-9 w-full px-2">
                                        <Skeleton className="h-6 w-6 rounded-full" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>
                                <Skeleton className="h-3 w-32 mt-1" />
                            </div>

                            <div>
                                <Skeleton className="h-4 w-20 mb-2" />
                                <div className="p-2 rounded-lg border bg-muted">
                                    <div className="flex items-center gap-2 h-7">
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                                <Skeleton className="h-3 w-32 mt-1" />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-11 w-full" />
                </CardFooter>
            </Card>
        );
    }

    if (!token) {
        return (
            <Card className="h-full flex flex-col">
                <CardContent className="p-6 flex-1 overflow-y-auto min-h-0">
                    <div className="flex flex-col gap-6">
                        <div className="text-center text-muted-foreground">No token selected</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value) || value === '') {
            setAmount(value);
        }
    };

    const handleMaxClick = () => {
        if (token) {
            setAmount(token.supply.toString());
        }
    };

    return (
        <Card className="h-full flex flex-col">
            {activeOrder && !isEditing ? (
                <>
                    <CardHeader className="flex-none space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <CardTitle>Sell Order</CardTitle>
                                    <Badge
                                        variant="secondary"
                                        className={`font-normal ${
                                            activeOrder.filledAmount === activeOrder.orderAmount
                                                ? 'bg-green-100 text-green-700 hover:bg-green-100'
                                                : 'bg-orange-100 text-orange-700 hover:bg-orange-100'
                                        }`}
                                    >
                                        {activeOrder.filledAmount === activeOrder.orderAmount ? 'Completed' : 'In Progress'}
                                    </Badge>
                                </div>
                                <CardDescription>
                                    {activeOrder.filledAmount.toFixed(2)} / {activeOrder.orderAmount.toFixed(2)}{' '}
                                    <span className="font-bold">{token.symbol}</span> filled at {activeOrder.pricePerToken.toFixed(2)}{' '}
                                    <span className="font-bold">{activeOrder.targetStablecoin}</span>
                                </CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="font-medium">{((activeOrder.filledAmount / activeOrder.orderAmount) * 100).toFixed(2)}%</div>
                                <div className="text-xs text-muted-foreground">
                                    {(activeOrder.orderAmount - activeOrder.filledAmount).toFixed(2)} {token.symbol} remaining
                                </div>
                            </div>
                        </div>
                        <Progress
                            value={(activeOrder.filledAmount / activeOrder.orderAmount) * 100}
                            className={`h-2 ${
                                activeOrder.filledAmount === activeOrder.orderAmount ? '[&>div]:bg-green-500' : '[&>div]:bg-orange-500'
                            }`}
                        />
                    </CardHeader>
                    <CardContent className="p-6 flex-1 overflow-y-auto min-h-0">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-blue-500 p-4 rounded-lg border border-blue-200 bg-blue-50">
                                <div className="rounded-full w-2 h-2 bg-blue-500 flex-shrink-0" />
                                <div className="text-sm">
                                    {activeOrder.filledAmount === activeOrder.orderAmount ? (
                                        <>
                                            Your <span className="font-bold">{activeOrder.tokenSymbol}</span> sell order has been completely filled.
                                            You can create a new sell order for this token.
                                        </>
                                    ) : (
                                        <>
                                            You have an active sell order for <span className="font-bold">{activeOrder.tokenSymbol}</span>. You can
                                            edit the order and increase the amount or cancel it.
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        {activeOrder.filledAmount === activeOrder.orderAmount ? (
                            <Button className="w-full" onClick={handleCreateNewOrder}>
                                Create New Sell Order
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" className="flex-1" onClick={() => setIsEditing(true)}>
                                    Edit Sell Order
                                </Button>
                                <Button variant="destructive" className="flex-1" onClick={handleCancelOrder}>
                                    Cancel Sell Order
                                </Button>
                            </>
                        )}
                    </CardFooter>
                </>
            ) : (
                <>
                    {activeOrder ? (
                        <CardHeader className="flex-none space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle>Sell Order</CardTitle>
                                        <Badge
                                            variant="secondary"
                                            className={
                                                activeOrder.orderAmount >= parseFloat(amount || '0')
                                                    ? 'font-normal bg-red-100 text-red-700 hover:bg-red-100'
                                                    : 'font-normal bg-blue-100 text-blue-700 hover:bg-blue-100'
                                            }
                                        >
                                            Editing
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        {activeOrder.filledAmount.toFixed(2)} / {parseFloat(amount || '0').toFixed(2)}{' '}
                                        <span className="font-bold">{token.symbol}</span> filled at {activeOrder.pricePerToken.toFixed(2)}{' '}
                                        <span className="font-bold">{activeOrder.targetStablecoin}</span>
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">{((activeOrder.filledAmount / parseFloat(amount || '0')) * 100).toFixed(2)}%</div>
                                    <div className="text-xs text-muted-foreground">
                                        {((parseFloat(amount || '0') || activeOrder.orderAmount) - activeOrder.filledAmount).toFixed(2)}{' '}
                                        {token.symbol} remaining
                                    </div>
                                </div>
                            </div>
                            <Progress
                                value={
                                    activeOrder.filledAmount >= parseFloat(amount || '0')
                                        ? 100
                                        : (activeOrder.filledAmount / parseFloat(amount || '0')) * 100
                                }
                                className={`h-2 ${
                                    activeOrder.orderAmount >= parseFloat(amount || '0') ? '[&>div]:bg-red-500' : '[&>div]:bg-blue-500'
                                }`}
                            />
                        </CardHeader>
                    ) : (
                        <CardHeader className="flex-none space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle>Sell Order</CardTitle>
                                        <Badge variant="outline" className="font-normal">
                                            New Order
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        Place a new sell order for your <span className="font-bold">{token.symbol}</span> tokens
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-blue-500 p-4 rounded-lg border border-blue-200 bg-blue-50">
                                <div className="rounded-full w-2 h-2 bg-blue-500 flex-shrink-0" />
                                <div className="text-sm">
                                    You can sell your <span className="font-bold">{token.symbol}</span> tokens for stablecoins at market price{' '}
                                    <TooltipProvider delayDuration={150}>
                                        <Tooltip>
                                            <TooltipTrigger className="underline decoration-dotted">minus applicable fees</TooltipTrigger>
                                            <TooltipContent className="w-80">
                                                <ul className="list-disc pl-4 space-y-1">
                                                    <li>
                                                        Vacancy fee (5%): RealT assesses an additional fee when buying back properties with vacant
                                                        units. Vacancy Fee = 5% * Vacant Units / Total Units
                                                    </li>
                                                    <li>Liquidity provider fee (1%)</li>
                                                    <li>Platform fee (1%)</li>
                                                </ul>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        </CardHeader>
                    )}
                    <CardContent className="p-6 flex-1 overflow-y-auto min-h-0">
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-4 items-end">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">From wallet</label>
                                    <div className="p-2 rounded-lg border bg-muted">
                                        <div className="flex items-center gap-2 h-7">
                                            {token.logoUrl && (
                                                <Image
                                                    src={token.logoUrl}
                                                    alt={`${token.symbol} logo`}
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full"
                                                />
                                            )}
                                            <span className="font-medium truncate">{token.symbol}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 truncate">You have {token.supply.toFixed(2)}</div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Amount</label>
                                    <div className="flex items-center gap-2 p-1 rounded-lg border bg-muted">
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            className="text-md font-medium bg-transparent focus-visible:ring-0 shadow-none border-0 p-0 pl-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            value={amount}
                                            onChange={handleAmountChange}
                                        />
                                        <Button size="sm" className="m-0 ml-2 mr-2" onClick={handleMaxClick}>
                                            Max
                                        </Button>
                                    </div>
                                    {isEditing && activeOrder && (
                                        <div className="text-xs text-orange-600 mt-1">
                                            Minimum amount: {activeOrder.orderAmount} {token?.symbol}
                                        </div>
                                    )}
                                    <div className="text-xs text-muted-foreground mt-1 truncate">$0.00</div>
                                </div>

                                <div className="self-center flex justify-center gap-4">
                                    <ArrowDown className="block w-8 h-8 text-muted-foreground" />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">To Wallet</label>
                                    <div className="flex items-center gap-2 p-1 rounded-lg border bg-muted">
                                        <Select
                                            value={selectedStablecoin.symbol}
                                            onValueChange={(value: string) => setSelectedStablecoin(stablecoins.find((s) => s.symbol === value)!)}
                                            disabled={isEditing}
                                        >
                                            <SelectTrigger className="text-md font-medium bg-transparent focus:ring-0 focus:ring-offset-0 shadow-none border-0 p-0 pl-2 [appearance:textfield]">
                                                <SelectValue>
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src={selectedStablecoin.logoUrl}
                                                            alt={`${selectedStablecoin.symbol} logo`}
                                                            width={24}
                                                            height={24}
                                                            className="rounded-full"
                                                        />
                                                        {selectedStablecoin.symbol}
                                                    </div>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stablecoins.map((stablecoin) => (
                                                    <SelectItem key={stablecoin.address} value={stablecoin.symbol}>
                                                        <div className="flex items-center gap-2">
                                                            <Image
                                                                src={stablecoin.logoUrl}
                                                                alt={`${stablecoin.symbol} logo`}
                                                                width={24}
                                                                height={24}
                                                                className="rounded-full"
                                                            />
                                                            {stablecoin.symbol}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 truncate">
                                        1 {token.symbol} = 0.00 {selectedStablecoin.symbol}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">You will receive</label>
                                    <div className="p-2 rounded-lg border bg-muted">
                                        <div className="flex items-center gap-2 h-7">
                                            <span className="font-medium truncate">0.00</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 truncate">$0.00</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                                <Button className="flex-1" disabled={activeOrder && Number(amount) <= activeOrder.orderAmount}>
                                    Update Sell Order
                                </Button>
                            </>
                        ) : (
                            <Button className="w-full">Place Sell Order</Button>
                        )}
                    </CardFooter>
                </>
            )}
        </Card>
    );
};
