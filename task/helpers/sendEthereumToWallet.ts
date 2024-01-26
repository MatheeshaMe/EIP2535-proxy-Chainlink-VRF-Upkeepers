import { ethers } from "ethers";

export async function sendEthereumToWallet(wallet: ethers.Wallet, amountToSend: ethers.BigNumberish) {
    try {
      const tx = await wallet.sendTransaction({
        to: wallet.address,
        value: amountToSend,
      });
      await tx.wait();
      return tx
    } catch (error) {
      console.error(error);
    }
  }