import { expect } from "chai"
import { ethers } from "ethers"
import { deployments, ethers as hardhatEthers, getNamedAccounts } from "hardhat"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { CoinCave__Lottery } from "../typechain-types/contracts/lottery/CoinCave_Lottery.sol/CoinCave__Lottery"
import { InitFacet, Mock__USDTToken } from "../typechain-types"
import {
    createMerkleRoots,
    groupWinnersByType,
    lotteryParticipation,
} from "../utils/helpers/helpers"
import { MerkleTree } from "merkletreejs"
import { groupedWinners, winnersArray } from "./utils/constants"

interface Options {
    mintAmount: number
}

enum WinningCategory {
    GRAND,
    OVERUNDER,
    MATCH5,
    MATCH4,
    MATCH3,
}
const winnersRoots = {
    grandPriceWinners: "0x125b8efbc5b81338d7f8807c5de7a3b39997f1049e08673088d2af77f87c93fb",
    matchDraw5Winners: "0x8a3552d60a98e0ade765adddad0a2e420ca9b1eef5f326ba7ab860bb4ea72c94",
    matchDraw4Winners: "0x1ebaa930b8e9130423c183bf38b0564b0103180b7dad301013b18e59880541ae",
    matchDraw3Winners: "0xf4ca8532861558e29f9858a3804245bb30f0303cc71e4192e41546237b6ce58b",
    overUnderDrawWinners: "0xf3b224496df358c0b61bc78fcc2d262a3b042dfc3270c63768d53aa81379e04f",
}

