import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const convertNumberToBigInt = (_number: number, _decimals: number): bigint => {
    return BigInt(Math.floor(_number * 10 ** _decimals));
};
