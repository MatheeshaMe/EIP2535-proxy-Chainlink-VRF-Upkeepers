// ILottery.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

interface ICoinCave__Lottery is AutomationCompatibleInterface {
    // Events
    event CC_Lottery_AddCoinsToProfile(address indexed buyer, uint256 amount);
    event CC__Lottery_Entered(address indexed player, uint256 coinsAmount);
    event UserParticipated(
        address indexed user,
        uint256 roundId,
        uint256 totalCoins,
        uint8[6] numbers,
        uint256 ticketId
    );
    event RewardClaimed(address indexed user, uint256 roundId, uint256 amount);
    event Calculated(uint256 amount, string where);
    event PriceWon(address user, uint256 amountOfReward, uint256 total, string reason);
    event DrawLottery(uint256 roundId, uint8[6] winningNumbers);
    event SetWinnerCount(
        uint256 roundId,
        uint256 grandPriceWinnersCount,
        uint256 overUnderDrawWinnersCount,
        uint256 matchDraw5WinnersCount,
        uint256 matchDraw4WinnersCount,
        uint256 matchDraw3WinnersCount
    );
    event WinnersSetted(string message);
    event Claimed(uint256 ticketId, uint256 roundId, address winner, uint256 rewardAmount);
    event PlatformAndLPShare(uint256 roundId, uint256 platformShare, uint256 lpShare);
    event PreviousRoundUnusedFundsCut(uint256 toRound, uint256 fromRound, uint256 share);
    event CounterCalled(uint256 count, address caller, address txOrgin);

    // Functions
    function checkUpkeep(bytes calldata checkData) external returns (bool, bytes memory);
    function performUpkeep(bytes calldata performData) external;
    
    // Lottery Management
    function flipLotteryState(bool state) external;

    // User Interaction
    function getUser(address user) external view returns (uint256, uint256, uint256);
    function buyCoins(uint256 amount, address token) external payable;
    function enter(
        uint8[6] memory numbers,
        uint256 grandPrizeCoins,
        uint256 matchDrawCoins,
        uint256 overUnderDrawCoins,
        uint256 ovType,
        bool matchDraw,
        bool overUnderDraw
    ) external;
    
    // Lottery Draw
    function drawLottery(address usdtToken, uint8[6] memory winningNumbers) external;
    
    // Winner Management
    function setWinnersCount(
        uint256 grandPrizeWinners,
        uint256 overUnderDrawWinners,
        uint256 matchDraw5Winners,
        uint256 matchDraw4Winners,
        uint256 matchDraw3Winners
    ) external;
    function setWinnersRoots(
        bytes32 grandPrizeWinners,
        bytes32 matchDraw5Winners,
        bytes32 matchDraw4Winners,
        bytes32 matchDraw3Winners,
        bytes32 overUnderDrawWinners
    ) external;
    function claimPreviousRoundRewards(
        uint256 ticketId,
        uint256 roundId,
        address user,
        bytes32[] calldata merkleProof,
        address usdtToken
    ) external;
    
    // Prize Calculation and Transfer
    function calculatePrize(uint256 roundId, uint8 winningType) external view returns (uint256);
    function transferRewards(
        uint256 roundId,
        uint256 prize,
        address usdtToken,
        uint256 ticketId,
        uint8 winningType
    ) external;
    
    // Ticket Information
    function isAWonTicket(uint256 roundId, uint256 ticketId) external view returns (bool);
    function getTicketWinningType(uint256 ticketId, uint256 roundId) external view returns (uint8);
    
    // Upkeep and Maintenance
    function increase() external;
    function setForwarderAddress(address forwarderAddress) external;
    function handlePreviousRoundUnusedFunds() external;
    function handlePlaftformShare(address usdtToken) external;

    // Information Retrieval
    function getCurrentRoundId() external view returns (uint256);
    function totalPot(uint256 roundId) external view returns (uint256);
    function getLotteryStatus() external view returns (bool);
    function getWinnersCount(uint256 roundId) external view returns (uint256, uint256, uint256, uint256, uint256);
    function getWinnerRoots(uint256 roundId) external view returns (bytes32, bytes32, bytes32, bytes32, bytes32);
    function getRoundDetails(uint256 roundId) external view returns (uint256, uint256);
    function getUserTickets(address user, uint256 roundId) external view returns (uint256[] memory);
    function getIndividualTicketDetail(
        uint256 ticketId,
        uint256 roundId,
        address user
    ) external view returns (uint256, uint256, uint256, uint8[6] memory, uint256, uint8);
}
