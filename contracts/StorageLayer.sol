// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import {LibDiamond} from "hardhat-deploy/solc_0.8/diamond/libraries/LibDiamond.sol";
import "hardhat/console.sol";

//when user select the lottery he also select this
enum OVTypes {
    OVER, //0
    UNDER //1
}
enum Matches {
    NONE, //reseter
    GRAND_PRICE, //60% from the pot
    MATCH_DRAW_PRICE, //15% from the pot
    OVER_UNDER_DRAW_PRICE //5% from the pot
    //reseter
}
enum WinningTypes {
    GRAND_PRICE, //0 //60% from the pot
    OVER_UNDER_DRAW_PRICE, //4 //5% from the pot
    MATCH_DRAW_5_PRICE, //1 //10% of the pot.
    MATCH_DRAW_4_PRICE, //2 //3% of the pot
    MATCH_DRAW_3_PRICE, //3 //2% from the pot
    NONE //5 //reseter
}
struct User {
    uint256 coinBalance; //user coin balance
    uint256 totalPlays; //how many times they played, this is needed because every 10n lottery round is free for this user
    uint256 lastPlayedRound; // the last played round ID of the user
    // roundId => amount
    mapping(uint256 => uint256) claimedRewards; //claim rewards for rounds
    mapping(address => uint256) claimableRewards;
}

struct Ticket {
    uint256 ticketId;
    uint256 roundId; // Lottery round Id
    uint8[6] numbers; //numbers selected by the user
    uint256 coinsForGrandPrize; //how much user spent on this lottery for the grand price. should be >= 3
    uint256 coinsForMatchDraw; //how much user spent on this lottery for the match draw price. should be >= 1
    uint256 coinsForOverUnderDraw; //how much user spent on this lottery for the over under draw price. should be >= 1
    OVTypes ovType; // the OVTypes
    address owner; // owner of the lottery
    WinningTypes winningType;
}

struct LotteryRound {
    uint256 totalPot; // total pot of this round
    uint256 claimedRewards; //claimed rewards by users (helper for calculate unclaimed rewards)
    uint8[6] winningNumbers; //winning numbers for the lottery round
    bool isCompleted; //if this is true this lottery round is over
    //ticket Id by round
    uint256 currentTicketId;
    mapping(address => uint256) coinsEntered; // Todo: how many lottery has spent by the user. should be changed coins -> ticket or remove this if not needed in future
    //user   => ticketCount //Todo : Check multiple lottery tickets for the same user
    mapping(address => uint256[]) boughtTickets;
}

struct Rewards {
    uint256 grandPrizeReward;
    uint256 overUnderDrawReward;
    uint256 matchDraw5Reward;
    uint256 matchDraw4Reward;
    uint256 matchDraw3Reward;
}
struct WinnersCount {
    uint256 grandPrizeWinnersCount;
    uint256 overUnderDrawWinnersCount;
    uint256 matchDraw5WinnersCount;
    uint256 matchDraw4WinnersCount;
    uint256 matchDraw3WinnersCount;
}
struct MerkleTrees {
    bytes32 grandPriceWinners;
    bytes32 overUnderDrawWinners;
    bytes32 matchDraw5Winners;
    bytes32 matchDraw4Winners;
    bytes32 matchDraw3Winners;
}
struct CoinCaveUserStorage {
    mapping(address => User) user;
}

struct CoinCaveTreasuryStorage {
    bool isInitialized;
    address i_lpAddress;
    address i_platform_wallet;
    mapping(address => bool) whiteListedTokens;
}

struct CoinCaveLotteryStorage {
    //USDT decimals
    uint256 USDT_THERESHOLD;
    uint256 GRAND_PRICE_COINS; //grand price coins amount
    uint256 MD_PRICE_COINS; //match draw price coins amount
    uint256 OVU_PRICE_COINS; // over under draw coins amount
    //Can enter when this is true
    bool s_isOpen;
    //Contract price amount stay here
    uint256 s_totalPot;
    uint256 currentRoundId;
    //@Removed ticketId => Ticket
    //roundId => address => ticketId => Ticket
    mapping(uint256 => mapping(address => mapping(uint256 => Ticket))) tickets;
    // mapping(uint256 => Ticket) tickets;
    //lotteryRoundId => LotteryRound
    mapping(uint256 => LotteryRound) lotteryRounds;
    // @Removed
    //lotteryRound => address[]
    //mapping(uint256 => address[]) lotteryRoundPlayers;
    //lotteryRound => mapping( user => prize)
    mapping(uint256 => mapping(address => uint256)) unclaimedPrizes;
    //lotteyRound => Rewards
    mapping(uint256 => Rewards) rewardsForTheLotteryRound;
    //lotteyRound => WinnersCount
    mapping(uint256 => WinnersCount) winnersCountForTheLotteryRound;
    //roundId => MerkleTrees(winners with address)
    mapping(uint256 => MerkleTrees) winnersForTheRound;
    //roundId => ticketId => Matches
    mapping(uint256 => mapping(uint256 => WinningTypes)) ticketMatches;
}

contract Storage {
    function us() internal pure returns (CoinCaveUserStorage storage scus) {
        bytes32 position = keccak256("coincave.user.storage");
        assembly {
            scus.slot := position
        }
    }

    function ts() internal pure returns (CoinCaveTreasuryStorage storage scts) {
        bytes32 position = keccak256("coincave.treasury.storage");
        assembly {
            scts.slot := position
        }
    }

    function lots() internal pure returns (CoinCaveLotteryStorage storage sclots) {
        bytes32 position = keccak256("coincave.lottery.storage");
        assembly {
            sclots.slot := position
        }
    }

    function ds() internal pure returns (LibDiamond.DiamondStorage storage) {
        return LibDiamond.diamondStorage();
    }
}
