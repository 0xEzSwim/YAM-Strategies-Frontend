'use client';

import { useState } from 'react';
import { AssetModel } from '@/models';

// Components
import { Search, ArrowDown } from 'lucide-react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_TOKEN_IMAGE = '/logo.png';

const TokenTableSkeleton = () => {
    return (
        <>
            {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                    <TableCell className="w-12">
                        <Skeleton className="h-4 w-4" />
                    </TableCell>
                    <TableCell className="w-[200px]">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </TableCell>
                    <TableCell className="w-[120px]">
                        <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="w-[120px]">
                        <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-24" />
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
};

interface LiquidityListProps {
    tokens: AssetModel[];
    stablecoins: AssetModel[];
    selectedTokens: Set<string>;
    isLoading: boolean;
    selectedStablecoin: AssetModel | null;
    stablecoinAmount: string;
    isDialogOpen: boolean;
    onSelectToken: (token: AssetModel) => void;
    onSelectAll: () => void;
    onStablecoinSelect: (stablecoin: AssetModel) => void;
    onAmountChange: (amount: string) => void;
    onMaxClick: () => void;
    onDialogOpenChange: (open: boolean) => void;
    onProvideLiquidity: () => void;
    tableContainerRef: React.RefObject<HTMLDivElement>;
    selectAll: boolean;
    getSelectedTokensDetails: () => AssetModel[];
}

const LiquidityList = ({
    tokens,
    stablecoins,
    selectedTokens,
    isLoading,
    selectedStablecoin,
    stablecoinAmount,
    isDialogOpen,
    onSelectToken,
    onSelectAll,
    onStablecoinSelect,
    onAmountChange,
    onMaxClick,
    onDialogOpenChange,
    onProvideLiquidity,
    tableContainerRef,
    selectAll,
    getSelectedTokensDetails
}: LiquidityListProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <Card className="flex flex-col flex-1 min-h-0">
            <CardHeader className="flex-none p-4 space-y-0">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 max-w-2xl">
                        <div className="flex items-center gap-2">
                            <div className="relative w-80">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher un token..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 focus-visible:ring-0"
                                />
                            </div>
                        </div>
                        <div
                            className={`bg-muted px-3 py-2 rounded-md flex items-center gap-2 transition-opacity duration-200
                                ${selectedTokens.size === 0 ? 'opacity-0' : 'opacity-100'}`}
                        >
                            <div className="flex -space-x-2">
                                {getSelectedTokensDetails().map((token) => (
                                    <Image
                                        key={token.address}
                                        src={token.logoUrl || DEFAULT_TOKEN_IMAGE}
                                        alt={token.shortName}
                                        width={24}
                                        height={24}
                                        className="rounded-full border-2 border-background"
                                    />
                                ))}
                            </div>
                            <span className="font-medium min-w-[120px]">
                                {selectedTokens.size > 0 ? `${selectedTokens.size} token(s) sélectionné(s)` : 'Aucun token sélectionné'}
                            </span>
                        </div>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
                        <DialogTrigger asChild>
                            <Button disabled={selectedTokens.size === 0}>Provide Liquidity</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>Provide Liquidity</DialogTitle>
                            <div className="space-y-1">
                                <CardDescription>Provide liquidity for {selectedTokens.size} selected token(s)</CardDescription>
                            </div>
                            <div className="flex flex-col gap-6 py-4">
                                <div className="grid gap-4 items-end">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Stablecoin</label>
                                        <div className="flex items-center gap-2 p-1 rounded-lg border bg-muted">
                                            <Select
                                                value={selectedStablecoin?.shortName}
                                                onValueChange={(value) => onStablecoinSelect(stablecoins.find((s) => s.shortName === value)!)}
                                            >
                                                <SelectTrigger className="text-md font-medium bg-transparent focus:ring-0 focus:ring-offset-0 shadow-none border-0 p-0 pl-2 [appearance:textfield]">
                                                    <SelectValue>
                                                        {selectedStablecoin && (
                                                            <div className="flex items-center gap-2">
                                                                <Image
                                                                    src={selectedStablecoin.logoUrl || DEFAULT_TOKEN_IMAGE}
                                                                    alt={`${selectedStablecoin.shortName} logo`}
                                                                    width={24}
                                                                    height={24}
                                                                    className="rounded-full"
                                                                />
                                                                {selectedStablecoin.shortName}
                                                            </div>
                                                        )}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {stablecoins.map((stablecoin) => (
                                                        <SelectItem key={stablecoin.address} value={stablecoin.shortName}>
                                                            <div className="flex items-center gap-2">
                                                                <Image
                                                                    src={stablecoin.logoUrl || DEFAULT_TOKEN_IMAGE}
                                                                    alt={`${stablecoin.shortName} logo`}
                                                                    width={24}
                                                                    height={24}
                                                                    className="rounded-full"
                                                                />
                                                                {stablecoin.shortName}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Amount</label>
                                        <div className="flex items-center gap-2 p-1 rounded-lg border bg-muted">
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                className="text-md font-medium bg-transparent focus-visible:ring-0 shadow-none border-0 p-0 pl-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                value={stablecoinAmount}
                                                onChange={(e) => onAmountChange(e.target.value)}
                                            />
                                            <Button size="sm" className="m-0 ml-2 mr-2" onClick={onMaxClick}>
                                                Max
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="self-center flex justify-center gap-4">
                                        <ArrowDown className="block w-8 h-8 text-muted-foreground" />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Selected Tokens</label>
                                        <div className="p-2 rounded-lg border bg-muted">
                                            <div className="flex items-center gap-2 h-7">
                                                <div className="flex -space-x-2">
                                                    {getSelectedTokensDetails().map((token) => (
                                                        <Image
                                                            key={token.address}
                                                            src={token.logoUrl || DEFAULT_TOKEN_IMAGE}
                                                            alt={token.shortName}
                                                            width={24}
                                                            height={24}
                                                            className="rounded-full border-2 border-background"
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-medium truncate">{selectedTokens.size} token(s)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-6">
                                <Button variant="outline" className="flex-1" onClick={() => onDialogOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button className="flex-1" onClick={onProvideLiquidity}>
                                    Confirm
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0">
                <div className="rounded-md border h-full flex flex-col">
                    <div className="border-b">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12 bg-background">
                                        <Checkbox checked={selectAll} onCheckedChange={onSelectAll} />
                                    </TableHead>
                                    <TableHead className="w-[200px] bg-background">Token</TableHead>
                                    <TableHead className="w-[120px] bg-background">Short Name</TableHead>
                                    <TableHead className="w-[120px] bg-background">Supply</TableHead>
                                    <TableHead className="bg-background">Address</TableHead>
                                </TableRow>
                            </TableHeader>
                        </Table>
                    </div>
                    <div ref={tableContainerRef} className="flex-1 overflow-auto min-h-0">
                        <Table>
                            <TableBody>
                                {isLoading ? (
                                    <TokenTableSkeleton />
                                ) : tokens.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            Aucun token trouvé
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {tokens.map((token) => (
                                            <TableRow key={token.address}>
                                                <TableCell className="w-12">
                                                    <Checkbox
                                                        checked={selectedTokens.has(token.address)}
                                                        onCheckedChange={() => onSelectToken(token)}
                                                    />
                                                </TableCell>
                                                <TableCell className="w-[200px]">
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src={token.logoUrl || DEFAULT_TOKEN_IMAGE}
                                                            alt={token.shortName}
                                                            width={24}
                                                            height={24}
                                                            className="rounded-full"
                                                        />
                                                        {token.shortName}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="w-[120px]">{token.shortName}</TableCell>
                                                <TableCell className="w-[120px]">{token.supply}</TableCell>
                                                <TableCell className="font-mono">
                                                    {token.address.slice(0, 6)}...{token.address.slice(-4)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export { LiquidityList };
