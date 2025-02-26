'use client';

import { useState, useEffect } from 'react';
import { TokenList } from './components/token-list';
import { TokenDetails } from './components/token-details';
import { AssetModel } from '@/models';

// Simulate Token DB
const allTokens: AssetModel[] = [
    {
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as `0x${string}`,
        symbol: 'ETH',
        supply: 2.5,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
    },
    {
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' as `0x${string}`,
        symbol: 'WBTC',
        supply: 0.15,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png'
    },
    {
        address: '0x173fd7434B8B50dF08e3298f173487ebDB35FD14' as `0x${string}`,
        symbol: 'SOL',
        supply: 0,
        decimals: 9,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png'
    },
    {
        address: '0x1213...' as `0x${string}`,
        symbol: 'ADA',
        supply: 2000,
        decimals: 6,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2010.png'
    },
    {
        address: '0x1415...' as `0x${string}`,
        symbol: 'DOT',
        supply: 150,
        decimals: 10,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6636.png'
    },
    {
        address: '0x1617...' as `0x${string}`,
        symbol: 'BNB',
        supply: 25,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png'
    },
    {
        address: '0x1718...' as `0x${string}`,
        symbol: 'XRP',
        supply: 10000,
        decimals: 6,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/52.png'
    },
    {
        address: '0x1819...' as `0x${string}`,
        symbol: 'USDC',
        supply: 7500,
        decimals: 6,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png'
    },
    {
        address: '0x1920...' as `0x${string}`,
        symbol: 'DOGE',
        supply: 15000,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/74.png'
    },
    {
        address: '0x2021...' as `0x${string}`,
        symbol: 'AVAX',
        supply: 200,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png'
    },
    {
        address: '0x2122...' as `0x${string}`,
        symbol: 'MATIC',
        supply: 3000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png'
    },
    {
        address: '0x2223...' as `0x${string}`,
        symbol: 'DAI',
        supply: 4000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png'
    },
    {
        address: '0x2324...' as `0x${string}`,
        symbol: 'SHIB',
        supply: 1000000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png'
    },
    {
        address: '0x2425...' as `0x${string}`,
        symbol: 'TRX',
        supply: 8000,
        decimals: 6,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1958.png'
    },
    {
        address: '0x2526...' as `0x${string}`,
        symbol: 'UNI',
        supply: 300,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png'
    },
    {
        address: '0x2627...' as `0x${string}`,
        symbol: 'LINK',
        supply: 500,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png'
    },
    {
        address: '0x2728...' as `0x${string}`,
        symbol: 'ATOM',
        supply: 250,
        decimals: 6,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3794.png'
    },
    {
        address: '0x2829...' as `0x${string}`,
        symbol: 'XLM',
        supply: 12000,
        decimals: 7,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/512.png'
    },
    {
        address: '0x2930...' as `0x${string}`,
        symbol: 'LTC',
        supply: 150,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2.png'
    },
    {
        address: '0x3031...' as `0x${string}`,
        symbol: 'BCH',
        supply: 100,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1831.png'
    },
    {
        address: '0x3132...' as `0x${string}`,
        symbol: 'ALGO',
        supply: 5000,
        decimals: 6,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4030.png'
    },
    {
        address: '0x3233...' as `0x${string}`,
        symbol: 'XMR',
        supply: 75,
        decimals: 12,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/328.png'
    },
    {
        address: '0x3334...' as `0x${string}`,
        symbol: 'FIL',
        supply: 400,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2280.png'
    },
    {
        address: '0x3435...' as `0x${string}`,
        symbol: 'ETC',
        supply: 300,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1321.png'
    },
    {
        address: '0x3536...' as `0x${string}`,
        symbol: 'HBAR',
        supply: 15000,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4642.png'
    },
    {
        address: '0x3637...' as `0x${string}`,
        symbol: 'VET',
        supply: 20000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3077.png'
    },
    {
        address: '0x3738...' as `0x${string}`,
        symbol: 'NEAR',
        supply: 800,
        decimals: 24,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6535.png'
    },
    {
        address: '0x3839...' as `0x${string}`,
        symbol: 'ICP',
        supply: 200,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/8916.png'
    },
    {
        address: '0x3940...' as `0x${string}`,
        symbol: 'FLOW',
        supply: 1000,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4558.png'
    },
    {
        address: '0x3941...' as `0x${string}`,
        symbol: 'SAND',
        supply: 2500,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6210.png'
    },
    {
        address: '0x3942...' as `0x${string}`,
        symbol: 'MANA',
        supply: 1800,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1966.png'
    },
    {
        address: '0x4041...' as `0x${string}`,
        symbol: 'GRT',
        supply: 3000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6719.png'
    },
    {
        address: '0x4142...' as `0x${string}`,
        symbol: 'AAVE',
        supply: 50,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7278.png'
    },
    {
        address: '0x4243...' as `0x${string}`,
        symbol: 'XTZ',
        supply: 1200,
        decimals: 6,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2011.png'
    },
    {
        address: '0x4344...' as `0x${string}`,
        symbol: 'EOS',
        supply: 2500,
        decimals: 4,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1765.png'
    },
    {
        address: '0x4445...' as `0x${string}`,
        symbol: 'CAKE',
        supply: 400,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7186.png'
    },
    {
        address: '0x4546...' as `0x${string}`,
        symbol: 'THETA',
        supply: 1500,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2416.png'
    },
    {
        address: '0x4647...' as `0x${string}`,
        symbol: 'AXS',
        supply: 200,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6783.png'
    },
    {
        address: '0x4748...' as `0x${string}`,
        symbol: 'FTM',
        supply: 5000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3513.png'
    },
    {
        address: '0x4849...' as `0x${string}`,
        symbol: 'KCS',
        supply: 300,
        decimals: 6,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2087.png'
    },
    {
        address: '0x4950...' as `0x${string}`,
        symbol: 'NEO',
        supply: 150,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1376.png'
    },
    {
        address: '0x5051...' as `0x${string}`,
        symbol: 'MIOTA',
        supply: 8000,
        decimals: 6,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1720.png'
    },
    {
        address: '0x5152...' as `0x${string}`,
        symbol: 'WAVES',
        supply: 400,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1274.png'
    },
    {
        address: '0x5253...' as `0x${string}`,
        symbol: 'MKR',
        supply: 20,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1518.png'
    },
    {
        address: '0x5354...' as `0x${string}`,
        symbol: 'BTT',
        supply: 50000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/16086.png'
    },
    {
        address: '0x5455...' as `0x${string}`,
        symbol: 'ENJ',
        supply: 2000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2130.png'
    },
    {
        address: '0x5556...' as `0x${string}`,
        symbol: 'ZEC',
        supply: 100,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1437.png'
    },
    {
        address: '0x5657...' as `0x${string}`,
        symbol: 'CHZ',
        supply: 8000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4066.png'
    },
    {
        address: '0x5758...' as `0x${string}`,
        symbol: 'XEM',
        supply: 15000,
        decimals: 6,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/873.png'
    },
    {
        address: '0x5859...' as `0x${string}`,
        symbol: 'COMP',
        supply: 50,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5692.png'
    },
    {
        address: '0x5960...' as `0x${string}`,
        symbol: 'HOT',
        supply: 100000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2682.png'
    },
    {
        address: '0x6061...' as `0x${string}`,
        symbol: 'DASH',
        supply: 120,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/131.png'
    },
    {
        address: '0x6162...' as `0x${string}`,
        symbol: 'NEXO',
        supply: 3000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2694.png'
    },
    {
        address: '0x6263...' as `0x${string}`,
        symbol: 'DCR',
        supply: 200,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1168.png'
    },
    {
        address: '0x6364...' as `0x${string}`,
        symbol: 'CEL',
        supply: 1000,
        decimals: 4,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2700.png'
    },
    {
        address: '0x6465...' as `0x${string}`,
        symbol: 'ZIL',
        supply: 25000,
        decimals: 12,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2469.png'
    },
    {
        address: '0x6566...' as `0x${string}`,
        symbol: 'BAT',
        supply: 5000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1697.png'
    },
    {
        address: '0x6667...' as `0x${string}`,
        symbol: 'QTUM',
        supply: 800,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1684.png'
    },
    {
        address: '0x6768...' as `0x${string}`,
        symbol: 'RVN',
        supply: 20000,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2577.png'
    },
    {
        address: '0x6869...' as `0x${string}`,
        symbol: 'ONE',
        supply: 30000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3945.png'
    },
    {
        address: '0x6970...' as `0x${string}`,
        symbol: 'ICX',
        supply: 4000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2099.png'
    },
    {
        address: '0x7071...' as `0x${string}`,
        symbol: 'ONT',
        supply: 6000,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2566.png'
    },
    {
        address: '0x7172...' as `0x${string}`,
        symbol: 'DGB',
        supply: 50000,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/109.png'
    },
    {
        address: '0x7273...' as `0x${string}`,
        symbol: 'SC',
        supply: 100000,
        decimals: 24,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1042.png'
    },
    {
        address: '0x7374...' as `0x${string}`,
        symbol: 'ZRX',
        supply: 8000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1896.png'
    },
    {
        address: '0x7475...' as `0x${string}`,
        symbol: 'IOST',
        supply: 120000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2405.png'
    },
    {
        address: '0x7576...' as `0x${string}`,
        symbol: 'ANKR',
        supply: 80000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3783.png'
    },
    {
        address: '0x7677...' as `0x${string}`,
        symbol: 'WAN',
        supply: 3000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2606.png'
    },
    {
        address: '0x7778...' as `0x${string}`,
        symbol: 'NANO',
        supply: 4000,
        decimals: 30,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1567.png'
    },
    {
        address: '0x7879...' as `0x${string}`,
        symbol: 'CELO',
        supply: 2500,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5567.png'
    },
    {
        address: '0x7980...' as `0x${string}`,
        symbol: 'SNX',
        supply: 1000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2586.png'
    },
    {
        address: '0x8081...' as `0x${string}`,
        symbol: 'ROSE',
        supply: 15000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/7653.png'
    },
    {
        address: '0x8182...' as `0x${string}`,
        symbol: 'KAVA',
        supply: 2000,
        decimals: 6,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4846.png'
    },
    {
        address: '0x8283...' as `0x${string}`,
        symbol: 'CRV',
        supply: 3000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6538.png'
    },
    {
        address: '0x8384...' as `0x${string}`,
        symbol: 'STORJ',
        supply: 5000,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1772.png'
    },
    {
        address: '0x8485...' as `0x${string}`,
        symbol: 'BAND',
        supply: 1500,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4679.png'
    },
    {
        address: '0x8586...' as `0x${string}`,
        symbol: 'REEF',
        supply: 200000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6951.png'
    },
    {
        address: '0x8687...' as `0x${string}`,
        symbol: 'OCEAN',
        supply: 4000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3911.png'
    },
    {
        address: '0x8788...' as `0x${string}`,
        symbol: 'RSR',
        supply: 100000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3964.png'
    },
    {
        address: '0x8889...' as `0x${string}`,
        symbol: 'REN',
        supply: 8000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2539.png'
    },
    {
        address: '0x8990...' as `0x${string}`,
        symbol: 'FET',
        supply: 12000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3773.png'
    },
    {
        address: '0x9091...' as `0x${string}`,
        symbol: 'KSM',
        supply: 300,
        decimals: 12,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5034.png'
    },
    {
        address: '0x9192...' as `0x${string}`,
        symbol: 'IOTX',
        supply: 50000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2777.png'
    },
    {
        address: '0x9293...' as `0x${string}`,
        symbol: 'GLM',
        supply: 10000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1455.png'
    },
    {
        address: '0x9394...' as `0x${string}`,
        symbol: 'CTSI',
        supply: 8000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5444.png'
    },
    {
        address: '0x9495...' as `0x${string}`,
        symbol: 'MINA',
        supply: 4000,
        decimals: 9,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/8646.png'
    },
    {
        address: '0x9596...' as `0x${string}`,
        symbol: 'AR',
        supply: 500,
        decimals: 12,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5632.png'
    },
    {
        address: '0x9697...' as `0x${string}`,
        symbol: 'CKB',
        supply: 200000,
        decimals: 8,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4948.png'
    },
    {
        address: '0x9798...' as `0x${string}`,
        symbol: 'SKL',
        supply: 15000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5691.png'
    },
    {
        address: '0x9899...' as `0x${string}`,
        symbol: 'PROM',
        supply: 2000,
        decimals: 18,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3820.png'
    },
    {
        address: '0x9900...' as `0x${string}`,
        symbol: 'SRM',
        supply: 5000,
        decimals: 6,
        logoUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/6187.png'
    }
];

