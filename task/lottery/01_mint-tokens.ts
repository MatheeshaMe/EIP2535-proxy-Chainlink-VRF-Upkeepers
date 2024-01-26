import { task } from "hardhat/config"
import { Mnemonic, Wallet, ethers } from "ethers"
import * as dotenv from "dotenv"
import { TaskArguments } from "hardhat/types"
import { readFileSync } from "../helpers/readFileSync"
import { Spinner } from "../helpers/loading"
import { Mock__USDTToken } from "../../typechain-types/contracts/mocks/USDT.mock.sol/Mock__USDTToken"
import { Mock__USDTToken__factory } from "../../typechain-types/factories/contracts/mocks/USDT.mock.sol/Mock__USDTToken__factory"
import {
    COIN_CAVE_DIAMOND_PROXY,
    TOKEN_CONTRACT_ADDRESS,
    USDT_THRESHOLD,
} from "../../utils/config/varbs"
dotenv.config()

const walletsFilePath = "./wallets.json"
interface WalletArray {
    address: string
    mnemonic: Mnemonic | null
    privateKey: string
}

task("mint-tokens", "mint MTK with ethereum to generated wallets")
    .addParam("amount", "The amount of token should be minted", "1000000000")
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
            const tokenContract: Mock__USDTToken = Mock__USDTToken__factory.connect(
                TOKEN_CONTRACT_ADDRESS,
                signer
            )
            spinner.start()
            const tx = await tokenContract.mint(wallet.address, amount)
            const receipt = await tx.wait()
            spinner.stop()
            spinner.start()
            const approveTx = await tokenContract.approve(COIN_CAVE_DIAMOND_PROXY, amount)
            const approveRecipt = await approveTx.wait()
            console.log(
                receipt?.status == 1 && approveRecipt?.status == 1
                    ? `✅ Minted ${amount / USDT_THRESHOLD} tokens, address:${
                          wallet.address
                      } transaction hash: ${tx.hash} && ✅ Allowed ${
                          amount / USDT_THRESHOLD
                      } tokens, spent on address:${COIN_CAVE_DIAMOND_PROXY} from ${wallet.address}`
                    : `Error in transaction ${tx.hash} , mintStatus=${receipt?.status} , approveStatus = ${approveRecipt?.status}`
            )
        }
    })

task("approve-tokens", "mint MTK with ethereum to generated wallets")
    .addParam("amount", "The amount of token should be minted", "1000000000")
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
            const tokenContract: Mock__USDTToken = Mock__USDTToken__factory.connect(
                TOKEN_CONTRACT_ADDRESS,
                signer
            )
            spinner.start()
            const approveTx = await tokenContract.approve(COIN_CAVE_DIAMOND_PROXY, amount)
            const approveRecipt = await approveTx.wait()
            console.log(
                approveRecipt?.status == 1
                    ? `✅ Allowed ${
                          amount / USDT_THRESHOLD
                      } tokens, spent on address:${COIN_CAVE_DIAMOND_PROXY} from ${
                          wallet.address
                      } transaction hash: ${approveTx.hash}`
                    : `Error in transaction ${approveTx.hash} , approveStatus = ${approveRecipt?.status}`
            )
        }
    })
