import { ethers } from "ethers";

export const createRandomWallets = async (amount: number) => {
    let wallets: {
        address: string;
        mnemonic: string | null;
        privateKey: string;
    }[] = [];

    for (let index = 0; index < amount; index++) {
        const wallet = ethers.Wallet.createRandom();
        wallets.push({
            address: wallet.address,
            mnemonic: wallet.mnemonic?.phrase!,
            privateKey: wallet.privateKey,
        });
    }
    return wallets;
};
