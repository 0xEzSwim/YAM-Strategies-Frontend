import { AssetModel } from './Asset.model';
import { HoldingModel } from './Holding.model';

export class StrategyModel {
    name!: string;
    description!: string;
    contractAbi!: any;
    underlyingAsset!: AssetModel;
    share!: AssetModel;
    isPaused!: boolean;

    tvl!: number;
    holdings?: HoldingModel[];
    apy?: number;

    constructor(params: StrategyModel) {
        Object.assign(this, params);
    }
}
