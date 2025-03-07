'use client';

import { config } from '@/config';
import { useAccount } from 'wagmi';
import { readContract } from '@wagmi/core';
import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, DollarSign, Percent, Power, TrendingDown, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PagePlaceholder } from '@/components/page-placeholder';
import { StrategyModel } from '@/models';
import { Badge } from '@/components/ui/badge';

const Strategies = () => {
    const router = useRouter();
    const { isConnected, address } = useAccount();
    const { strategies, kpi, lastUpdate, isLoading: isStrategiesLoading } = useStrategies();
    const { userHoldings } = useUserHoldings(address, strategies);

    const numberOfActiveStrategies = (): number => {
        return strategies.filter((strategy) => !strategy.isPaused).length;
    };
    const displayUserHoldings = (): boolean => {
        return isConnected && !!userHoldings?.length;
    };

    if (!strategies?.length && isStrategiesLoading) {
        return <PagePlaceholder></PagePlaceholder>;
    }

    return (
        <>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdate.toLocaleString()}</p>
            <div className="grid auto-rows-min gap-8 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${kpi.tvl.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground"></p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Historical Annual Percentage Yield</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${kpi.apy ? 'text-green-500' : 'text-red-500'}`}>{(kpi.apy * 100).toFixed(2)}%</div>
                        <p className="text-xs text-muted-foreground"></p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{numberOfActiveStrategies()}</div>
                        <p className="text-xs text-muted-foreground">Across all YAM markets</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>YAM Strategies</CardTitle>
                    <CardDescription>Explore and invest in the YAM strategies that fits you</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Strategy</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Underlying Asset</TableHead>
                                <TableHead>TVL</TableHead>
                                <TableHead>Hist. APY</TableHead>
                                <TableHead>Total Shares</TableHead>
                                {displayUserHoldings() && <TableHead>Your Holdings</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {strategies.map((strategy, index) => (
                                <TableRow key={index} className="cursor-pointer" onClick={() => router.push(`/strategies/${strategy.share.address}`)}>
                                    <TableCell className="font-medium">{strategy.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            <div className="flex items-center">
                                                <Power className={`h-4 w-4 mr-2 text-${strategy.isPaused ? 'orange' : 'green'}-500`} />
                                                {strategy.isPaused ? 'Paused' : 'Active'}
                                            </div>
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{strategy.underlyingAsset.shortName}</TableCell>
                                    <TableCell>${strategy.tvl.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            {strategy.apy ? (
                                                <TrendingUp className="mr-2 text-green-500" />
                                            ) : (
                                                <TrendingDown className="mr-2 text-red-500" />
                                            )}
                                            {((strategy.apy ?? 0) * 100).toFixed(2)}%
                                        </div>
                                    </TableCell>
                                    <TableCell>{strategy.share.supply.toFixed(2)}</TableCell>
                                    {displayUserHoldings() && (
                                        <TableCell>
                                            {userHoldings[index].toFixed(2)} (~
                                            {((userHoldings[index] / strategy.share.supply) * 100).toFixed(2)}
                                            %)
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
};

const useStrategies = () => {
    const [strategies, setStrategies] = useState([] as StrategyModel[]);
    const [kpi, setKpi] = useState({ tvl: 0, apy: 0 });
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [isLoading, setLoading] = useState(true);

    const getStrategies = async () => {
        const response = await fetch(`https://${config.SERVER_HOSTNAME}:${config.HTTPS_SERVER_PORT}/main/strategies`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const jsonResponse = (await response.json()) as { data: StrategyModel[]; error: any };
        if (jsonResponse.error) {
            toast.error(jsonResponse.error.name, { description: jsonResponse.error.message });
            console.error(jsonResponse.error);
            return;
        }

        return jsonResponse.data;
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        const _strategies: StrategyModel[] | undefined = await getStrategies();
        if (!_strategies) {
            return;
        }

        let undefinedAPY: number = 0;
        let newKpi = { tvl: 0, apy: 0 };
        for (let index = 0; index < _strategies.length; index++) {
            const strategy = _strategies[index];
            newKpi.tvl += strategy.tvl;
            if (strategy.apy == undefined) {
                undefinedAPY++;
            }
            newKpi.apy += strategy.apy ?? 0;
        }
        newKpi.apy = _strategies.length - undefinedAPY ? newKpi.apy / (_strategies.length - undefinedAPY) : 0;

        setStrategies(_strategies);
        setKpi(newKpi);
        setLastUpdate(new Date());
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData().catch(console.error);
    }, []);

    return { strategies, kpi, lastUpdate, isLoading };
};

const useUserHoldings = (userAddress?: `0x${string}`, strategies?: StrategyModel[]) => {
    const [userHoldings, setUserHoldings] = useState([] as number[]);
    const [isLoading, setLoading] = useState(true);

    const getuserHoldings = async (userAddress: `0x${string}`, strategies: StrategyModel[]) => {
        let userHoldings: number[] = [];
        for (let index = 0; index < strategies.length; index++) {
            const strategy = strategies[index];
            const userHoldingResult: bigint = (await readContract(config.BLOCKCHAIN_CLIENT, {
                address: strategy.share.address,
                abi: strategy.contractAbi,
                functionName: 'balanceOf',
                args: [userAddress]
            })) as bigint;

            const userHolding: number = Number(userHoldingResult) / 10 ** strategy.share.decimals;
            userHoldings.push(userHolding);
        }

        return userHoldings;
    };

    const fetchData = useCallback(async (userAddress: `0x${string}`, strategies: StrategyModel[]) => {
        setLoading(true);
        setUserHoldings(await getuserHoldings(userAddress, strategies));
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!userAddress || !strategies?.length) {
            return;
        }

        fetchData(userAddress, strategies).catch(console.error);
    }, [userAddress, strategies]);

    return { userHoldings, isLoading };
};

export default Strategies;
