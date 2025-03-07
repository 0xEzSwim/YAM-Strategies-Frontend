import { AssetModel } from './Asset.model';

export type OrderModel = {
    id: number;
    isActive: boolean;
    userAddress: `0x${string}`;
    buyerAsset: AssetModel;
    basePrice: number;
    price: number;
    displayedPrice: number;
    offerAsset: AssetModel;
    amount: number;
    filledAmount: number;
};
