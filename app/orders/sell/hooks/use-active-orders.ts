import { useCallback, useEffect, useState } from 'react';

export interface ActiveOrder {
    tokenSymbol: string;
    tokenAddress: `0x${string}`;
    tokenLogoUrl: string;
    orderAmount: number;
    filledAmount: number;
    pricePerToken: number;
    targetStablecoin: string;
    createdAt: Date;
}

// Simulated database of active orders
const mockOrders: ActiveOrder[] = [
    {
        tokenSymbol: 'SOL',
        tokenAddress: '0x173fd7434B8B50dF08e3298f173487ebDB35FD14',
        tokenLogoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
        orderAmount: 1000,
        filledAmount: 1000,
        pricePerToken: 150,
        targetStablecoin: 'USDC',
        createdAt: new Date('2024-02-26T09:00:00Z')
    },
    {
        tokenSymbol: 'ETH',
        tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        tokenLogoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
        orderAmount: 10,
        filledAmount: 7.5,
        pricePerToken: 3500,
        targetStablecoin: 'USDC',
        createdAt: new Date('2024-02-26T10:00:00Z')
    },
    {
        tokenSymbol: 'WBTC',
        tokenAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        tokenLogoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png',
        orderAmount: 0.8,
        filledAmount: 0.65,
        pricePerToken: 52000,
        targetStablecoin: 'USDT',
        createdAt: new Date('2024-02-26T11:30:00Z')
    }
];

export const useActiveOrders = (tokenAddress?: `0x${string}`) => {
    const [isLoading, setIsLoading] = useState(false);
    const [activeOrder, setActiveOrder] = useState<ActiveOrder | undefined>();

    const fetchData = useCallback(async (tokenAddress?: `0x${string}`) => {
        setIsLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const order = mockOrders.find((order) => order.tokenAddress === tokenAddress);
        setActiveOrder(order);

        setIsLoading(false);
    }, []);

    const removeOrder = useCallback(async (tokenAddress: `0x${string}`) => {
        setIsLoading(true);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulate API deletion by removing the order from mockOrders
        const orderIndex = mockOrders.findIndex((order) => order.tokenAddress === tokenAddress);
        if (orderIndex !== -1) {
            mockOrders.splice(orderIndex, 1);
        }

        setActiveOrder(undefined);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!tokenAddress) {
            return;
        }

        fetchData(tokenAddress).catch(console.error);
    }, [tokenAddress]);

    return {
        isLoading,
        activeOrder,
        removeOrder
    };
};
