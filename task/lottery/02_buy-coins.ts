import { task } from "hardhat/config"
import { TaskArguments } from "hardhat/types"
import { readFileSync } from "../helpers/readFileSync"
import {
    COIN_CAVE_DIAMOND_PROXY,
    TOKEN_CONTRACT_ADDRESS,
    USDT_THRESHOLD,
    WalletArray,
    walletsFilePath,
} from "../../utils/config/varbs"
import { Wallet, ethers } from "ethers"
import { Spinner } from "../helpers/loading"
import { CoinCave__Lottery, CoinCave__Lottery__factory } from "../../typechain-types"

task("buy-coins", "Buy coins with USDT on the lottery contract")
    .addParam("amount", "The amount of coins", "100000000")
    .setAction(async (taskArgs: TaskArguments) => {
        const { amount } = taskArgs
        const generatedWallets = await readFileSync<WalletArray[]>(walletsFilePath)
        for (const wallet of generatedWallets) {
            const provider = new ethers.JsonRpcProvider(
                `${process.env.PROVIDER_URL!}/${process.env.ALCHEMY_API_KEY_T!}`
            )
            const _wallet = new Wallet(wallet.privateKey)
            const signer = _wallet.connect(provider)
            const spinner: Spinner = new Spinner()
            const lotteryContract: CoinCave__Lottery = CoinCave__Lottery__factory.connect(
                COIN_CAVE_DIAMOND_PROXY,
                signer
            )
            spinner.start()
            const tx = await lotteryContract.buyCoins(amount, TOKEN_CONTRACT_ADDRESS)
            const receipt = await tx.wait()
            spinner.stop()
            console.log(
                receipt?.status == 1
                    ? `✅ ${amount / USDT_THRESHOLD} coins bought , address:${
                          wallet.address
                      } transaction hash: ${tx.hash}`
                    : `Buy coins error transaction hash: ${tx.hash}`
            )
        }
    })
