'use client';

import { config } from '@/config';
import { useCallback, useEffect, useState } from 'react';
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { readContract } from '@wagmi/core';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    Origami,
    ChevronDown,
    ArrowUpFromLine,
    ArrowDownToLine,
    ChevronUp,
    Copy,
    DollarSign,
    File,
    HandCoins,
    ArrowDown,
    MoveRight,
    Percent,
    PieChart as PieChartIcon,
    Landmark,
    Tractor,
    Power
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PagePlaceholder } from '@/components/page-placeholder';
import { usePathname } from 'next/navigation';
import { StrategyModel } from '@/models';
import { erc20Abi } from 'viem';
import { convertNumberToBigInt } from '@/lib';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA600', '#9B59B6', '#5DAE8B', '#FF8C94', '#66BB6A', '#FFA726', '#5C6BC0'];

interface ICopyToClipboard {
    /** HTML reference identifier ```<div id="foo"></div>```  */
    target?: string;
    /** String value */
    value?: string;
    /** (Optional) message to display in snackbar on success */
    message?: string;
}

const CustomTooltip = ({ active, payload }) => {
    if (active && !!payload?.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-background border border-border p-2 rounded-md shadow-md">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `${data.fill}` }} />
                    <span className="text-muted-foreground">{data.symbol}</span>
                </div>
                <p className="text-sm font-medium">{`${(data.allocation * 100).toFixed(2)}%`}</p>
            </div>
        );
    }
    return null;
};

