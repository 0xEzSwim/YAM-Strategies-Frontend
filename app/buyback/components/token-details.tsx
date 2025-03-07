'use client';

import { useState, useEffect } from 'react';
import { config } from '@/config';
import { AssetModel } from '@/models';
import { useStablecoins, useTokens } from '@/hooks';
import { useOrders } from '../hooks/use-orders';
import { convertNumberToBigInt } from '@/lib/utils';

// Components
import { ArrowDown, MousePointerClick, Info } from 'lucide-react';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { readContract } from '@wagmi/core';
import { formatUnits, erc20Abi } from 'viem';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Information } from '@/components/information';
import { Checkbox } from '@/components/ui/checkbox';

interface OrderSummaryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    mode: 'place' | 'update';
    amount: { value: bigint; decimals: number };
    calculateFees: { fees: { vacancyFee: bigint; liquidityProviderFee: bigint; platformFee: bigint }; decimals: number };
    calculateReceivedAmountUSD: { price: bigint; decimals: number };
    calculateSentAmountUSD: { price: bigint; decimals: number };
}

const OrderSummaryModal = ({
    open,
    onOpenChange,
    onConfirm,
    mode,
    amount,
    calculateFees,
    calculateReceivedAmountUSD,
    calculateSentAmountUSD
}: OrderSummaryModalProps) => {
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (open) {
            setIsVerified(false);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Order Summary</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm">
                            <span>SUBTOTAL</span>
                            <span>${formatUnits(calculateSentAmountUSD.price, calculateSentAmountUSD.decimals)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <span>VACANCY FEE</span>
                                <TooltipProvider>
                                    <Tooltip delayDuration={150}>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right">
                                            RealT assesses an additional fee when buying back properties with vacant units.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <span>- ${formatUnits(calculateFees.fees.vacancyFee * amount.value, calculateFees.decimals + amount.decimals)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>LIQUIDITY PROVIDER FEE (1%)</span>
                            <span>
                                - ${formatUnits(calculateFees.fees.liquidityProviderFee * amount.value, calculateFees.decimals + amount.decimals)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <span>PLATFORM FEE (1%)</span>
                            </div>
                            <span>- ${formatUnits(calculateFees.fees.platformFee * amount.value, calculateFees.decimals + amount.decimals)}</span>
                        </div>
                        <div className="h-px bg-border my-2" />
                        <div className="flex justify-between text-sm font-medium">
                            <span>TOTAL SALE</span>
                            <span>${formatUnits(calculateReceivedAmountUSD.price, calculateReceivedAmountUSD.decimals)}</span>
                        </div>
                        <div className="flex items-center space-x-2 pt-4">
                            <Checkbox id="verify" checked={isVerified} onCheckedChange={(checked) => setIsVerified(checked as boolean)} />
                            <label
                                htmlFor="verify"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I verify that these values are correct.
                            </label>
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            onOpenChange(false);
                            onConfirm();
                        }}
                        disabled={!isVerified}
                    >
                        {mode === 'update' ? 'Update Sell Order' : 'Place Sell Order'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface DeleteOrderConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    token: AssetModel;
    amount: number;
}

const DeleteOrderConfirmationModal = ({ open, onOpenChange, onConfirm, token, amount }: DeleteOrderConfirmationModalProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancel Order Confirmation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        You are about to cancel your sell order for <span className="font-medium">{amount.toFixed(2)}</span>{' '}
                        <span className="font-medium">{token.shortName}</span>.
                    </p>
                    <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                </div>
                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Keep Order
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onOpenChange(false);
                            onConfirm();
                        }}
                    >
                        Cancel Order
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface TokenDetailsProps {
    token: AssetModel | undefined;
}

const TokenDetails = ({ token }: TokenDetailsProps) => {
    const { address } = useAccount();
    const { stablecoins, isLoading: isStablecoinsLoading, getLatestPrice, latestPrice: selectedStablecoinPrice } = useStablecoins();
    const { tokenPrices, getTokenPrices } = useTokens();
    const [selectedStablecoin, setSelectedStablecoin] = useState<AssetModel | null>(null);
    const [amount, setAmount] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showActiveOrderInfo, setShowActiveOrderInfo] = useState(true);
    const [showNewOrderInfo, setShowNewOrderInfo] = useState(true);
    const [tokenBalance, setTokenBalance] = useState<number>(0);
    const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderModalMode, setOrderModalMode] = useState<'place' | 'update'>('place');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { order, isLoading: isOrderLoading, cancelOrder, createOrder, updateOrder } = useOrders(address, token?.address);
    const isLoading = isOrderLoading || isStablecoinsLoading || isLoadingBalance;

    // Déterminer le statut de l'ordre
    const orderStatus = !order ? 'new' : order.amount === order.filledAmount ? 'completed' : 'progress';

    const calculateFees = (
        inputAmount: string,
        decimals: number,
        stablecoinPrice?: { price: number; decimal: number }
    ): { fees: { vacancyFee: bigint; liquidityProviderFee: bigint; platformFee: bigint }; decimals: number } => {
        const result = { fees: { vacancyFee: 0n, liquidityProviderFee: 0n, platformFee: 0n }, decimals };
        if (!token || !inputAmount || !tokenPrices) return result;
        const parsedAmount = parseFloat(inputAmount);
        if (isNaN(parsedAmount)) return result;

        const fundamentalPrice = stablecoinPrice
            ? convertNumberToBigInt(tokenPrices.fundamentalPrice, decimals) * convertNumberToBigInt(stablecoinPrice.price, stablecoinPrice.decimal)
            : convertNumberToBigInt(tokenPrices.fundamentalPrice, decimals);
        const buyBackPrice = stablecoinPrice
            ? convertNumberToBigInt(tokenPrices.buyBackPrice, decimals) * convertNumberToBigInt(stablecoinPrice.price, stablecoinPrice.decimal)
            : convertNumberToBigInt(tokenPrices.buyBackPrice, decimals);
        const vacancyFee = fundamentalPrice - buyBackPrice;
        const liquidityProviderFee = (fundamentalPrice * 1n) / convertNumberToBigInt(1, 2);

        result.fees = { vacancyFee, liquidityProviderFee, platformFee: liquidityProviderFee };
        if (stablecoinPrice) result.decimals = decimals + stablecoinPrice.decimal;
        return result;
    };

    const calculateSentAmountUSD = (inputAmount: string): { price: bigint; decimals: number } => {
        const result = { price: 0n, decimals: 0 };
        if (!token || !inputAmount || !tokenPrices) return result;
        result.decimals = 2;
        const parsedAmount = parseFloat(inputAmount);
        if (isNaN(parsedAmount)) return result;

        const fundamentalPrice = convertNumberToBigInt(tokenPrices.fundamentalPrice, result.decimals);
        const amount = convertNumberToBigInt(parsedAmount, token.decimals);

        // Calculate final amount and convert back to number
        result.price = (amount * fundamentalPrice) / convertNumberToBigInt(1, token.decimals);
        return result;
    };

    const calculateReceivedAmountUSD = (inputAmount: string): { price: bigint; decimals: number } => {
        const result = { price: 0n, decimals: 0 };
        if (!token || !inputAmount || !tokenPrices) return result;
        result.decimals = 2;
        const parsedAmount = parseFloat(inputAmount);
        if (isNaN(parsedAmount)) return result;

        const { fees } = calculateFees(inputAmount, result.decimals);
        const fundamentalPrice = convertNumberToBigInt(tokenPrices.fundamentalPrice, result.decimals);
        const finalPrice = fundamentalPrice - fees.vacancyFee - fees.liquidityProviderFee - fees.platformFee;
        const amount = convertNumberToBigInt(parsedAmount, token.decimals);

        // Calculate final amount and convert back to number
        result.price = (amount * finalPrice) / convertNumberToBigInt(1, token.decimals);
        return result;
    };

    const calculateReceivedAmountStablecoin = (inputAmount: string): { price: bigint; decimals: number } => {
        const result = { price: 0n, decimals: 0 };
        if (!token || !inputAmount || !tokenPrices || !selectedStablecoin) return result;
        result.decimals = selectedStablecoin.decimals;
        const parsedAmount = parseFloat(inputAmount);
        if (isNaN(parsedAmount)) return result;

        const { fees } = calculateFees(inputAmount, result.decimals, {
            price: selectedStablecoinPrice!,
            decimal: 2
        });
        const fundamentalPrice =
            convertNumberToBigInt(tokenPrices.fundamentalPrice, result.decimals) * convertNumberToBigInt(selectedStablecoinPrice!, 2);
        const finalPrice = fundamentalPrice - fees.vacancyFee - fees.liquidityProviderFee - fees.platformFee;
        const amount = convertNumberToBigInt(parsedAmount, token.decimals);

        // Calculate final amount and convert back to number
        result.price = (amount * finalPrice) / convertNumberToBigInt(1, token.decimals + 2);
        console.log('result:', result);
        return result;
    };

    useEffect(() => {
        const fetchTokenData = async () => {
            if (!token || !address) {
                setTokenBalance(0);
                return;
            }

            setIsLoadingBalance(true);

            // Fetch token prices
            await getTokenPrices(token.address);

            // Fetch token balance
            const rawBalance = (await readContract(config.BLOCKCHAIN_CLIENT, {
                address: token.address,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [address]
            }).catch((bcError: unknown) => {
                console.warn(bcError);
                return;
            })) as bigint | undefined;

            if (!rawBalance) {
                setTokenBalance(0);
                setIsLoadingBalance(false);
                return;
            }

            const formattedBalance = Number(formatUnits(rawBalance, token.decimals));
            setTokenBalance(formattedBalance);

            setIsLoadingBalance(false);
        };

        fetchTokenData();
    }, [token, address, getTokenPrices]);

    useEffect(() => {
        if (stablecoins.length > 0 && !selectedStablecoin) {
            const initialStablecoin = stablecoins[0];
            setSelectedStablecoin(initialStablecoin);
            getLatestPrice(initialStablecoin.address);
        }
    }, [stablecoins, selectedStablecoin, getLatestPrice]);

    useEffect(() => {
        setIsEditing(false);
        setShowActiveOrderInfo(true);
        setShowNewOrderInfo(true);
        setAmount('');
    }, [token?.address]);

    useEffect(() => {
        if (order && isEditing) {
            setAmount(order.amount.toString());
            const orderStablecoin = stablecoins.find((s) => s.address === order.offerAsset.address);
            if (orderStablecoin) {
                setSelectedStablecoin(orderStablecoin);
            }
        }
        setShowActiveOrderInfo(true);
    }, [order, isEditing, stablecoins]);

    const handleCreateNewOrder = async () => {
        if (!token?.address || !address || !selectedStablecoin) return;

        try {
            await cancelOrder(address as `0x${string}`, selectedStablecoin.address, token.address, order?.amount || 0);
            setAmount('');
            setSelectedStablecoin(stablecoins[0]);
            setShowNewOrderInfo(true);
        } catch (error) {
            console.error('Failed to remove order:', error);
        }
    };

    const handleCancelOrder = async () => {
        if (!token?.address || !address || !selectedStablecoin) return;

        try {
            await cancelOrder(address as `0x${string}`, selectedStablecoin.address, token.address, order?.amount || 0);
            setAmount('');
            setSelectedStablecoin(stablecoins[0]);
            setShowNewOrderInfo(true);
        } catch (error) {
            console.error('Failed to cancel order:', error);
            toast.error('Failed to cancel order', {
                description: 'An error occurred while canceling your order. Please try again.'
            });
        }
    };

    const handlePlaceOrder = async () => {
        if (!token?.address || !address || !selectedStablecoin || !amount) return;

        try {
            const amountValue = parseFloat(amount);
            if (isNaN(amountValue) || amountValue <= 0) {
                toast.error('Invalid amount');
                return;
            }

            await createOrder(address as `0x${string}`, selectedStablecoin.address, token.address, amountValue);
        } catch (error) {
            console.error('Failed to place order:', error);
        }
    };

    const handleUpdateOrder = async () => {
        if (!token?.address || !address || !selectedStablecoin || !amount || !order) return;

        try {
            const amountValue = parseFloat(amount);
            if (isNaN(amountValue) || amountValue <= 0 || amountValue <= order.filledAmount) {
                toast.error('Invalid amount');
                return;
            }

            await updateOrder(address as `0x${string}`, selectedStablecoin.address, token.address, amountValue);

            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update order:', error);
        }
    };

    const handleShowOrderModal = (mode: 'place' | 'update') => {
        setOrderModalMode(mode);
        setShowOrderModal(true);
    };

    const handleConfirmOrder = () => {
        if (orderModalMode === 'update') {
            handleUpdateOrder();
        } else {
            handlePlaceOrder();
        }
    };

    const handleStablecoinChange = async (value: string) => {
        const newStablecoin = stablecoins.find((s) => s.shortName === value);
        if (newStablecoin) {
            setSelectedStablecoin(newStablecoin);
            await getLatestPrice(newStablecoin.address);
        }
    };

    if (!token) {
        return (
            <Card className="h-full flex flex-col overflow-hidden">
                <CardContent className="px-6 flex-1 flex items-center justify-center p-6">
                    <div className="text-center space-y-2">
                        <MousePointerClick className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">Choose a token from the list on the left to create a sell order</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card className="h-full flex flex-col overflow-hidden">
                <CardHeader className="flex-none">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </CardHeader>
                <CardContent className="px-6 flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
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
        if (token && tokenBalance > 0) {
            setAmount(tokenBalance.toString());
        }
    };

    const mainComponentJsx = (
        <Card className="h-full flex flex-col overflow-hidden">
            {order && !isEditing ? (
                <>
                    <CardHeader className="flex-none space-y-2 overflow-hidden pb-4">
                        <div className="flex items-center justify-between overflow-hidden">
                            <div className="space-y-1 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <CardTitle>Sell Order</CardTitle>
                                    <Badge
                                        variant="secondary"
                                        className={`font-normal ${
                                            orderStatus === 'completed'
                                                ? 'bg-green-50 text-green-700 hover:bg-green-50'
                                                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-50'
                                        }`}
                                    >
                                        {orderStatus === 'completed' ? 'Completed' : 'In Progress'}
                                    </Badge>
                                </div>
                                <CardDescription className="truncate">
                                    {order.filledAmount.toFixed(2)} / {order.amount.toFixed(2)} filled at {order.displayedPrice.toFixed(2)}{' '}
                                    <span className="font-bold">{selectedStablecoin?.shortName}</span>
                                </CardDescription>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="font-medium">{((order.filledAmount / order.amount) * 100).toFixed(0)}%</div>
                                <div className="text-xs text-muted-foreground">{(order.amount - order.filledAmount).toFixed(2)} remaining</div>
                            </div>
                        </div>
                        <Progress
                            value={(order.filledAmount / order.amount) * 100}
                            className={`h-2 ${orderStatus === 'completed' ? '[&>div]:bg-green-500' : '[&>div]:bg-yellow-500'}`}
                        />
                    </CardHeader>
                    <CardContent className="px-6 flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                        <div className="flex flex-col gap-4">
                            {showActiveOrderInfo && (
                                <Information
                                    type={orderStatus === 'completed' ? 'success' : 'warning'}
                                    onDismiss={() => setShowActiveOrderInfo(false)}
                                >
                                    {orderStatus === 'completed' ? (
                                        <>
                                            Your <span className="font-bold">{token.shortName}</span> sell order has been completely filled. You can
                                            create a new sell order for this token.
                                        </>
                                    ) : (
                                        <>
                                            You have an active sell order for <span className="font-bold">{token.shortName}</span>. You can edit the
                                            order and increase the amount or cancel it.
                                        </>
                                    )}
                                </Information>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        {orderStatus === 'completed' ? (
                            <Button className="w-full" onClick={handleCreateNewOrder}>
                                Create New Sell Order
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" className="flex-1" onClick={() => setIsEditing(true)}>
                                    Edit Sell Order
                                </Button>
                                <Button variant="destructive" className="flex-1" onClick={() => setShowDeleteModal(true)}>
                                    Cancel Sell Order
                                </Button>
                            </>
                        )}
                    </CardFooter>
                </>
            ) : (
                <>
                    {order ? (
                        <CardHeader className="flex-none space-y-2 overflow-hidden pb-4">
                            <div className="flex items-center justify-between overflow-hidden">
                                <div className="space-y-1 overflow-hidden">
                                    <div className="flex items-center gap-2">
                                        <CardTitle>Sell Order</CardTitle>
                                        <Badge
                                            variant="secondary"
                                            className={
                                                order.filledAmount >= parseFloat(amount || '0')
                                                    ? 'font-normal bg-red-50 text-red-700 hover:bg-red-50'
                                                    : 'font-normal bg-blue-50 text-blue-700 hover:bg-blue-50'
                                            }
                                        >
                                            Editing
                                        </Badge>
                                    </div>
                                    <CardDescription className="truncate">
                                        {order.filledAmount.toFixed(2)} / {parseFloat(amount || '0').toFixed(2)} filled at{' '}
                                        {order.displayedPrice.toFixed(2)} <span className="font-bold">{selectedStablecoin?.shortName}</span>
                                    </CardDescription>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="font-medium">{((order.filledAmount / parseFloat(amount || '0')) * 100).toFixed(2)}%</div>
                                    <div className="text-xs text-muted-foreground">
                                        {(parseFloat(amount || '0') - order.filledAmount).toFixed(2)} remaining
                                    </div>
                                </div>
                            </div>
                            <Progress
                                value={order.filledAmount >= parseFloat(amount || '0') ? 100 : (order.filledAmount / parseFloat(amount || '0')) * 100}
                                className={`h-2 ${order.filledAmount >= parseFloat(amount || '0') ? '[&>div]:bg-red-500' : '[&>div]:bg-blue-500'}`}
                            />
                        </CardHeader>
                    ) : (
                        <CardHeader className="flex-none space-y-2 overflow-hidden pb-4">
                            <div className="flex items-center justify-between overflow-hidden">
                                <div className="space-y-1 overflow-hidden">
                                    <div className="flex items-center gap-2">
                                        <CardTitle>Sell Order</CardTitle>
                                        <Badge variant="outline" className="font-normal">
                                            New Order
                                        </Badge>
                                    </div>
                                    <CardDescription className="truncate">Place a new sell order</CardDescription>
                                </div>
                            </div>
                            {showNewOrderInfo && (
                                <Information type="info" onDismiss={() => setShowNewOrderInfo(false)}>
                                    You can sell your <span className="font-bold">{token.shortName}</span> tokens for stablecoins at market price{' '}
                                    <TooltipProvider delayDuration={150}>
                                        <Tooltip>
                                            <TooltipTrigger className="underline decoration-dotted cursor-help">minus applicable fees</TooltipTrigger>
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
                                </Information>
                            )}
                        </CardHeader>
                    )}
                    <CardContent className="px-6 flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                        <div className="flex flex-col gap-6 overflow-hidden">
                            <div className="grid gap-4 items-end overflow-hidden">
                                <div className="overflow-hidden">
                                    <label className="text-sm font-medium mb-2 block">From wallet</label>
                                    <div className="p-2 rounded-lg border bg-muted overflow-hidden">
                                        <div className="flex items-center gap-2 h-7 overflow-hidden">
                                            {token.logoUrl && (
                                                <Image
                                                    src={token.logoUrl}
                                                    alt={`${token.shortName} logo`}
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full flex-shrink-0"
                                                />
                                            )}
                                            <span className="font-medium truncate">{token.shortName}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 truncate">You have {tokenBalance.toFixed(2)}</div>
                                </div>

                                <div className="overflow-hidden">
                                    <label className="text-sm font-medium mb-2 block">Amount</label>
                                    <div className="flex items-center gap-2 p-1 rounded-lg border bg-muted overflow-hidden">
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            className="text-md font-medium bg-transparent focus-visible:ring-0 shadow-none border-0 p-0 pl-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            value={amount}
                                            onChange={handleAmountChange}
                                        />
                                        <Button size="sm" className="m-0 ml-2 mr-2 flex-shrink-0" onClick={handleMaxClick}>
                                            Max
                                        </Button>
                                    </div>
                                    {isEditing && order && (
                                        <div className="text-xs text-orange-600 mt-1 truncate">
                                            Minimum amount: {order.filledAmount} {token?.shortName}
                                        </div>
                                    )}
                                    <div className="text-xs text-muted-foreground mt-1 truncate">
                                        $
                                        {(() => {
                                            const result = calculateSentAmountUSD(amount);
                                            return formatUnits(result.price, result.decimals);
                                        })()}
                                    </div>
                                </div>

                                <div className="self-center flex justify-center gap-4">
                                    <ArrowDown className="block w-8 h-8 text-muted-foreground flex-shrink-0" />
                                </div>

                                <div className="overflow-hidden">
                                    <label className="text-sm font-medium mb-2 block">To Wallet</label>
                                    <div className="flex items-center gap-2 p-1 rounded-lg border bg-muted overflow-hidden">
                                        {selectedStablecoin ? (
                                            <Select value={selectedStablecoin.shortName} onValueChange={handleStablecoinChange} disabled={isEditing}>
                                                <SelectTrigger className="text-md font-medium bg-transparent focus:ring-0 focus:ring-offset-0 shadow-none border-0 p-0 pl-2 [appearance:textfield] overflow-hidden">
                                                    <SelectValue>
                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                            <Image
                                                                src={selectedStablecoin.logoUrl || '/placeholder-coin.png'}
                                                                alt={`${selectedStablecoin.shortName} logo`}
                                                                width={24}
                                                                height={24}
                                                                className="rounded-full flex-shrink-0"
                                                            />
                                                            <span className="truncate">{selectedStablecoin.shortName}</span>
                                                        </div>
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {stablecoins.map((stablecoin) => (
                                                        <SelectItem key={stablecoin.address} value={stablecoin.shortName}>
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <Image
                                                                    src={stablecoin.logoUrl || '/placeholder-coin.png'}
                                                                    alt={`${stablecoin.shortName} logo`}
                                                                    width={24}
                                                                    height={24}
                                                                    className="rounded-full flex-shrink-0"
                                                                />
                                                                <span className="truncate">{stablecoin.shortName}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="p-2 flex items-center">
                                                <Skeleton className="h-6 w-24" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 truncate">
                                        ${selectedStablecoinPrice?.toFixed(2) ?? '0.00'}
                                    </div>
                                </div>

                                <div className="overflow-hidden">
                                    <label className="text-sm font-medium mb-2 block">You will receive</label>
                                    <div className="p-2 rounded-lg border bg-muted overflow-hidden">
                                        <div className="flex items-center gap-2 h-7 overflow-hidden">
                                            <span className="font-medium truncate">
                                                {(() => {
                                                    const result = calculateReceivedAmountStablecoin(amount);
                                                    return formatUnits(result.price, result.decimals);
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 truncate">
                                        $
                                        {(() => {
                                            const result = calculateReceivedAmountUSD(amount);
                                            return formatUnits(result.price, result.decimals);
                                        })()}
                                    </div>
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
                                <Button
                                    className="flex-1"
                                    disabled={!amount || (order && Number(amount) <= order.filledAmount)}
                                    onClick={() => handleShowOrderModal('update')}
                                >
                                    Check Order
                                </Button>
                            </>
                        ) : (
                            <Button className="w-full" disabled={!amount || parseFloat(amount) <= 0} onClick={() => handleShowOrderModal('place')}>
                                Check Order
                            </Button>
                        )}
                    </CardFooter>
                </>
            )}
        </Card>
    );

    return (
        <>
            {mainComponentJsx}
            <OrderSummaryModal
                open={showOrderModal}
                onOpenChange={setShowOrderModal}
                onConfirm={handleConfirmOrder}
                mode={orderModalMode}
                amount={{ value: convertNumberToBigInt(parseFloat(amount || '0'), token?.decimals), decimals: token?.decimals }}
                calculateFees={calculateFees(amount, 2)}
                calculateReceivedAmountUSD={calculateReceivedAmountUSD(amount)}
                calculateSentAmountUSD={calculateSentAmountUSD(amount)}
            />
            {token && order && (
                <DeleteOrderConfirmationModal
                    open={showDeleteModal}
                    onOpenChange={setShowDeleteModal}
                    onConfirm={handleCancelOrder}
                    token={token}
                    amount={order.amount}
                />
            )}
        </>
    );
};

export { TokenDetails };
