import { useState, useEffect, useCallback } from 'react';
import { AssetModel, ApiResponse } from '@/models';
import { config } from '@/config';
import { toast } from 'sonner';

// Constantes
const API_BASE_URL = `https://${config.SERVER_HOSTNAME}:${config.HTTPS_SERVER_PORT}`;

/**
 * Récupère le dernier prix d'un stablecoin
 */
const getLatestPriceApi = async (address: string): Promise<ApiResponse<number>> => {
    const url = `${API_BASE_URL}/crypto-market/latest-price?address=${address}`;
    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    });

    const jsonResponse = (await response.json()) as ApiResponse<number>;

    if (jsonResponse.error) {
        return { error: jsonResponse.error };
    }

    return { data: jsonResponse.data };
};

/**
 * Récupère les stablecoins depuis l'API
 */
const getStablecoinsApi = async (): Promise<{ data?: AssetModel[]; error?: Error }> => {
    const url = `${API_BASE_URL}/asset/stablecoins`;
    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    });

    const jsonResponse = (await response.json()) as ApiResponse<AssetModel[]>;

    if (jsonResponse.error) {
        return { error: jsonResponse.error };
    }

    return { data: jsonResponse.data };
};

export const useStablecoins = () => {
    const [stablecoins, setStablecoins] = useState<AssetModel[]>([]);
    const [latestPrice, setLatestPrice] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getStablecoins = useCallback(async () => {
        setIsLoading(true);

        const response = await getStablecoinsApi();

        if (response.error) {
            toast.error(response.error.name, { description: response.error.message });
            console.error(response.error);
            setStablecoins([]);
            setIsLoading(false);
            return;
        }

        setStablecoins(response.data!);
        setIsLoading(false);
    }, []);

    const getLatestPrice = useCallback(async (address: string) => {
        if (!address) {
            toast.error('Missing required parameters for latest price');
            return;
        }

        setIsLoading(true);

        const response = await getLatestPriceApi(address);

        if (response.error) {
            toast.error(response.error.name, { description: response.error.message });
            console.error(response.error);
            setLatestPrice(null);
            setIsLoading(false);
            return;
        }

        setLatestPrice(response.data!);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        getStablecoins().catch(console.error);
    }, [getStablecoins]);

    return {
        stablecoins,
        latestPrice,
        isLoading,
        getLatestPrice
    };
};