const Strategy = () => {
    const { isConnected, address } = useAccount();
    const pathname = usePathname();
    const [strategyAddress, setStrategyAddress] = useState<`0x${string}` | undefined>();
    useEffect(() => {
        const paths = pathname.split('/').reduce((paths: string[], path: string) => {
            if (path !== '') {
                paths.push(decodeURI(path));
            }
            return paths;
        }, []);
        setStrategyAddress(paths[paths.length - 1] as `0x${string}`);
    }, [pathname]);
    const { data: hash, writeContract } = useWriteContract();
    const { isLoading: isTxPending, isSuccess: isTxConfirmed, isError: isTxFailed } = useWaitForTransactionReceipt({ hash });
    const {
        strategy,
        topHoldings,
        topHoldingsLength,
        pieChartData,
        lastUpdate,
        isLoading: isStrategyLoading
    } = useStrategy(strategyAddress, isTxConfirmed);
    const { userHolding } = useUserHolding(address, strategy, isTxConfirmed);
    const [showAllAssets, setShowAllAssets] = useState(false);
    const displayedHoldings = showAllAssets ? strategy.holdings : topHoldings;
    const [inputAmountValue, setInputAmountValue] = useState('');
    useToastAlert(isTxPending, isTxFailed, isTxConfirmed);
    const {
        userUnderlyingAssetBalance,
        userUnderlyingAssetPrice,
        isLoading: isBalanceLoading
    } = useUserUnderlyingAssetBalance(address, strategy, isTxConfirmed);
    const { userUnderlyingAssetAllowance, isLoading: isAllowanceLoading } = useUserUnderlyingAssetAllowance(address, strategy, isTxConfirmed);
    const isApprovedDisabled = !isConnected || strategy.isPaused || !inputAmountValue || parseFloat(inputAmountValue) <= 0 || isTxPending;
    const isDepositDisabled = isApprovedDisabled || parseFloat(inputAmountValue) > userUnderlyingAssetBalance;
    const isWithdrawDisabled = isApprovedDisabled || parseFloat(inputAmountValue) > userHolding;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value) || value === '') {
            setInputAmountValue(value);
        }
    };

    const handleDepositMaxClick = () => {
        if (!isConnected) {
            return;
        }
        setInputAmountValue(userUnderlyingAssetBalance.toString());
    };

    const handleWithdrawMaxClick = () => {
        if (!isConnected) {
            return;
        }
        setInputAmountValue(userHolding.toString());
    };

    const calculateSentValue = () => {
        const amount = parseFloat(inputAmountValue) || 0;
        return (amount * userUnderlyingAssetPrice).toFixed(2);
    };

    const calculateReceiveAmount = () => {
        const amount = parseFloat(inputAmountValue) || 0;
        const exchangeRate = 0.95;
        return (amount * exchangeRate).toFixed(2);
    };

    const calculateReceivedValue = () => {
        const amount = parseFloat(calculateReceiveAmount());
        const exchangeRate = 0.95;
        return (userUnderlyingAssetPrice * (amount / exchangeRate)).toFixed(2);
    };

    //#region Approve, Deposit, WIthdraw Funds
    const approve = (strategy: StrategyModel, amount?: number) => {
        if (!isConnected) {
            toast.error('Connection Error', { description: 'You are not connected.' });
            return;
        }

        if (!amount) {
            toast.error('Amount Error', { description: 'Amount to approve is too small.' });
            return;
        }
        writeContract(
            {
                address: strategy.underlyingAsset.address,
                abi: erc20Abi,
                functionName: 'approve',
                args: [strategy.share.address, convertNumberToBigInt(amount, strategy.underlyingAsset.decimals)]
            },
            {
                onError(error: any) {
                    toast.error(error.name, { description: error.shortMessage || error.message });
                }
            }
        );
    };

    const deposit = (strategy: StrategyModel, amount?: number, receiver?: `0x${string}`) => {
        if (!isConnected) {
            toast.error('Connection Error', { description: 'You are not connected.' });
            return;
        }

        if (!amount) {
            toast.error('Amount Error', { description: 'Amount to deposit is too small.' });
            return;
        }
        writeContract(
            {
                address: strategy.share.address,
                abi: strategy.contractAbi,
                functionName: 'deposit',
                args: [convertNumberToBigInt(amount, strategy.underlyingAsset.decimals), receiver ?? address!]
            },
            {
                onError(error: any) {
                    toast.error(error.name, { description: error.shortMessage || error.message });
                }
            }
        );
    };

    const redeem = (strategy: StrategyModel, amount?: number, receiver?: `0x${string}`) => {
        if (!isConnected) {
            toast.error('Connection Error', { description: 'You are not connected.' });
            return;
        }

        if (!amount) {
            toast.error('Amount Error', { description: 'Amount to redeem is too small.' });
            return;
        }
        const addressToReceiveTokens = receiver ?? address!;
        writeContract(
            {
                address: strategy.share.address,
                abi: strategy.contractAbi,
                functionName: 'redeem',
                args: [convertNumberToBigInt(amount, strategy.share.decimals), addressToReceiveTokens, addressToReceiveTokens]
            },
            {
                onError(error: any) {
                    toast.error(error.name, { description: error.shortMessage || error.message });
                }
            }
        );
    };
    //#endregion

    const copyToClipboard = async ({ target, message, value }: ICopyToClipboard) => {
        try {
            let copyValue = '';

            if (!navigator.clipboard) {
                throw new Error("Browser don't have support for native clipboard.");
            }

            if (target) {
                const node = document.querySelector(target);

                if (!node || !node.textContent) {
                    throw new Error('Element not found');
                }

                value = node.textContent;
            }

            if (value) {
                copyValue = value;
            }

            await navigator.clipboard.writeText(copyValue);
            toast.info('Copied to clipboard!', { description: message });
        } catch (error) {
            toast.error('Clipboard Error', { description: 'Could not copy to clipboard.' });
        }
    };

    const displayHoldingsTab = (): boolean => {
        return !!strategy?.holdings?.length;
    };

    if (!strategy?.name && isStrategyLoading) {
        return <PagePlaceholder></PagePlaceholder>;
    }

    return (
        <>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdate.toLocaleString()}</p>
            <div>
                <h1 className="text-4xl font-bold mb-4">{strategy.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <code id="contract-address" className="text-xs">
                        {strategyAddress}
                    </code>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard({ target: '#contract-address' })}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">
                        <div className="flex items-center">
                            <Power className={`h-4 w-4 mr-2 text-${strategy.isPaused ? 'orange' : 'green'}-500`} />
                            {strategy.isPaused ? 'Paused' : 'Active'}
                        </div>
                    </Badge>
                    <Badge variant="secondary">{strategy.underlyingAsset.symbol}</Badge>
                </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(strategy.tvl ?? 0).toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Historical Annual Percentage Yield</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${strategy.apy ? 'text-green-500' : 'text-red-500'}`}>
                            {((strategy.apy ?? 0) * 100).toFixed(2)}%
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Your Holdings</CardTitle>
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userHolding.toFixed(6)}</div>
                        <div className="text-sm text-muted-foreground">
                            You own ~{((userHolding / strategy.share.supply) * 100).toFixed(2)}% of the supply
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardContent className="p-6">
                    <Tabs defaultValue="deposit">
                        <TabsList className="mb-6">
                            <TabsTrigger value="deposit">
                                <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                                    <ArrowUpFromLine className="h-4 w-4" />
                                    <span>Deposit</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger value="withdraw">
                                <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                                    <ArrowDownToLine className="h-4 w-4" />
                                    <span>Withdraw</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="deposit" className="m-0">
                            <div className="grid gap-4">
                                <div className="grid md:grid-cols-9 gap-4 items-end">
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium mb-2 block">From wallet</label>
                                        <div className="p-2 rounded-lg border bg-muted">
                                            <div className="flex items-center gap-2 h-7">
                                                {strategy.underlyingAsset.logoUrl ? (
                                                    <img
                                                        src={strategy.underlyingAsset.logoUrl}
                                                        alt={`${strategy.underlyingAsset.symbol} logo`}
                                                        className="h-6 w-6 rounded-full bg-blue-500"
                                                    />
                                                ) : (
                                                    <div className="h-6 w-6 rounded-full bg-blue-500" />
                                                )}
                                                <span className="font-medium truncate">{strategy.underlyingAsset.symbol}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 truncate">
                                            You have {userUnderlyingAssetBalance.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium mb-2 block">Amount</label>
                                        <div className="flex items-center gap-2 p-1 rounded-lg border bg-muted">
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                className="text-md font-medium bg-transparent focus-visible:ring-0 shadow-none border-0 p-0 pl-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                value={inputAmountValue}
                                                onChange={handleInputChange}
                                            />
                                            <Button size="sm" className="m-0 ml-2 mr-2" onClick={handleDepositMaxClick}>
                                                Max
                                            </Button>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 truncate">${calculateSentValue()}</div>
                                    </div>
                                    <div className="md:col-span-1 self-center flex justify-center gap-4">
                                        <MoveRight className="hidden md:block w-12 h-12 text-muted-foreground" />
                                        <ArrowDown className="block md:hidden w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium mb-2 block">To vault</label>
                                        <div className="p-2 rounded-lg border bg-muted">
                                            <div className="flex items-center gap-2 h-7">
                                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                                                    <Origami className="h-4" />
                                                </div>
                                                <span className="font-medium truncate">{strategy.share.symbol}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 truncate">You have {userHolding.toFixed(2)}</div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium mb-2 block">You will receive</label>
                                        <div className="p-2 rounded-lg border bg-muted">
                                            <div className="flex items-center gap-2 h-7">
                                                <span className="font-medium truncate">{calculateReceiveAmount()}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 truncate">${calculateReceivedValue()}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-center justify-end gap-4 mt-4">
                                    {userUnderlyingAssetAllowance && userUnderlyingAssetAllowance >= parseFloat(inputAmountValue) ? (
                                        <Button
                                            className="w-full md:w-auto"
                                            disabled={isDepositDisabled}
                                            onClick={() => deposit(strategy, parseFloat(inputAmountValue))}
                                        >
                                            Deposit
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full md:w-auto"
                                            disabled={isApprovedDisabled}
                                            onClick={() => approve(strategy, parseFloat(inputAmountValue))}
                                        >
                                            Approve
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="withdraw" className="m-0">
                            <div className="grid gap-4">
                                <div className="grid md:grid-cols-9 gap-4 items-end">
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium mb-2 block">From vault</label>
                                        <div className="p-2 rounded-lg border bg-muted">
                                            <div className="flex items-center gap-2 h-7">
                                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                                                    <Origami className="h-4" />
                                                </div>
                                                <span className="font-medium truncate">{strategy.share.symbol}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 truncate">You have {userHolding.toFixed(2)}</div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium mb-2 block">Amount</label>
                                        <div className="flex items-center gap-2 p-1 rounded-lg border bg-muted">
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                className="text-md font-medium bg-transparent focus-visible:ring-0 shadow-none border-0 p-0 pl-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                value={inputAmountValue}
                                                onChange={handleInputChange}
                                            />
                                            <Button size="sm" className="m-0 ml-2 mr-2" onClick={handleWithdrawMaxClick}>
                                                Max
                                            </Button>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 truncate">${calculateSentValue()}</div>
                                    </div>
                                    <div className="md:col-span-1 self-center flex justify-center gap-4">
                                        <MoveRight className="hidden md:block w-12 h-12 text-muted-foreground" />
                                        <ArrowDown className="block md:hidden w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <div className="md:col-span-2">
                                        {/* <MoveRight className="hidden md:block w-8 h-8 text-muted-foreground" /> */}
                                        <label className="text-sm font-medium mb-2 block">To wallet</label>
                                        <div className="p-2 rounded-lg border bg-muted">
                                            <div className="flex items-center gap-2 h-7">
                                                {strategy.underlyingAsset.logoUrl ? (
                                                    <img
                                                        src={strategy.underlyingAsset.logoUrl}
                                                        alt={`${strategy.underlyingAsset.symbol} logo`}
                                                        className="h-6 w-6 rounded-full bg-blue-500"
                                                    />
                                                ) : (
                                                    <div className="h-6 w-6 rounded-full bg-blue-500" />
                                                )}
                                                <span className="font-medium truncate">{strategy.underlyingAsset.symbol}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 truncate">
                                            You have {userUnderlyingAssetBalance.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium mb-2 block">You will receive</label>
                                        <div className="p-2 rounded-lg border bg-muted">
                                            <div className="flex items-center gap-2 h-7">
                                                <span className="font-medium truncate">{calculateReceiveAmount()}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1 truncate">${calculateReceivedValue()}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-center justify-end gap-4 mt-4">
                                    <Button
                                        className="w-full md:w-auto"
                                        disabled={isWithdrawDisabled}
                                        onClick={() => redeem(strategy, parseFloat(inputAmountValue))}
                                    >
                                        Withdraw
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6">
                    <Tabs defaultValue="sumary">
                        <TabsList className="mb-6">
                            <TabsTrigger value="sumary">
                                <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                                    <File className="h-4 w-4" />
                                    <span>Summary</span>
                                </div>
                            </TabsTrigger>
                            {displayHoldingsTab() && (
                                <TabsTrigger value="compositions">
                                    <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                                        <PieChartIcon className="h-4 w-4" />
                                        <span>Compositions</span>
                                    </div>
                                </TabsTrigger>
                            )}
                            <TabsTrigger value="fees">
                                <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                                    <HandCoins className="h-4 w-4" />
                                    <span>Fees</span>
                                </div>
                            </TabsTrigger>
                            {/* <TabsTrigger value="harvests">
                                <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                                    <Tractor className="h-4 w-4" />
                                    <span>Harvests</span>
                                </div>
                            </TabsTrigger> */}
                        </TabsList>
                        <TabsContent value="sumary" className="m-0">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                                    <p className="text-md">{strategy.description}</p>
                                    <h4 className="text-md font-semibold mt-6">Strategy details</h4>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                        <span>
                                            Address: <code>{strategyAddress}</code>
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => copyToClipboard({ target: '#contract-address' })}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <span className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                        Token Symbol: <code>{strategy.share.symbol}</code>
                                    </span>
                                    <span className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                        Circulating Supply: <code>{strategy.share.supply}</code>
                                    </span>
                                    <span className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                        Status:{' '}
                                        <code className={`text-${strategy.isPaused ? 'orange' : 'green'}-500`}>
                                            {strategy.isPaused ? 'Paused' : 'Active'}
                                        </code>
                                    </span>
                                    <h4 className="text-md font-semibold mt-6">Underlying Asset details</h4>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                        <span>
                                            Address: <code id="underlying-asset-address">{strategy.underlyingAsset.address}</code>
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => copyToClipboard({ target: '#underlying-asset-address' })}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <span className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                        Token Symbol: <code>{strategy.underlyingAsset.symbol}</code>
                                    </span>
                                </div>
                                <div></div>
                            </div>
                        </TabsContent>
                        {displayHoldingsTab() && (
                            <TabsContent value="compositions" className="mt-6">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={pieChartData}
                                                            cx="50%"
                                                            cy="50%"
                                                            fill="#808080"
                                                            nameKey="symbol"
                                                            dataKey="allocation"
                                                        >
                                                            {pieChartData.map((entry, index) => (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={index >= topHoldings.length ? '#808080' : COLORS[index % COLORS.length]}
                                                                />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip content={<CustomTooltip active={false} payload={undefined} />} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Asset</TableHead>
                                                            <TableHead className="text-right">Avg. Aquisition Price</TableHead>
                                                            <TableHead className="text-right">Amount</TableHead>
                                                            <TableHead className="text-right">Allocations</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {displayedHoldings!.map((holding, index) => (
                                                            <TableRow key={holding.symbol}>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-1">
                                                                        <div
                                                                            className="w-4 h-4 rounded-full"
                                                                            style={{
                                                                                backgroundColor: `${
                                                                                    index >= topHoldings.length
                                                                                        ? '#808080'
                                                                                        : COLORS[index % COLORS.length]
                                                                                }`
                                                                            }}
                                                                        />
                                                                        <span className="text-muted-foreground">{holding.symbol}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right">${holding.value}</TableCell>
                                                                <TableCell className="text-right">{holding.amount}</TableCell>
                                                                <TableCell className="text-right">{(holding.allocation * 100).toFixed(2)}%</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                                {strategy.holdings && strategy.holdings.length > topHoldingsLength && (
                                                    <div className="mt-4 text-center">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setShowAllAssets(!showAllAssets)}
                                                            className="w-full md:w-auto"
                                                        >
                                                            {showAllAssets ? (
                                                                <>
                                                                    <ChevronUp className="w-4 h-4 mr-2" />
                                                                    Hide other assets
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ChevronDown className="w-4 h-4 mr-2" />
                                                                    See all assets
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        )}
                        <TabsContent value="fees" className="mt-6">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Fees</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <div className="text-sm text-muted-foreground mb-1">Deposit/Withdrawal fee</div>
                                            <div className="text-xl font-semibold">0%</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground mb-1">Management fee</div>
                                            <div className="text-xl font-semibold">0%</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground mb-1">Performance fee</div>
                                            <div className="text-xl font-semibold">0%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </>
    );
};

const useStrategy = (strategyAddress?: `0x${string}`, isTxConfirmed?: boolean) => {
    const [strategy, setStrategy] = useState({} as StrategyModel);
    const [topHoldingsLength, setTopHoldingsLength] = useState(5);
    const [topHoldings, setTopHoldings] = useState(
        [] as { symbol: string; address: `0x${string}`; value: number; amount: number; allocation: number }[]
    );
    const [otherHoldings, setOtherHoldings] = useState(
        [] as { symbol: string; address: `0x${string}`; value: number; amount: number; allocation: number }[]
    );
    const [pieChartData, setPieChartData] = useState(
        [] as { symbol: string; address: `0x${string}`; value: number; amount: number; allocation: number }[]
    );
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [isLoading, setLoading] = useState(true);

    const orderHoldingsByAllocation = (strategy: StrategyModel) => {
        let strategyTvl: number = strategy.tvl ?? strategy.holdings!.reduce((sum, holding) => sum + holding.amount * holding.value, 0);

        strategy.holdings = strategy.holdings!.map((holding) => {
            return { ...holding, allocation: (holding.amount * holding.value) / strategyTvl };
        });
        strategy.holdings = [...strategy.holdings].sort((a, b) => b.allocation - a.allocation);

        return strategy;
    };

    const getOrderedStrategy = async (strategyAddress: `0x${string}`) => {
        const params = new URLSearchParams({ address: strategyAddress, logo: 'true' }).toString();
        const response = await fetch(`https://${config.SERVER_HOSTNAME}:${config.HTTPS_SERVER_PORT}/main/strategy?${params}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const jsonResponse = (await response.json()) as { data?: StrategyModel; error?: any };
        if (jsonResponse.error) {
            toast.error(jsonResponse.error.name, { description: jsonResponse.error.message });
            console.error(jsonResponse.error);
            return;
        }
        let strategy: StrategyModel = jsonResponse.data!;
        // Remove when Backend is good
        // strategy.holdings = [
        //     { symbol: 'USDC', address: '0x', value: 1, amount: 2000, allocation: 0 },
        //     { symbol: 'CSM-ALPHA', address: '0x', value: 14.5, amount: 100, allocation: 0 },
        //     { symbol: 'CSM-BETA', address: '0x', value: 15, amount: 100, allocation: 0 },
        //     { symbol: 'CSM-OMEGA', address: '0x', value: 16, amount: 100, allocation: 0 },
        //     { symbol: 'CSM-GAMMA', address: '0x', value: 20, amount: 100, allocation: 0 },
        //     { symbol: 'CSM-DELTA', address: '0x', value: 7.6, amount: 100, allocation: 0 },
        //     { symbol: 'CSM-A', address: '0x', value: 10, amount: 10, allocation: 0 },
        //     { symbol: 'CSM-B', address: '0x', value: 10, amount: 10, allocation: 0 },
        //     { symbol: 'CSM-C', address: '0x', value: 10, amount: 10, allocation: 0 },
        //     { symbol: 'CSM-D', address: '0x', value: 10, amount: 10, allocation: 0 },
        //     { symbol: 'CSM-E', address: '0x', value: 10, amount: 10, allocation: 0 },
        //     { symbol: 'CSM-F', address: '0x', value: 10, amount: 10, allocation: 0 },
        //     { symbol: 'CSM-G', address: '0x', value: 10, amount: 10, allocation: 0 },
        //     { symbol: 'CSM-H', address: '0x', value: 10, amount: 10, allocation: 0 },
        //     { symbol: 'CSM-I', address: '0x', value: 10, amount: 10, allocation: 0 },
        //     { symbol: 'CSM-J', address: '0x', value: 10, amount: 10, allocation: 0 }
        // ];
        strategy = orderHoldingsByAllocation(strategy);
        return strategy;
    };

    const fetchData = useCallback(async (strategyAddress: `0x${string}`) => {
        setLoading(true);
        const _strategy: StrategyModel | undefined = await getOrderedStrategy(strategyAddress);
        if (!_strategy) {
            return;
        }

        const top = _strategy.holdings!.slice(0, topHoldingsLength);
        const other = _strategy.holdings!.slice(topHoldingsLength);
        const otherAllocation = other.reduce((sum, holding) => sum + holding.allocation, 0);
        setStrategy(_strategy);
        setTopHoldings(top);
        setOtherHoldings(other);
        setPieChartData([...top, { symbol: 'Other', address: '0x', value: 0, amount: 0, allocation: otherAllocation }]);
        setLastUpdate(new Date());
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!strategyAddress) {
            return;
        }

        fetchData(strategyAddress).catch(console.error);
    }, [strategyAddress, isTxConfirmed]);

    return { strategy, topHoldings, topHoldingsLength, otherHoldings, pieChartData, lastUpdate, isLoading };
};

