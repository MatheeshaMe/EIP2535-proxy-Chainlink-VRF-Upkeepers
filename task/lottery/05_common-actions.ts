import { task } from "hardhat/config"
import { TaskArguments } from "hardhat/types"
import { readFileSync } from "../helpers/readFileSync"
import {
    COIN_CAVE_DIAMOND_PROXY,
    TOKEN_CONTRACT_ADDRESS,
    USDT_THRESHOLD,
    WalletArray,
    lotteryAddress,
    walletsFilePath,
} from "../../utils/config/varbs"
import { Wallet, ethers } from "ethers"
import { Spinner } from "../helpers/loading"
import { CoinCave__Lottery, CoinCave__Lottery__factory } from "../../typechain-types"
import axios from "axios"
import MerkleTree from "merkletreejs"

interface Winner {
    ticketId: number
    winner: string
    winningType: number
}

interface WinnersData {
    [key: string]: Winner[]
}
task("get-merkle-roots", "get merkle roots for the contract")
    .addParam("round", "roundId", "1")
    .setAction(async (taskArgs: TaskArguments) => {
        const { round } = taskArgs
        const provider = new ethers.JsonRpcProvider(
            `${process.env.PROVIDER_URL!}/${process.env.ALCHEMY_API_KEY_T!}`
        )

        const _wallet = new Wallet(process.env.PRIVATE_KEY!)
        const signer = _wallet.connect(provider)
        const spinner: Spinner = new Spinner()
        const lotteryContract: CoinCave__Lottery = CoinCave__Lottery__factory.connect(
            COIN_CAVE_DIAMOND_PROXY,
            signer
        )
        spinner.start()
        const merkleRoots = await lotteryContract.getWinnerRoots(+round)
        console.log(merkleRoots)
    })

task("get-current-round-id", "get current lottery round").setAction(
    async (taskArgs: TaskArguments) => {
        const { round } = taskArgs
        const provider = new ethers.JsonRpcProvider(
            `${process.env.PROVIDER_URL!}/${process.env.ALCHEMY_API_KEY_T!}`
        )

        const _wallet = new Wallet(process.env.PRIVATE_KEY!)
        const signer = _wallet.connect(provider)
        const spinner: Spinner = new Spinner()
        const lotteryContract: CoinCave__Lottery = CoinCave__Lottery__factory.connect(
            COIN_CAVE_DIAMOND_PROXY,
            signer
        )
        spinner.start()
        const currentRoundId = await lotteryContract.getCurrentRoundId()
        spinner.stop()
        console.log(currentRoundId)
    }
)

task("get-user-tickets", "get tickets for the user by round id")
    .addParam("round", "roundId", "1")
    .addParam("user", "address of the user")
    .setAction(async (taskArgs: TaskArguments) => {
        const { round, user } = taskArgs
        const provider = new ethers.JsonRpcProvider(
            `${process.env.PROVIDER_URL!}/${process.env.ALCHEMY_API_KEY_T!}`
        )

        const _wallet = new Wallet(process.env.PRIVATE_KEY!)
        const signer = _wallet.connect(provider)
        const spinner: Spinner = new Spinner()
        const lotteryContract: CoinCave__Lottery = CoinCave__Lottery__factory.connect(
            COIN_CAVE_DIAMOND_PROXY,
            signer
        )
        spinner.start()
        const tickets = await lotteryContract.getUserTickets(user, round)
        spinner.stop()
        console.log(tickets)
    })
    task("round", "get unclaimedPrizeAmount for last round")
    .addParam("round", "roundId", "1")
    .setAction(async (taskArgs: TaskArguments) => {
        const { round } = taskArgs
        const provider = new ethers.JsonRpcProvider(
            `${process.env.PROVIDER_URL!}/${process.env.ALCHEMY_API_KEY_T!}`
        )

        const _wallet = new Wallet(process.env.PRIVATE_KEY!)
        const signer = _wallet.connect(provider)
        const spinner: Spinner = new Spinner()
        const lotteryContract: CoinCave__Lottery = CoinCave__Lottery__factory.connect(
            COIN_CAVE_DIAMOND_PROXY,
            signer
        )
        spinner.start()
        const details = await lotteryContract.getRoundDetails(round)
        spinner.stop()
        console.log(details)
    })
