export type AssetModel = {
    address: `0x${string}`;
    symbol: string;
    shortName: string;
    logoUrl?: string;
    supply: number;
    decimals: number;
    isStableCoin?: boolean;

    isERC20?: boolean;
    isCSMToken?: boolean;
};

export type TokenPrices = {
    fundamentalPrice: number;
    buyBackPrice: number;
};
