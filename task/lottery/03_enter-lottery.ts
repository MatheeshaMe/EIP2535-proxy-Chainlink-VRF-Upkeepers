import { HardhatRuntimeEnvironment } from "hardhat/types"
import { readFileSync } from "../helpers/readFileSync"
import { COIN_CAVE_DIAMOND_PROXY, WalletArray, walletsFilePath } from "../../utils/config/varbs"
import { WinningEntry, winning } from "../../utils/config/constants"
import { Spinner } from "../helpers/loading"
import { Wallet, ethers } from "ethers"
import { CoinCave__Lottery, CoinCave__Lottery__factory } from "../../typechain-types"
import { task } from "hardhat/config"

task("enter", "enter to the lottery with coins").setAction(
    async (hre: HardhatRuntimeEnvironment) => {
        const generatedWallets = await readFileSync<WalletArray[]>(walletsFilePath)
        const enteredWallets = new Set<string>()
        const walletEntries: { wallet: WalletArray; winning: WinningEntry; winningKey: string }[] =
            []

        const walletArray = Object.values(generatedWallets)
        const winningArray = Object.values(winning)
        const winningKeys = Object.keys(winning)
        for (let i = 0; i < Math.min(walletArray.length, winningArray.length); i++) {
            walletEntries.push({
                wallet: walletArray[i],
                winning: winningArray[i],
                winningKey: winningKeys[i],
            })
        }
        const spinner: Spinner = new Spinner()
        const provider = new ethers.JsonRpcProvider(
            `${process.env.PROVIDER_URL!}/${process.env.ALCHEMY_API_KEY_T!}`
        )
        console.log("Open Lottery...")
        spinner.start()
        const ownerWallet = new Wallet(process.env.PRIVATE_KEY!)
        const owner_signer = ownerWallet.connect(provider)
        const lotteryContract: CoinCave__Lottery = CoinCave__Lottery__factory.connect(
            COIN_CAVE_DIAMOND_PROXY,
            owner_signer
        )
        const isLotteryOpen = await lotteryContract.getLotteryStatus()
        if(!isLotteryOpen){
            const openLotteryTx = await lotteryContract.flipLotteryState(true)
            const openLotteryReciept = await openLotteryTx.wait()
            spinner.stop()
            console.log(
                openLotteryReciept?.status == 1
                    ? `Lottery is Open Now`
                    : `Something went wrong on opening lottery`
            )
        }
        console.log("lottery is alreay opened")
        for (const entry of walletEntries) {
            const {
                wallet,
                winning: {
                    _grandPriceCoins,
                    _matchDraw,
                    _matchDrawCoins,
                    _numbers,
                    _ovType,
                    _overUnderDraw,
                    _overUnderDrawCoins,
                },
                winningKey,
            } = entry
            const _wallet = new Wallet(wallet.privateKey)
            const signer = _wallet.connect(provider)
            const lotteryContract: CoinCave__Lottery = CoinCave__Lottery__factory.connect(
                COIN_CAVE_DIAMOND_PROXY,
                signer
            )
            spinner.start()
            const enterTransaction = await lotteryContract.enter(
                _numbers,
                _grandPriceCoins,
                _matchDrawCoins,
                _overUnderDrawCoins,
                _ovType,
                _matchDraw,
                _overUnderDraw
            )
            const enterTransactionReciept = await enterTransaction.wait()
            enteredWallets.add(wallet.address)
            spinner.stop()
            console.log(
                enterTransactionReciept?.status == 1
                    ? `Entered wallet ${wallet.address} for ${winningKey} total-coins : ${
                          _grandPriceCoins + _matchDrawCoins + _overUnderDrawCoins
                      }`
                    : `Enter error address ${wallet.address} for ${winningKey}`
            )
        }
    }
)
