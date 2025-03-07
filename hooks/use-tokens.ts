import { useState, useEffect, useMemo, useCallback } from 'react';
import { AssetModel, ApiResponse, TokenPrices } from '@/models';
import { config } from '@/config';
import { toast } from 'sonner';

// Constantes
const API_BASE_URL = `https://${config.SERVER_HOSTNAME}:${config.HTTPS_SERVER_PORT}`;
const ITEMS_PER_PAGE = 10;

/**
 * Récupère les prix des tokens depuis l'API
 */
export const getTokenPricesApi = async (tokenAddress: `0x${string}`): Promise<ApiResponse<TokenPrices>> => {
    const params = new URLSearchParams({ address: tokenAddress }).toString();
    const url = `${API_BASE_URL}/realToken/prices?${params}`;

    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    });

    const jsonResponse = (await response.json()) as ApiResponse<TokenPrices>;

    if (jsonResponse.error) {
        return { error: jsonResponse.error };
    }

    return { data: jsonResponse.data };
};

/**
 * Récupère les tokens depuis l'API
 */
const getTokensApi = async (): Promise<ApiResponse<AssetModel[]>> => {
    const url = `${API_BASE_URL}/asset/rwa`;

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

/**
 * Hook personnalisé pour gérer les tokens
 */
export const useTokens = () => {
    const [tokens, setTokens] = useState<AssetModel[]>([]);
    const [tokenPrices, setTokenPrices] = useState<TokenPrices | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Filtrer les tokens en fonction du terme de recherche
    const filteredTokens = useMemo(() => {
        if (!searchTerm.trim()) return tokens;

        return tokens.filter((token) => token.symbol.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [tokens, searchTerm]);

    // Calculer les tokens de la page courante
    const currentTokens = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTokens.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredTokens, currentPage]);

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(filteredTokens.length / ITEMS_PER_PAGE);

    /**
     * Récupère les tokens depuis l'API
     */
    const getTokens = useCallback(async () => {
        setIsLoading(true);

        const tokensResponse = await getTokensApi();

        if (tokensResponse.error) {
            toast.error(tokensResponse.error.name, { description: tokensResponse.error.message });
            console.error(tokensResponse.error);
            setTokens([]);
            setIsLoading(false);
            return;
        }

        setTokens(tokensResponse.data!);
        setIsLoading(false);
    }, []);

    /**
     * Récupère les prix d'un token spécifique
     */
    const getTokenPrices = useCallback(async (tokenAddress: `0x${string}`) => {
        if (!tokenAddress) {
            toast.error('Missing required parameters for token prices');
            return;
        }

        setIsLoading(true);

        const response = await getTokenPricesApi(tokenAddress);

        if (response.error) {
            toast.error(response.error.name, { description: response.error.message });
            console.error(response.error);
            setTokenPrices(undefined);
            setIsLoading(false);
            return;
        }

        setTokenPrices(response.data!);
        setIsLoading(false);
    }, []);

    // Chargement initial des tokens
    useEffect(() => {
        getTokens().catch(console.error);
    }, [getTokens]);

    // Réinitialiser la page courante lorsque le terme de recherche change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return {
        tokens,
        tokenPrices,
        currentTokens,
        isLoading,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        totalPages,
        pageSize: ITEMS_PER_PAGE,
        getTokenPrices
    };
};