// Simulate API call with pagination and search
const fetchTokens = async (page: number, searchQuery: string = '', limit: number = 10): Promise<{ tokens: AssetModel[]; hasMore: boolean }> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let filteredTokens = allTokens;

    // If search query is 3 or more characters, return all matching tokens
    if (searchQuery.length >= 3) {
        filteredTokens = allTokens.filter((token) => token.symbol.toLowerCase().includes(searchQuery.toLowerCase()));
        return {
            tokens: filteredTokens,
            hasMore: false
        };
    }

    // Normal pagination if no search
    const start = page * limit;
    const end = start + limit;
    const paginatedTokens = filteredTokens.slice(start, end);
    const hasMore = end < filteredTokens.length;

    return {
        tokens: paginatedTokens,
        hasMore
    };
};

const SellTokens = () => {
    const [tokens, setTokens] = useState<AssetModel[]>([]);
    const [selectedToken, setSelectedToken] = useState<AssetModel | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const loadMoreTokens = async () => {
        if (isLoadingMore || !hasMore || searchQuery.length >= 3) return;

        try {
            setIsLoadingMore(true);
            const { tokens: newTokens, hasMore: moreAvailable } = await fetchTokens(currentPage, searchQuery);
            setTokens((prev) => [...prev, ...newTokens]);
            setHasMore(moreAvailable);
            setCurrentPage((prev) => prev + 1);
        } catch (error) {
            console.error('Failed to fetch more tokens:', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (query.length >= 3) {
            try {
                setIsLoading(true);
                const { tokens: searchResults } = await fetchTokens(0, query);
                setTokens(searchResults);
                setHasMore(false);
            } catch (error) {
                console.error('Failed to search tokens:', error);
            } finally {
                setIsLoading(false);
            }
        } else if (query.length === 0) {
            // Reset to initial state when search is cleared
            setCurrentPage(0);
            loadInitialTokens();
        }
    };

    const loadInitialTokens = async () => {
        try {
            setIsLoading(true);
            const { tokens: initialTokens, hasMore: moreAvailable } = await fetchTokens(0, '');
            setTokens(initialTokens);
            setHasMore(moreAvailable);
            setCurrentPage(1);
        } catch (error) {
            console.error('Failed to fetch initial tokens:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadInitialTokens();
    }, []);

    return (
        <div className="flex flex-col h-[calc(90vh-theme(spacing.16))] gap-4">
            <h1 className="text-3xl font-bold">Sell tokens</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0 flex-1">
                <div className="order-2 md:order-1 overflow-hidden flex flex-col">
                    <TokenList
                        tokens={tokens}
                        isLoading={isLoading}
                        isLoadingMore={isLoadingMore}
                        hasMore={hasMore}
                        onLoadMore={loadMoreTokens}
                        onSelectToken={setSelectedToken}
                        onSearch={handleSearch}
                        searchQuery={searchQuery}
                    />
                </div>
                <div className="order-1 md:order-2 overflow-hidden flex flex-col">
                    <TokenDetails token={selectedToken} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
};

export default SellTokens;
