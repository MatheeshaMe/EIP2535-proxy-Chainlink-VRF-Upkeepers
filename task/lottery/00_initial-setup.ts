import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"

import { Spinner } from "../helpers/loading"
import { ethers } from "ethers"
import { createRandomWallets } from "../helpers/randomWallet"
import * as dotenv from "dotenv"
import { readFileSync } from "../helpers/readFileSync"
import { expect } from "chai"
import { writeFileSync } from "../helpers/writeFileSync"
import { WalletArray, walletsFilePath } from "../../utils/config/varbs"
dotenv.config()

task("initial-setup", "setup the initial things, wallets, and add funds")
    .addParam("wallets", "The amount of wallets", "9")
    .addParam("isnew", "should generate new wallets", "false")
    .setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void> => {
        const spinner: Spinner = new Spinner()
        const { wallets, isnew } = taskArgs
        const provider = new ethers.JsonRpcProvider(
            `${process.env.PROVIDER_URL!}/${process.env.ALCHEMY_API_KEY_T!}`
        )
        const sepoliaWallet8ESigner = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)
        if (isnew == "true" ? true : false) {
            const generateNewWallets = await createRandomWallets(+wallets - 1)
            await writeFileSync(walletsFilePath, JSON.stringify(generateNewWallets), true)
        }
        const generatedWallets = await readFileSync<WalletArray[]>(walletsFilePath)
        //send Ethereum to generated wallets
        for (let index = 0; index < generatedWallets.length; index++) {
            const wallet = generatedWallets[index]
            console.log(wallet.address)
            try {
                const amountToSend = hre.ethers.parseEther("0.1")
                const tx = await sepoliaWallet8ESigner.sendTransaction({
                    to: wallet.address,
                    value: amountToSend,
                })
                await tx.wait()
                console.log(
                    `Sent 0.1 ETH to wallet ${wallet.address}. Transaction hash:${tx.hash}`
                )
            } catch (error) {
                console.error(error)
            }
        }
        //get each wallet balance
        spinner.start()
        for (let index = 0; index < generatedWallets.length; index++) {
            const wallet = generatedWallets[index]
            const balance = await sepoliaWallet8ESigner?.provider?.getBalance(wallet.address)
            spinner.stop()
            console.log(`address : ${wallet.address}... balance : ${ethers.formatEther(balance!)}`)
            expect(+ethers.formatEther(balance!)).to.greaterThan(0)
        }
    })
