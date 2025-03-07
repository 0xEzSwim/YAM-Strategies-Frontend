import { useCallback, useEffect, useState } from 'react';
import { OrderModel, ApiResponse } from '@/models';
import { config } from '@/config';
import { toast } from 'sonner';

// API calls
const getOrderApi = async (userAddress: `0x${string}`, tokenAddress: `0x${string}`): Promise<ApiResponse<OrderModel[]>> => {
    const params = new URLSearchParams({ userAddress: userAddress, offerAsset: tokenAddress }).toString();
    const url = `https://${config.SERVER_HOSTNAME}:${config.HTTPS_SERVER_PORT}/order/active-sell?${params}`;

    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    });

    const jsonResponse = (await response.json()) as ApiResponse<OrderModel[]>;

    if (jsonResponse.error) {
        return { error: jsonResponse.error };
    }

    return { data: jsonResponse.data };
};

const createOrderApi = async (
    userAddress: `0x${string}`,
    buyerAssetAddress: `0x${string}`,
    offerAssetAddress: `0x${string}`,
    amount: number
): Promise<ApiResponse<OrderModel>> => {
    const url = `https://${config.SERVER_HOSTNAME}:${config.HTTPS_SERVER_PORT}/order/create-order`;

    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userAddress,
            buyerAssetAddress,
            offerAssetAddress,
            amount
        })
    });

    const jsonResponse = (await response.json()) as ApiResponse<OrderModel>;

    if (jsonResponse.error) {
        return { error: jsonResponse.error };
    }

    return { data: jsonResponse.data };
};

const updateOrderApi = async (
    userAddress: `0x${string}`,
    buyerAssetAddress: `0x${string}`,
    offerAssetAddress: `0x${string}`,
    amount: number
): Promise<ApiResponse<OrderModel>> => {
    const url = `https://${config.SERVER_HOSTNAME}:${config.HTTPS_SERVER_PORT}/order/update-order`;

    const response = await fetch(url, {
        method: 'PUT',
        mode: 'cors',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userAddress,
            buyerAssetAddress,
            offerAssetAddress,
            amount
        })
    });

    const jsonResponse = (await response.json()) as ApiResponse<OrderModel>;

    if (jsonResponse.error) {
        return { error: jsonResponse.error };
    }

    return { data: jsonResponse.data };
};

const cancelOrderApi = async (
    userAddress: `0x${string}`,
    buyerAssetAddress: `0x${string}`,
    offerAssetAddress: `0x${string}`,
    amount: number
): Promise<ApiResponse<boolean>> => {
    const url = `https://${config.SERVER_HOSTNAME}:${config.HTTPS_SERVER_PORT}/order/cancel-order`;

    const response = await fetch(url, {
        method: 'PATCH',
        mode: 'cors',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userAddress,
            buyerAssetAddress,
            offerAssetAddress,
            amount
        })
    });

    const jsonResponse = (await response.json()) as ApiResponse<boolean>;

    if (jsonResponse.error) {
        return { error: jsonResponse.error };
    }

    return { data: jsonResponse.data };
};

// Hook
export const useOrders = (userAddress?: `0x${string}`, tokenAddress?: `0x${string}`) => {
    const [isLoading, setIsLoading] = useState(false);
    const [order, setOrder] = useState<OrderModel | undefined>();

    const getOrder = useCallback(async (userAddress: `0x${string}`, tokenAddress: `0x${string}`) => {
        setIsLoading(true);

        const response = await getOrderApi(userAddress, tokenAddress);

        if (response.error) {
            toast.error(response.error.name, { description: response.error.message });
            console.error(response.error);
            setOrder(undefined);
            setIsLoading(false);
            return;
        }

        setOrder(response.data![0]);
        setIsLoading(false);
    }, []);

    const createOrder = useCallback(
        async (userAddress: `0x${string}`, buyerAssetAddress: `0x${string}`, offerAssetAddress: `0x${string}`, amount: number) => {
            if (!userAddress || !buyerAssetAddress || !offerAssetAddress || !amount) {
                toast.error('Missing required parameters for order creation');
                return;
            }

            setIsLoading(true);

            const response = await createOrderApi(userAddress, buyerAssetAddress, offerAssetAddress, amount);

            if (response.error) {
                toast.error(response.error.name, { description: response.error.message });
                console.error(response.error);
                setIsLoading(false);
                return;
            }

            setOrder(response.data);
            setIsLoading(false);
            toast.success('Order was successfully created');
        },
        []
    );

    const updateOrder = useCallback(
        async (userAddress: `0x${string}`, buyerAssetAddress: `0x${string}`, offerAssetAddress: `0x${string}`, amount: number) => {
            if (!userAddress || !buyerAssetAddress || !offerAssetAddress || !amount) {
                toast.error('Missing required parameters for order update');
                return;
            }

            setIsLoading(true);

            const response = await updateOrderApi(userAddress, buyerAssetAddress, offerAssetAddress, amount);

            if (response.error) {
                toast.error(response.error.name, { description: response.error.message });
                console.error(response.error);
                setIsLoading(false);
                return;
            }

            setOrder(response.data);
            setIsLoading(false);
            toast.success('Order was successfully updated');
        },
        []
    );

    const cancelOrder = useCallback(
        async (userAddress: `0x${string}`, buyerAssetAddress: `0x${string}`, offerAssetAddress: `0x${string}`, amount: number) => {
            if (!userAddress || !buyerAssetAddress || !offerAssetAddress || !amount) {
                toast.error('Missing required parameters for order creation');
                return;
            }

            setIsLoading(true);

            const response = await cancelOrderApi(userAddress, buyerAssetAddress, offerAssetAddress, amount);

            if (response.error) {
                toast.error(response.error.name, { description: response.error.message });
                console.error(response.error);
                setIsLoading(false);
                return;
            }

            setOrder(undefined);
            setIsLoading(false);
            toast.success('Order was successfully cancelled');
        },
        []
    );

    useEffect(() => {
        if (!userAddress || !tokenAddress) {
            setOrder(undefined);
            return;
        }

        getOrder(userAddress, tokenAddress).catch(console.error);
    }, [userAddress, tokenAddress, getOrder]);

    return {
        order,
        isLoading,
        cancelOrder,
        createOrder,
        updateOrder
    };
};