const useUserHolding = (userAddress?: `0x${string}`, strategy?: StrategyModel, isTxConfirmed?: boolean) => {
    const [userHolding, setUserHolding] = useState(0);
    const [isLoading, setLoading] = useState(true);

    const getUserStrategyHolding = async (userAddress: `0x${string}`, strategy: StrategyModel) => {
        const userHoldingResult: bigint = (await readContract(config.BLOCKCHAIN_CLIENT, {
            address: strategy.share.address,
            abi: strategy.contractAbi,
            functionName: 'balanceOf',
            args: [userAddress]
        })) as bigint;

        return Number(userHoldingResult) / 10 ** strategy.share.decimals;
    };

    const fetchData = useCallback(async (userAddress: `0x${string}`, strategy: StrategyModel) => {
        setLoading(true);
        setUserHolding(await getUserStrategyHolding(userAddress, strategy));
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!userAddress || !strategy?.name) {
            return;
        }

        fetchData(userAddress, strategy).catch(console.error);
    }, [userAddress, strategy, isTxConfirmed]);

    return { userHolding, isLoading };
};

const useUserUnderlyingAssetBalance = (userAddress?: `0x${string}`, strategy?: StrategyModel, isTxConfirmed?: boolean) => {
    const [userUnderlyingAssetBalance, setuseUserUnderlyingAssetBalance] = useState(0);
    const [userUnderlyingAssetPrice, setuseUserUnderlyingAssetPrice] = useState(0);
    const [isLoading, setLoading] = useState(true);

    const getUnderlyingAssetPrice = async (address: `0x${string}`) => {
        const params = new URLSearchParams({ address: address }).toString();
        const response = await fetch(`https://${config.SERVER_HOSTNAME}:${config.HTTPS_SERVER_PORT}/crypto-market/latest-price?${params}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const jsonResponse = (await response.json()) as { data?: number; error?: any };
        if (jsonResponse.error) {
            toast.error(jsonResponse.error.name, { description: jsonResponse.error.message });
            console.error(jsonResponse.error);
            return;
        }

        return jsonResponse.data!;
    };

    const getUserUnderlyingAssetBalance = async (userAddress: `0x${string}`, strategy: StrategyModel) => {
        const balanceResult: bigint = (await readContract(config.BLOCKCHAIN_CLIENT, {
            address: strategy.underlyingAsset.address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [userAddress]
        })) as bigint;

        return Number(balanceResult) / 10 ** strategy.underlyingAsset.decimals;
    };

    const fetchData = useCallback(async (userAddress: `0x${string}`, strategy: StrategyModel) => {
        setLoading(true);
        setuseUserUnderlyingAssetBalance(await getUserUnderlyingAssetBalance(userAddress, strategy));
        const assetPrice = await getUnderlyingAssetPrice(strategy.underlyingAsset.address);
        if (!assetPrice) {
            return;
        }
        setuseUserUnderlyingAssetPrice(assetPrice);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!userAddress || !strategy?.name) {
            return;
        }

        fetchData(userAddress, strategy).catch(console.error);
    }, [userAddress, strategy, isTxConfirmed]);

    return { userUnderlyingAssetBalance, userUnderlyingAssetPrice, isLoading };
};

const useUserUnderlyingAssetAllowance = (userAddress?: `0x${string}`, strategy?: StrategyModel, isTxConfirmed?: boolean) => {
    const [userUnderlyingAssetAllowance, setUserUnderlyingAssetAllowance] = useState(0);
    const [isLoading, setLoading] = useState(true);

    const getUserUnderlyingAssetAllowance = async (userAddress: `0x${string}`, strategy: StrategyModel) => {
        const allowanceResult: bigint = (await readContract(config.BLOCKCHAIN_CLIENT, {
            address: strategy.underlyingAsset.address,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [userAddress, strategy.share.address]
        })) as bigint;

        return Number(allowanceResult) / 10 ** strategy.underlyingAsset.decimals;
    };

    const fetchData = useCallback(async (userAddress: `0x${string}`, strategy: StrategyModel) => {
        setLoading(true);
        setUserUnderlyingAssetAllowance(await getUserUnderlyingAssetAllowance(userAddress, strategy));
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!userAddress || !strategy?.name) {
            return;
        }

        fetchData(userAddress, strategy).catch(console.error);
    }, [userAddress, strategy, isTxConfirmed]);

    return { userUnderlyingAssetAllowance, isLoading };
};

const useToastAlert = (isTxPending?: boolean, isTxFailed?: boolean, isTxConfirmed?: boolean) => {
    const [pendingToastId, setPendingToastId] = useState<number | string>(0);

    useEffect(() => {
        if (isTxPending) {
            const _topendingToastIdastId = toast.loading('Pending', { description: 'Transaction is pending.' });
            console.log(_topendingToastIdastId);
            setPendingToastId(_topendingToastIdastId);
        }

        if (isTxFailed) {
            toast.error('Error', { id: pendingToastId, description: 'Transaction Failed.' });
        }

        if (isTxConfirmed) {
            toast.success('Success', { id: pendingToastId, description: 'Transaction confirmed!' });
        }
    }, [isTxPending, isTxFailed, isTxConfirmed]);
};

export default Strategy;
