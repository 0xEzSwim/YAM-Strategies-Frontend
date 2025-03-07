'use client';

import { useState, useRef, useEffect } from 'react';
import { useTokens, useStablecoins } from '@/hooks';
import { AssetModel } from '@/models';
import { ActiveLiquidity, LiquidityList } from '../components';
import { useUserLiquidityTokens } from '../hooks/use-user-liquidity-tokens';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

const LiquidityProviding = () => {
    const { tokens, isLoading } = useTokens();
    const { stablecoins, isLoading: isStablecoinsLoading } = useStablecoins();
    const { address } = useAccount();
    const { userLiquidityTokens, error } = useUserLiquidityTokens(address);
    const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [stablecoinAmount, setStablecoinAmount] = useState('');
    const [selectedStablecoin, setSelectedStablecoin] = useState<AssetModel | null>(null);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (stablecoins.length > 0 && !selectedStablecoin) {
            setSelectedStablecoin(stablecoins[0]);
        }
    }, [stablecoins, selectedStablecoin]);

    useEffect(() => {
        if (error) {
            toast.error('Error', { description: error.message });
        }
    }, [error]);

    // Sélectionner automatiquement le premier token lorsque les tokens sont chargés
    useEffect(() => {
        if (!isLoading && tokens.length > 0 && selectedTokens.size === 0) {
            const firstToken = tokens[0];
            if (firstToken) {
                const newSelected = new Set<string>([firstToken.address]);
                setSelectedTokens(newSelected);
                setSelectAll(newSelected.size === tokens.length);
            }
        }
    }, [tokens, isLoading, selectedTokens.size]);

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedTokens(new Set());
        } else {
            const newSelected = new Set(tokens.map((token) => token.address));
            setSelectedTokens(newSelected);
        }
        setSelectAll(!selectAll);
    };

    const handleSelectToken = (token: AssetModel) => {
        const newSelected = new Set(selectedTokens);
        if (newSelected.has(token.address)) {
            newSelected.delete(token.address);
        } else {
            newSelected.add(token.address);
        }
        setSelectedTokens(newSelected);
        setSelectAll(newSelected.size === tokens.length);
    };

    const handleAmountChange = (value: string) => {
        if (/^\d*\.?\d*$/.test(value) || value === '') {
            setStablecoinAmount(value);
        }
    };

    const handleMaxClick = () => {
        if (selectedStablecoin) {
            setStablecoinAmount(selectedStablecoin.supply.toString());
        }
    };

    const handleProvideLiquidity = () => {
        if (!stablecoinAmount || parseFloat(stablecoinAmount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (selectedTokens.size === 0) {
            toast.error('Please select at least one token');
            return;
        }

        if (!selectedStablecoin) {
            toast.error('Please select a stablecoin');
            return;
        }

        // TODO: Implement liquidity providing logic
        toast.success(`Providing liquidity of ${stablecoinAmount} ${selectedStablecoin.shortName} for ${selectedTokens.size} token(s)`);
        setIsDialogOpen(false);
        setStablecoinAmount('');
    };

    const getSelectedTokensDetails = () => {
        return tokens.filter((token) => selectedTokens.has(token.address)).slice(0, 3);
    };

    const handleFilterChange = () => {
        // Cette fonction ne fait plus rien car nous avons supprimé la logique de filtrage
    };

    return (
        <div className="flex flex-col gap-4 h-[calc(90vh-theme(spacing.16))]">
            <h1 className="text-3xl font-bold">Liquidity Providing</h1>

            <ActiveLiquidity
                stablecoins={stablecoins}
                userLiquidityTokens={userLiquidityTokens}
                isStablecoinsLoading={isStablecoinsLoading}
                onFilterChange={handleFilterChange}
            />

            <LiquidityList
                tokens={tokens}
                stablecoins={stablecoins}
                selectedTokens={selectedTokens}
                isLoading={isLoading}
                selectedStablecoin={selectedStablecoin}
                stablecoinAmount={stablecoinAmount}
                isDialogOpen={isDialogOpen}
                onSelectToken={handleSelectToken}
                onSelectAll={handleSelectAll}
                onStablecoinSelect={setSelectedStablecoin}
                onAmountChange={handleAmountChange}
                onMaxClick={handleMaxClick}
                onDialogOpenChange={setIsDialogOpen}
                onProvideLiquidity={handleProvideLiquidity}
                tableContainerRef={tableContainerRef}
                selectAll={selectAll}
                getSelectedTokensDetails={getSelectedTokensDetails}
            />
        </div>
    );
};

export default LiquidityProviding;