task("claim", "claim rewards")
    .addParam("round", "roundId", "1")
    .addParam("user", "address of the user")
    .addParam("pk", "pk of the user")
    .setAction(async (taskArgs: TaskArguments) => {
        const { round, user,pk } = taskArgs
        const provider = new ethers.JsonRpcProvider(
            `${process.env.PROVIDER_URL!}/${process.env.ALCHEMY_API_KEY_T!}`
        )

        const _wallet = new Wallet(pk)
        const signer = _wallet.connect(provider)
        const spinner: Spinner = new Spinner()
        const lotteryContract: CoinCave__Lottery = CoinCave__Lottery__factory.connect(
            COIN_CAVE_DIAMOND_PROXY,
            signer
        )
        spinner.start()
        const tickets = await lotteryContract.getUserTickets(user, round)
        // spinner.stop()
        // console.log(tickets)
        const res = (await (
            await axios.get(`${process.env.BACKEND!}/api/winners/${round}`)
        ).data) as WinnersData
        // console.log(res as WinnersData)
        if (!res as unknown as WinnersData) {
            throw new Error("Winners data not found")
        }
        for (let winningType in res) {
            const winnersOfType = res[winningType]
            // console.log(winnersOfType, "winenrs")
            const leaves = winnersOfType.map((w) => ethers.keccak256(w.winner))
            // console.log(leaves)
            const tree = new MerkleTree(leaves, ethers.keccak256, { sort: true })
            const winner = winnersOfType.find(w => w.winner.toLowerCase() === user.toLowerCase());
            if (!winner) {
                console.log(`No winner found for user: ${user} in type ${winningType}`);
                continue;
            }
            console.log("winner found",winningType,user)
            const leaf = ethers.keccak256(winner.winner);
            const proof = tree.getHexProof(leaf);
            console.log(proof,"proof")
            for (let index = 0; index < tickets.length; index++) {
                const ticket = tickets[index]
                console.log(ticket, "ticket")
                const claimRewards = await lotteryContract.claimPreviousRoundRewards(
                    ticket.toString(),
                    round,
                    _wallet.address,
                    proof,
                    "0xa2D347817c00E1C516BbF46d7E4D43531B8399AE"
                )
                const res = await claimRewards.wait()
                console.log(res, "claimRewards")
            }
        }
    })
    task("set-forwarder", "set-forwarder address")
    .addParam("address", "forwarder")
    .setAction(
        async (taskArgs: TaskArguments) => {
            const { address } = taskArgs
            const provider = new ethers.JsonRpcProvider(
                `${process.env.PROVIDER_URL!}/${process.env.ALCHEMY_API_KEY_T!}`
            )
    
            const _wallet = new Wallet(process.env.PRIVATE_KEY!)
            const signer = _wallet.connect(provider)
            const spinner: Spinner = new Spinner()
            const lotteryContract: CoinCave__Lottery = CoinCave__Lottery__factory.connect(
                COIN_CAVE_DIAMOND_PROXY,
                signer
            )
            spinner.start()
            const faddress = await lotteryContract.setForwarderAddress(address)
            spinner.stop()
            console.log(faddress)
        }
    )

    task("count", "get-counter")
    .setAction(
        async () => {
            const provider = new ethers.JsonRpcProvider(
                `${process.env.PROVIDER_URL!}/${process.env.ALCHEMY_API_KEY_T!}`
            )
    
            const _wallet = new Wallet(process.env.PRIVATE_KEY!)
            const signer = _wallet.connect(provider)
            const spinner: Spinner = new Spinner()
            const lotteryContract: CoinCave__Lottery = CoinCave__Lottery__factory.connect(
                COIN_CAVE_DIAMOND_PROXY,
                signer
            )
            spinner.start()
            const count = await lotteryContract.counter()
            spinner.stop()
            console.log(count)
        }
    )
    // task("link-balance", "link-balance")
    // .setAction(
    //     async () => {
    //         const provider = new ethers.JsonRpcProvider(
    //             `${process.env.PROVIDER_URL!}/${process.env.ALCHEMY_API_KEY_T!}`
    //         )
    
    //         const _wallet = new Wallet(process.env.PRIVATE_KEY!)
    //         const signer = _wallet.connect(provider)
    //         const spinner: Spinner = new Spinner()
    //         const lotteryContract: CoinCave__Lottery = CoinCave__Lottery__factory.connect(
    //             "0xa19c48e8d492a65262A05264BF2d447423A60C8d",
    //             signer
    //         )
    //         // spinner.start()
    //         const balance = await lotteryContract.linkBalance()
    //         // spinner.stop()
    //         console.log(balance)
    //     }
    // )
    task("vrf", "request-vrf")
    .setAction(
        async () => {
            const provider = new ethers.JsonRpcProvider(
                `${process.env.PROVIDER_URL!}/${process.env.ALCHEMY_API_KEY_T!}`
            )
    
            const _wallet = new Wallet(process.env.PRIVATE_KEY!)
            const signer = _wallet.connect(provider)
            const spinner: Spinner = new Spinner()
            const lotteryContract: CoinCave__Lottery = CoinCave__Lottery__factory.connect(
                COIN_CAVE_DIAMOND_PROXY,
                signer
            )
            spinner.start()
            const request = await lotteryContract.drawRandomNumbers()
            const tx  = await request.wait()
            spinner.stop()
            console.log(tx)
        }
    )