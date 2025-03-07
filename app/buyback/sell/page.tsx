'use client';

import { useState } from 'react';
import { TokenList, TokenDetails } from '../components';
import { AssetModel } from '@/models';

const SellTokens = () => {
    const [selectedToken, setSelectedToken] = useState<AssetModel | undefined>();

    return (
        <div className="flex flex-col h-[calc(90vh-theme(spacing.16))] gap-4">
            <h1 className="text-3xl font-bold">Sell tokens</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0 flex-1">
                <div className="order-2 md:order-1 overflow-hidden flex flex-col">
                    <TokenList onSelectToken={setSelectedToken} selectedToken={selectedToken} />
                </div>
                <div className="order-1 md:order-2 overflow-hidden flex flex-col">
                    <TokenDetails token={selectedToken} />
                </div>
            </div>
        </div>
    );
};

export default SellTokens;
