import { AssetModel } from './Asset.model';

export class StrategyModel {
    name!: string;
    description!: string;
    contractAbi!: any;
    underlyingAsset!: AssetModel;
    shares!: AssetModel;
    isPaused!: boolean;

    tvl?: number;
    apy?: number;
    holdings?: { symbol: string; address: `0x${string}`; value: number; amount: number; allocation: number }[];

    constructor(params: StrategyModel) {
        Object.assign(this, params);
    }
}
