export type AssetModel = {
    address: `0x${string}`;
    symbol: string;
    supply: number;
    decimals: number;
    isERC20?: boolean;
    isStableCoin?: boolean;
    isCSMToken?: boolean;

    logoUrl?: string;
};
