import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { winning } from "../config/constants"
import { OUTypes, WinningType } from "./types"
import MerkleTree from "merkletreejs"
import { ethers, keccak256, solidityPacked } from "ethers"

interface LotteryParticipant {
    _user: HardhatEthersSigner
    _numbers: number[]
    _grandPriceCoins: number
    _matchDrawCoins: number
    _overUnderDrawCoins: number
    _ovType: number
    _matchDraw: boolean
    _overUnderDraw: boolean
}
interface Winner {
    ticketId: number
    winner: string
    winningType: WinningType // Assuming WinningType is an enum or type
}
interface CategorizedWinners {
    [key: string]: any[] // Adjust the type of array elements as per your need
}

const grandPrizePercentage = 60 / 100
const match5PrizePercentage = 10 / 100
const match4PrizePercentage = 3 / 100
const match3PrizePercentage = 2 / 100
const overUnderDrawPricePercentage = 5 / 100

export const lotteryParticipation = async (
    users: HardhatEthersSigner[]
): Promise<LotteryParticipant[]> => {
    const keys = Object.keys(winning)
    return users.map((user, index) => {
        const key = keys[index % keys.length]
        // console.log(
        //     {
        //         _user: user.address,
        //         ...winning[key],
        //     },
        //     "lotteryParticipation_OBJECTSIGN"
        // )
        return {
            _user: user,
            ...winning[key],
        }
    })
}
// Helper function to check if two arrays match
export function arraysMatch(arr1: string | any[], arr2: string | any[]) {
    if (arr1.length !== arr2.length) return false
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false
    }
    return true
}

// Helper function to count the number of matching numbers
export function countMatches(arr1: any, arr2: string | any[]): number {
    let count = 0
    for (let num of arr1) {
        if (arr2.includes(num)) {
            count++
        }
    }
    return count
}

export function isOverUnderDrawWinner(
    wn: number,
    selectedNumber: number,
    ouType: OUTypes
): Boolean {
    return wn === selectedNumber
        ? true
        : ouType === OUTypes.Over && selectedNumber > wn
        ? true
        : ouType === OUTypes.Under && selectedNumber < wn
        ? true
        : false
}
export async function isWinner(
    winners: Array<{
        winner: string
        winningType: WinningType
    }>,
    address: string
) {
    const winnerEntry = winners.find((winner) => winner.winner === address)

    // If found, return the winning type, otherwise indicate no win
    return winnerEntry ? winnerEntry.winningType : null
}

export function organizeWinnersByType(winners: Winner[]): CategorizedWinners {
    const categorizedWinners: CategorizedWinners = {}
    winners.forEach((winner) => {
        const winningType = winner.winningType

        if (categorizedWinners[winningType] === undefined) {
            categorizedWinners[winningType] = []
        }

        categorizedWinners[winningType]?.push(winner)
    })

    return categorizedWinners
}

export function createMerkleTree(winners: any[]) {
    const leaves = winners.map((winner) => keccak256(winner.winner)) //solidityPacked(['uint256', 'address'], [winner.ticketId, winner.winner]))
    return new MerkleTree(leaves, keccak256, { sort: true })
}
//  export  function createMerkleTreeForWinningType(winnersData: { ticketId: any; winner: any,winningType:WinningType}[], winningType: any) {
//     const leaves = winnersData.map(({ ticketId, winner }) => {
//         return ethers.keccak256(new ethers.AbiCoder().encode(["uint256", "address"], [ticketId, winner]));
//     });
//     return createMerkleTree(leaves);
// }

export const checkWinningType = (winningType: string) => {
    switch (winningType) {
        case "GRANDPRICE":
            return "0"
        case "OVERUNDERDRAW":
            return "1"
        case "MATCHDRAW5":
            return "2"
        case "MATCHDRAW4":
            return "3"
        case "MATCHDRAW3":
            return "4"
        default:
            throw new Error("Invalid winning type")
    }
}

export const toBytes32 = (hash: string) => `0x${hash}`

export function groupWinnersByType(winners: any[]) {
    const groupedWinners = {}

    winners.forEach((winner) => {
        const winningType = winner.winningType

        if (!groupedWinners[winningType]) {
            groupedWinners[winningType] = []
        }

        groupedWinners[winningType].push(winner)
    })

    return groupedWinners
}
export function createMerkleRoots(groupedWinners) {
    let merkleRoots = {
        grandPriceWinners: null,
        overUnderDrawWinners: null,
        matchDraw5Winners: null,
        matchDraw4Winners: null,
        matchDraw3Winners: null,
    }
    // console.log(groupedWinners, "groupedWinners")
    let tree: MerkleTree
    for (let winningType in groupedWinners) {
        // console.log(winningType, "winning___type")
        const winners = groupedWinners[winningType]
        // console.log(winners, "Winners_for the round")
        const leaves = winners.map((winner) => ethers.keccak256(winner.winner)) //new ethers.AbiCoder().encode(["address", "uint256"], [winner.winner, winner.ticketId])
        // console.log(leaves, "leaves", winningType)
        tree = new MerkleTree(leaves, ethers.keccak256, { sort: true })
        const root = tree.getHexRoot()
        // const leaf = ethers.keccak256(new ethers.AbiCoder().encode(["address", "uint256"], [winners[0].winner, winners[0].ticketId]))
        // const proof = tree.getProof(leaf)
        // console.log(proof,"PROOOOOOOOOOOOOOOOOOOOOOOOOOOf")
        // Map the winning type to the corresponding field in the MerkleTrees struct
        switch (parseInt(winningType)) {
            case 0:
                merkleRoots.grandPriceWinners = root
                break
            case 1:
                merkleRoots.overUnderDrawWinners = root
                break
            case 2:
                merkleRoots.matchDraw5Winners = root
                break
            case 3:
                merkleRoots.matchDraw4Winners = root
                break
            case 4:
                merkleRoots.matchDraw3Winners = root
                break
        }
    }
    // console.log(merkleRoots, "merkle_roots")
    return { merkleRoots: merkleRoots, tree: tree }
}

// function getWinningTypeForUser(winners:Array<any>,)