const USDT_THRESHULD = 10 ** 6
const TOKEN_100_THRESHULD = 100 * USDT_THRESHULD
// Define a setup fixture
describe("CoinCave__Lottery_ENTER", function () {
    let initFacet: InitFacet
    let storage, coinCaveLottery: CoinCave__Lottery, mock__USDTToken: Mock__USDTToken
    let owner: HardhatEthersSigner,
        user1Address: HardhatEthersSigner,
        user2Address: HardhatEthersSigner,
        user3Address: HardhatEthersSigner,
        user4Address: HardhatEthersSigner,
        user5Address: HardhatEthersSigner,
        user6Address: HardhatEthersSigner,
        user7Address: HardhatEthersSigner,
        user8Address: HardhatEthersSigner
    let users: HardhatEthersSigner[] = []
    const winnersCount = {
        grandPriceWinners: 2,
        overUnderDrawWinners: 3,
        matchDraw5Winners: 1,
        matchDraw4Winners: 1,
        matchDraw3Winners: 1,
    }
    const {
        grandPriceWinners,
        overUnderDrawWinners,
        matchDraw3Winners,
        matchDraw4Winners,
        matchDraw5Winners,
    } = winnersCount
    const amountToBuy = TOKEN_100_THRESHULD
    const tp_20_percentage = 38000000 * (20 / 100)
    const setupTest = deployments.createFixture(
        async ({ deployments, getNamedAccounts, ethers }, options?: Options) => {
            await deployments.fixture([
                "InitFacet",
                "Storage",
                "UserManager",
                "CoinCave__Lottery",
                "Mock__USDTToken",
            ])
            const accounts = await getNamedAccounts()
            const diamondAddress = (await deployments.get("CoinCaveTesting")).address
            const tokenAddress = (await deployments.get("Mock__USDTToken")).address
            initFacet = await ethers.getContractAt("InitFacet", diamondAddress)
            storage = await ethers.getContractAt("Storage", diamondAddress)
            coinCaveLottery = await ethers.getContractAt("CoinCave__Lottery", diamondAddress)
            mock__USDTToken = await ethers.getContractAt("Mock__USDTToken", tokenAddress)

            return { initFacet, storage, coinCaveLottery, accounts }
        }
    )
    const mintAndBuy = async (
        user: HardhatEthersSigner,
        amountToBuy: number
    ): Promise<[BigInt, BigInt, BigInt]> => {
        await mock__USDTToken.connect(user).mint(user.address, amountToBuy)
        await mock__USDTToken.connect(user).approve(await coinCaveLottery.getAddress(), amountToBuy)
        await expect(
            await coinCaveLottery
                .connect(user)
                .buyCoins(amountToBuy, await mock__USDTToken.getAddress())
        )
            .to.emit(coinCaveLottery, "CC_Lottery_AddCoinsToProfile")
            .withArgs(user.address, amountToBuy / USDT_THRESHULD)
        const data = await coinCaveLottery.getUser(user.address)
        return data
    }
    const enter = async (lotteryParticipationHelper, currentRoundId) => {
        for (let index = 0; index < lotteryParticipationHelper.length; index++) {
            const {
                _grandPriceCoins,
                _matchDrawCoins,
                _numbers,
                _ovType,
                _overUnderDrawCoins,
                _user,
                _matchDraw,
                _overUnderDraw,
            } = lotteryParticipationHelper[index]
            await expect(
                await coinCaveLottery
                    .connect(_user)
                    .enter(
                        _numbers,
                        _grandPriceCoins,
                        _matchDrawCoins,
                        _overUnderDrawCoins,
                        _ovType,
                        _matchDraw,
                        _overUnderDraw
                    )
            )
                .to.emit(coinCaveLottery, "UserParticipated")
                .withArgs(
                    _user.address,
                    currentRoundId,
                    _grandPriceCoins + _matchDrawCoins + _overUnderDrawCoins,
                    _numbers,
                    _ovType,
                    index + 1
                )
        }
    }
    const draw = async (currentRoundId) => {
        await expect(
            await coinCaveLottery.connect(owner).drawLottery(await mock__USDTToken.getAddress())
        )
            .to.emit(coinCaveLottery, "DrawLottery")
            .withArgs(currentRoundId, [3, 5, 6, 16, 25, 19])
    }
    const drawWithPreviousRoundHandling = async (currentRoundId) => {
        await expect(
            await coinCaveLottery.connect(owner).drawLottery(await mock__USDTToken.getAddress())
        )
            .to.emit(coinCaveLottery, "DrawLottery")
            .withArgs(currentRoundId, [3, 5, 6, 16, 25, 19])
            .and.to.emit(coinCaveLottery, "PlatformAndLPShare")
            .withArgs(currentRoundId - 1n, tp_20_percentage / 2, tp_20_percentage / 2)
            .and.to.emit(coinCaveLottery, "PreviousRoundUnusedFundsCut")
            .withArgs(currentRoundId + 1n, currentRoundId - 1n, 38000000)
    }
    const openLottery = async () => {
        await coinCaveLottery.connect(owner).flipLotteryState(true)
    }
    const setWinnersRoots = async () => {
        const {
            grandPriceWinners,
            overUnderDrawWinners,
            matchDraw5Winners,
            matchDraw4Winners,
            matchDraw3Winners,
        } = createMerkleRoots(groupWinnersByType(winnersArray)).merkleRoots
        const tx = await coinCaveLottery.setWinnersRoots(
            grandPriceWinners,
            matchDraw5Winners,
            matchDraw4Winners,
            matchDraw3Winners,
            overUnderDrawWinners
        )
        await tx.wait()
    }
    const claim = async (
        roundId: BigInt,
        address: string,
        ticketId: number,
        category: WinningCategory
    ) => {
        const signer = await hardhatEthers.getSigner(address)
        const indexOfWinners =
            category === WinningCategory.GRAND
                ? 0
                : category === WinningCategory.OVERUNDER
                ? 1
                : category === WinningCategory.MATCH5
                ? 2
                : category === WinningCategory.MATCH4
                ? 3
                : category === WinningCategory.MATCH3
                ? 4
                : null
        const winnersRoot =
            category === WinningCategory.GRAND
                ? winnersRoots.grandPriceWinners
                : category === WinningCategory.OVERUNDER
                ? winnersRoots.overUnderDrawWinners
                : category === WinningCategory.MATCH5
                ? winnersRoots.matchDraw5Winners
                : category === WinningCategory.MATCH4
                ? winnersRoots.matchDraw4Winners
                : category === WinningCategory.MATCH3
                ? winnersRoots.matchDraw3Winners
                : null
        if (indexOfWinners === null) {
            return
        }
        const leaves = groupedWinners[indexOfWinners].map((w) => ethers.keccak256(w.winner))
        const tree = new MerkleTree(leaves, ethers.keccak256, { sort: true })
        const proof = groupedWinners[indexOfWinners].map((w) =>
            tree.getHexProof(ethers.keccak256(w.winner))
        )
        const leaf = ethers.keccak256(address)
        const isVerified = tree.verify([proof.flat()[0]], leaf, winnersRoot)
        expect(isVerified).to.deep.equal(true)
        expect(
            await coinCaveLottery
                .connect(signer)
                .claimPreviousRoundRewards(
                    BigInt(Number(ticketId)),
                    BigInt(Number(roundId)),
                    address,
                    [proof.flat()[0]],
                    await mock__USDTToken.getAddress()
                )
        )
            .to.emit(coinCaveLottery, "RewardClaimed")
            .withArgs(address, roundId, 1n)
    }
    const getRound = async (roundId: number) => {
        const round = await coinCaveLottery.connect(owner).getRoundDetails(roundId)
        return round
    }
    beforeEach(async function () {
        const { accounts } = await setupTest()
        const { deployer, user1, user2, user3, user4, user5, user6, user7, user8 } = accounts
        owner = await hardhatEthers.getSigner(deployer)
        user1Address = await hardhatEthers.getSigner(user1)
        user2Address = await hardhatEthers.getSigner(user2)
        user3Address = await hardhatEthers.getSigner(user3)
        user4Address = await hardhatEthers.getSigner(user4)
        user5Address = await hardhatEthers.getSigner(user5)
        user6Address = await hardhatEthers.getSigner(user6)
        user7Address = await hardhatEthers.getSigner(user7)
        user8Address = await hardhatEthers.getSigner(user8)
        users = [
            user1Address,
            user2Address,
            user3Address,
            user4Address,
            user5Address,
            user6Address,
            user7Address,
            user8Address,
        ]
    })
    describe("User-BuyCoins", () => {
        it("should allow users to buy coins", async function () {
            for (let index = 0; index < users.length; index++) {
                const user = users[index]
                const results = await mintAndBuy(user, amountToBuy)
                expect(results).to.deep.equal([BigInt(amountToBuy / USDT_THRESHULD), 0n, 0n])
            }
        })
    })
    describe("Lottery-Enter", () => {
        beforeEach(async () => {
            await coinCaveLottery.connect(owner).flipLotteryState(true)
            for (let index = 0; index < users.length; index++) {
                const user = users[index]
                await mintAndBuy(user, amountToBuy)
            }
        })
        it("should buy tickets and enter to the lottery", async function () {
            const currentRoundId = await coinCaveLottery.getCurrentRoundId()
            const lotteryParticipationHelper = await lotteryParticipation(users)
            enter(lotteryParticipationHelper, currentRoundId)
        })
        describe("Should correctly set winners count", () => {
            it("Should set winners count properly", async () => {
                expect(await coinCaveLottery.connect(owner).setWinnersCount(1, 2, 3, 4, 5))
                    .to.emit(coinCaveLottery, "SetWinnerCount")
                    .withArgs("Winner Count Setted")

                expect(
                    await coinCaveLottery.getWinnersCount(
                        (await coinCaveLottery.getCurrentRoundId()) - 1n
                    )
                ).to.deep.equal([1n, 2n, 3n, 4n, 5n])
            })
        })
    })
    describe("Lottery-Claim", () => {
        beforeEach(async () => {
            await coinCaveLottery.connect(owner).flipLotteryState(true)
            for (let index = 0; index < users.length; index++) {
                const user = users[index]
                await mintAndBuy(user, amountToBuy)
            }
        })
        describe("Claim", () => {
            let lotteryParticipationHelper
            beforeEach(async () => {
                await coinCaveLottery.connect(owner).flipLotteryState(true)
                lotteryParticipationHelper = await lotteryParticipation(users)
            })

            it("should enter and draw Lottery again", async () => {
                await openLottery()
                await enter(lotteryParticipationHelper, await coinCaveLottery.getCurrentRoundId())
                await draw(await coinCaveLottery.getCurrentRoundId())
                await openLottery()
                await enter(lotteryParticipationHelper, await coinCaveLottery.getCurrentRoundId())
                await drawWithPreviousRoundHandling(await coinCaveLottery.getCurrentRoundId())
                await openLottery()
                await enter(lotteryParticipationHelper, await coinCaveLottery.getCurrentRoundId())
                await drawWithPreviousRoundHandling(await coinCaveLottery.getCurrentRoundId())
            })
            it("should draw lottery again and claim grandPrice Winner rewards", async () => {
                await openLottery()
                await enter(lotteryParticipationHelper, await coinCaveLottery.getCurrentRoundId())
                await draw(await coinCaveLottery.getCurrentRoundId())
                //set Winners merkle roots
                await setWinnersRoots()
                await coinCaveLottery
                    .connect(owner)
                    .setWinnersCount(
                        grandPriceWinners,
                        overUnderDrawWinners,
                        matchDraw3Winners,
                        matchDraw4Winners,
                        matchDraw5Winners
                    )
                await claim(
                    (await coinCaveLottery.getCurrentRoundId()) - 1n,
                    user1Address.address,
                    1,
                    WinningCategory.GRAND
                )
                expect(
                    await getRound(+((await coinCaveLottery.getCurrentRoundId()) - 1n).toString())
                ).to.deep.equal([38000000n, 11400000n])
            })
        })
    })
})
