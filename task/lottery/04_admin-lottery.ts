// flip lottery state
// draw lottery
// check winners

import { task } from "hardhat/config"
import { TaskArguments } from "hardhat/types"
import * as dotenv from "dotenv"
import { Wallet, ethers } from "ethers"
import { Spinner } from "../helpers/loading"
import { CoinCave__Lottery, CoinCave__Lottery__factory } from "../../typechain-types"
import { COIN_CAVE_DIAMOND_PROXY, TOKEN_CONTRACT_ADDRESS } from "../../utils/config/varbs"
dotenv.config()




task(
    "draw-lottery",
    "Draw lottery,(Finish the current lottery and send rewards to the winners and start new round)"
).setAction(async () => {
    const provider = new ethers.JsonRpcProvider(
        `${process.env.PROVIDER_URL!}/${process.env.ALCHEMY_API_KEY_T!}`
    )
    const spinner: Spinner = new Spinner()
    const ownerWallet = new Wallet(process.env.PRIVATE_KEY!)
    const owner_signer = ownerWallet.connect(provider)
    const lotteryContract: CoinCave__Lottery = CoinCave__Lottery__factory.connect(
        COIN_CAVE_DIAMOND_PROXY,
        owner_signer
    )
    spinner.start()
    const currentLotteryRoundId = await lotteryContract.getCurrentRoundId()
    const drawLotteryTx = await lotteryContract.drawLottery(TOKEN_CONTRACT_ADDRESS)

    const drawLotteryTxReceipt = await drawLotteryTx.wait()
    spinner.stop()
    console.log(
        drawLotteryTxReceipt?.status == 1
            ? `Lottery drawed currentLotteryRoundId : ${+currentLotteryRoundId.toString()} txHashc : ${
                  drawLotteryTxReceipt?.hash
              }`
            : `Lottery draw error txHashc : ${drawLotteryTxReceipt?.hash}`
    )
})

