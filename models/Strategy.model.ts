import { AssetModel } from './Asset.model';

export class StrategyModel {
    name!: string;
    description!: string;
    contractAbi!: any;
    underlyingAsset!: AssetModel;
    share!: AssetModel;
    isPaused!: boolean;

    holdings?: { symbol: string; address: `0x${string}`; value: number; amount: number; allocation: number }[];
    tvl?: number;
    apy?: number;

    constructor(params: StrategyModel) {
        Object.assign(this, params);
    }
}
