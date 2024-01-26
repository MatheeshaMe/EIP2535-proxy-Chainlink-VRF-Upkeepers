import { Mnemonic } from "ethers"

export interface WalletArray {
    address: string
    mnemonic: Mnemonic | null
    privateKey: string
}
export const walletsFilePath = "./wallets.json"
export const TOKEN_CONTRACT_ADDRESS = "0xa2D347817c00E1C516BbF46d7E4D43531B8399AE"
export const USDT_THRESHOLD = 10 ** 6
export const COIN_CAVE_DIAMOND_PROXY = "0x6426A5771B41a72b2434057FEEC26dA6e3339fea"
export const lotteryAddress = "0x6497213aaa2A120bb23EC9EFb687EC9e4FEb1244"
//winners count
export const grandPriceWinnersCount = 2
export const overUnderDrawWinnersCount = 3
export const matchDraw5WinnersCount = 1
export const matchDraw4WinnersCount = 1
export const matchDraw3WinnersCount = 1

//winning details
export const totalPot = 38 * USDT_THRESHOLD
export const granPriceReward = (totalPot * (60 / 100)) / grandPriceWinnersCount
export const matchDraw5Reward = totalPot * (10 / 100) /matchDraw5WinnersCount
export const matchDraw4Reward = totalPot * (3 / 100) /matchDraw4WinnersCount
export const matchDraw3Reward = totalPot * (2 / 100) /matchDraw3WinnersCount
export const overUnderDrawReward = totalPot * (5 / 100) /matchDraw3WinnersCount

// Calculate expected rewards
export const expectedRewards = { //38000000 * (20 / 100) 
    "0": (totalPot * 60) / 100 , // Grand Prize - 22800000 /2 = 11400000 
    "1": (totalPot * 5) / 100, // Over/Under Draw - 1900000 /3 = 633333.3333333334 = 0.633333
    "2": (totalPot * 10) / 100 , // Match Draw 5 - 3800000
    "3": (totalPot * 3) / 100,  // Match Draw 4 - 1140000
    "4": (totalPot * 2) / 100,  // Match Draw 3 - 760000
    "5":0 //NONE
};

