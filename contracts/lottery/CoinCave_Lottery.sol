// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {Storage, CoinCaveTreasuryStorage, CoinCaveLotteryStorage, CoinCaveUserStorage, OVTypes, User, Ticket, LotteryRound, WinnersCount, MerkleTrees, WinningTypes} from "../StorageLayer.sol";
import {UserManager} from "../user/UserManager.sol";
import {CalculateWinners} from "./libraries/CalculateWinners.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {UsingDiamondOwner} from "hardhat-deploy/solc_0.8/diamond/UsingDiamondOwner.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

import {ILink} from "./interfaces/ILink.sol";
import "hardhat/console.sol";

contract CoinCave__Lottery is
    Storage,
    ReentrancyGuard,
    UsingDiamondOwner,
    UserManager,
    AutomationCompatibleInterface
{
    //events
    event CC_Lottery_AddCoinsToProfile(address indexed buyer, uint256 amount);
    event CC__Lottery_Entered(address indexed player, uint256 coinsAmount);
    event UserParticipated(
        address indexed user,
        uint256 roundId,
        uint256 totalCoins,
        uint8[6] numbers,
        OVTypes _ovType,
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

    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(
        uint256 indexed round,
        uint256[] randomNumber,
        uint256 requestId
    );
     event RaffleRandomNumber(uint256 indexed raffleId, uint256 randomNumber);
    //buy coins
    //enter to the lottery (buy tickets)
    //draw lottery
    //claim rewards

    error NoGrandPriceWinners();
    error NoMatchDraw5Winners();
    error NoMatchDraw4Winners();
    error NoMatchDraw3Winners();
    error NoOverUnderDrawWinners();
    error NotSentEnoughAmount(string _drawType);

    uint256 public counter; // counter counts the number of upkeeps performed
    uint256 public round; // round counts the number of fullfill performed
    uint256 public interval = 60; // interval specifies the time between upkeeps
    uint256 public lastTimeStamp; // lastTimeStamp tracks the last upkeep performed

    address public s_forwarderAddress;
    // Your subscription ID.
    uint64 s_subscriptionId = 8857;

    // last requests Id.
    uint256 public lastRequestId;
    bytes32 keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
    uint32 callbackGasLimit = 2500000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;
    address vrfCoordinator = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;

    function initializeLottery() external onlyOwner {
        //console.log("owner is %s", ds().contractOwner);
        //CoinCaveTreasuryStorage
        if (ts().isInitialized) return;
        ts().i_lpAddress = 0xAaCe684E2825f1C65c5B564ccf930dFc4dc7788E;
        ts().i_platform_wallet = 0xAaCe684E2825f1C65c5B564ccf930dFc4dc7788E;

        //CoinCaveLotteryStorage
        lots().USDT_THERESHOLD = 1e18;
        lots().GRAND_PRICE_COINS = 3;
        lots().MD_PRICE_COINS = 1;
        lots().OVU_PRICE_COINS = 1;
        lots().s_isOpen = false;
        lots().currentRoundId = 1;
        lots().lotteryRounds[lots().currentRoundId].currentTicketId = 1;
        //VRF
    }
    function checkUpkeep(
        bytes calldata /*checkData*/
    ) external override returns (bool, bytes memory) {
        bool needsUpkeep = (block.timestamp - lastTimeStamp) > interval;
        return (needsUpkeep, bytes(""));
    }

    function performUpkeep(bytes calldata /*performData*/) external override {
        // require(
        //     msg.sender == s_forwarderAddress,
        //     "This address does not have permission to call performUpkeep"
        // );
        lastTimeStamp = block.timestamp;
        counter += 1;
        drawRandomNumbers(); //after I add this this will not work
    }
    
    // VRF Functionality ////////////////////////////////////////////////////////////////
       function drawRandomNumbers() public {
        // Will revert if subscription is not set and funded.
        uint256 requestId = VRFCoordinatorV2Interface(vrfCoordinator)
            .requestRandomWords(
                keyHash,
                s_subscriptionId,
                requestConfirmations,
                callbackGasLimit,
                numWords
            );
     
        lastRequestId = requestId;
    }

    function rawFulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) external {
        round += 1;
        emit RequestFulfilled(round, randomWords, requestId);
    }

    /////////////////////////////////////////////////////////////////////////////////////


    modifier isLotteryOpen() {
        require(lots().s_isOpen == true, "Lottery is not opened yet");
        _;
    }
    modifier notContract() {
        require(!_isContract(msg.sender), "Contract not allowed");
        require(msg.sender == tx.origin, "Proxy contract not allowed");
        _;
    }

    function _isContract(address _addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(_addr)
        }
        return size > 0;
    }

    function increase() public {
        // require(
        //     msg.sender == s_forwarderAddress,
        //     "This address does not have permission to call performUpkeep"
        // );
        counter = counter + 1;
        emit CounterCalled(counter, msg.sender, tx.origin);
    }

    function setForwarderAddress(address forwarderAddress) external {
        s_forwarderAddress = forwarderAddress;
    }

    function getUser(address _user) public view returns (uint256, uint256, uint256) {
        return getUserDetails(_user);
    }

    function buyCoins(uint256 _amount, address _token) external payable nonReentrant {
        CoinCaveLotteryStorage storage contractStorage = lots();
        CoinCaveUserStorage storage userStorage = us();
        IERC20 usdtToken = IERC20(_token);
        require(_amount >= contractStorage.USDT_THERESHOLD, "You need to send at least 1 USDT");
        require(
            (usdtToken.transferFrom(msg.sender, address(this), _amount)),
            "CoinCave__Lottery__TransferFromFailed"
        );
        userStorage.user[msg.sender].coinBalance += _amount / contractStorage.USDT_THERESHOLD;
        contractStorage.s_totalPot += _amount;
        emit CC_Lottery_AddCoinsToProfile(msg.sender, (_amount / contractStorage.USDT_THERESHOLD));
    }

    function enter(
        uint8[6] memory _numbers,
        uint256 _grandPrizeCoins,
        uint256 _matchDrawCoins,
        uint256 _overUnderDrawCoins,
        OVTypes _ovType,
        bool _matchDraw,
        bool _overUnderDraw
    ) external isLotteryOpen {
        CoinCaveLotteryStorage storage contractStorage = lots();
        CoinCaveUserStorage storage userStorage = us();
        for (uint8 i = 0; i < _numbers.length; i++) {
            require(_numbers[i] >= 1 && _numbers[i] <= 26, "Number out of range (1-26)");
        }
        require(
            _grandPrizeCoins >= contractStorage.GRAND_PRICE_COINS,
            "At least enter with the grand price"
        );
        if (_matchDraw == true) {
            require(
                _matchDrawCoins >= contractStorage.MD_PRICE_COINS,
                "You must send at least 1 USDT to participate with match draw"
            );
        }
        if (_overUnderDraw == true) {
            require(
                _overUnderDrawCoins >= contractStorage.OVU_PRICE_COINS,
                "You must send at least 1 USDT to participate with over under draw"
            );
        }
        User storage user = userStorage.user[msg.sender];
        uint256 totalCoins = (_grandPrizeCoins) + (_matchDrawCoins) + (_overUnderDrawCoins);
        require(user.coinBalance >= totalCoins, "Insufficient coins");
        user.coinBalance -= totalCoins;
        contractStorage.lotteryRounds[contractStorage.currentRoundId].currentTicketId++;
        contractStorage.tickets[contractStorage.currentRoundId][msg.sender][
            contractStorage.lotteryRounds[contractStorage.currentRoundId].currentTicketId
        ] = Ticket({
            ticketId: contractStorage.lotteryRounds[contractStorage.currentRoundId].currentTicketId,
            roundId: contractStorage.currentRoundId,
            numbers: _numbers,
            coinsForGrandPrize: _grandPrizeCoins,
            coinsForMatchDraw: _matchDrawCoins,
            coinsForOverUnderDraw: _overUnderDrawCoins,
            owner: msg.sender,
            ovType: _ovType,
            winningType: WinningTypes.NONE
        });
        //@Removed
        // contractStorage.lotteryRoundPlayers[contractStorage.currentRoundId].push(msg.sender);
        LotteryRound storage currentRound = contractStorage.lotteryRounds[
            contractStorage.currentRoundId
        ];
        currentRound.boughtTickets[msg.sender].push(
            contractStorage.lotteryRounds[contractStorage.currentRoundId].currentTicketId
        );
        contractStorage.lotteryRounds[contractStorage.currentRoundId].totalPot +=
            totalCoins *
            contractStorage.USDT_THERESHOLD;
        currentRound.coinsEntered[msg.sender] = totalCoins;
        // console.log(msg.sender,contractStorage.lotteryRounds[contractStorage.currentRoundId].currentTicketId,"sender");
        emit UserParticipated(
            msg.sender,
            contractStorage.currentRoundId,
            totalCoins,
            _numbers,
            _ovType,
            contractStorage.lotteryRounds[contractStorage.currentRoundId].currentTicketId
        );
    }

    function drawLottery(address _usdtToken) public {
        uint8[6] memory wn = [3, 5, 6, 16, 25, 19];
        CoinCaveLotteryStorage storage contractStorage = lots();
        contractStorage.s_isOpen = false;

        contractStorage.s_isOpen = false;
        LotteryRound storage currentRound = contractStorage.lotteryRounds[
            contractStorage.currentRoundId
        ];
        // require(currentRound.totalPot > 0, "Pot is 0");
        require(currentRound.isCompleted == false, "Lottery round is already finished");
        // Mark the current round as completed
        currentRound.isCompleted = true; //1=> false, 2=>false
        if (contractStorage.currentRoundId > 1) {
            handlePlaftformShare(_usdtToken);
            handlePreviousRoundUnusedFunds();
        }
        contractStorage.currentRoundId++; // 1 => 2
        emit DrawLottery(contractStorage.currentRoundId - 1, wn);
    }

    function setWinnersCount(
        uint256 _grandPrizeWinners,
        uint256 _overUnderDrawWinners,
        uint256 _matchDraw5Winners,
        uint256 _matchDraw4Winners,
        uint256 _matchDraw3Winners
    ) public onlyOwner {
        CoinCaveLotteryStorage storage contractStorage = lots();
        WinnersCount memory winnersCount = WinnersCount({
            grandPrizeWinnersCount: _grandPrizeWinners,
            overUnderDrawWinnersCount: _overUnderDrawWinners,
            matchDraw5WinnersCount: _matchDraw5Winners,
            matchDraw4WinnersCount: _matchDraw4Winners,
            matchDraw3WinnersCount: _matchDraw3Winners
        });
        contractStorage.winnersCountForTheLotteryRound[
            contractStorage.currentRoundId - 1
        ] = winnersCount;
        emit SetWinnerCount(
            contractStorage.currentRoundId - 1,
            _grandPrizeWinners,
            _overUnderDrawWinners,
            _matchDraw5Winners,
            _matchDraw4Winners,
            _matchDraw3Winners
        );
    }

    function setWinnersRoots(
        bytes32 _grandPrizeWinners,
        bytes32 _matchDraw5Winners,
        bytes32 _matchDraw4Winners,
        bytes32 _matchDraw3Winners,
        bytes32 _overUnderDrawWinners
    ) public onlyOwner {
        CoinCaveLotteryStorage storage contractStorage = lots();
        MerkleTrees memory winnersRoots = MerkleTrees({
            grandPriceWinners: _grandPrizeWinners,
            matchDraw5Winners: _matchDraw5Winners,
            matchDraw4Winners: _matchDraw4Winners,
            matchDraw3Winners: _matchDraw3Winners,
            overUnderDrawWinners: _overUnderDrawWinners
        });
        contractStorage.winnersForTheRound[contractStorage.currentRoundId - 1] = winnersRoots;
        contractStorage.s_isOpen = true;
        emit WinnersSetted("winners setted for the previous round");
    }

    function claimPreviousRoundRewards(
        uint256 _ticketId,
        uint256 _roundId,
        address _user,
        bytes32[] calldata _merkleProof,
        address _usdtToken
    ) public nonReentrant {
        CoinCaveLotteryStorage storage contractStorage = lots();
        Ticket storage ticket = getIndividualTicketDetail(
            _ticketId,
            contractStorage.currentRoundId - 1,
            _user
        );
        // Ensure the caller is the ticket owner
        require(ticket.owner == msg.sender, "You are not the ticket owner");
        require(!isAWonTicket(_roundId, _ticketId), "Ticket is already claimed");
        // Prepare the leaf for merkle proof verification
        bytes32 leaf = keccak256(abi.encodePacked(_user));

        // Determine the type of winning, if any
        WinningTypes winningType = checkWinningType(_ticketId, _roundId, _user, _merkleProof, leaf);

        // If the ticket is a winning ticket, calculate the prize and transfer rewards
        if (winningType != WinningTypes.NONE) {
            uint256 prize = calculatePrize(winningType, _roundId);
            transferRewards(_roundId, prize, _usdtToken, _ticketId, winningType);
            emit RewardClaimed(_user, _roundId, prize);
        } else {
            require(false, "Not a winning ticket");
        }
    }

    //merkle verification
    function verify(
        bytes32[] calldata _proof,
        bytes32 _tree,
        bytes32 _leaf
    ) public pure returns (bool) {
        return MerkleProof.verify(_proof, _tree, _leaf);
    }

    function checkWinningType(
        uint256 _ticketId,
        uint256 _roundId,
        address _user,
        bytes32[] calldata _merkleProof,
        bytes32 leaf
    ) internal view returns (WinningTypes) {
        CoinCaveLotteryStorage storage contractStorage = lots();
        MerkleTrees memory trees = getWinnerRoots(_roundId);
        Ticket memory ticket = getIndividualTicketDetail(_ticketId, _roundId, _user);

        // Check for Grand Prize Winner
        if (
            ticket.coinsForGrandPrize >= contractStorage.GRAND_PRICE_COINS &&
            verify(_merkleProof, trees.grandPriceWinners, leaf)
        ) {
            return WinningTypes.GRAND_PRICE;
        }

        // Check for Match Draw 5 Winner
        if (
            ticket.coinsForMatchDraw >= contractStorage.MD_PRICE_COINS &&
            // !isAWonTicket(_roundId, _ticketId) &&
            verify(_merkleProof, trees.matchDraw5Winners, leaf)
        ) {
            return WinningTypes.MATCH_DRAW_5_PRICE;
        }

        // Check for Match Draw 4 Winner
        if (
            ticket.coinsForMatchDraw >= contractStorage.MD_PRICE_COINS &&
            // !isAWonTicket(_roundId, _ticketId) &&
            verify(_merkleProof, trees.matchDraw4Winners, leaf)
        ) {
            return WinningTypes.MATCH_DRAW_4_PRICE;
        }

        // Check for Match Draw 3 Winner
        if (
            ticket.coinsForMatchDraw >= contractStorage.MD_PRICE_COINS &&
            // !isAWonTicket(_roundId, _ticketId) &&
            verify(_merkleProof, trees.matchDraw3Winners, leaf)
        ) {
            return WinningTypes.MATCH_DRAW_3_PRICE;
        }

        // Check for Over/Under Draw Winner
        if (
            ticket.coinsForOverUnderDraw >= contractStorage.OVU_PRICE_COINS &&
            // !isAWonTicket(_roundId, _ticketId) &&
            verify(_merkleProof, trees.overUnderDrawWinners, leaf)
        ) {
            return WinningTypes.OVER_UNDER_DRAW_PRICE;
        }

        // If none of the conditions are met, return NONE
        return WinningTypes.NONE;
    }

    function calculatePrize(
        WinningTypes winningType,
        uint256 _roundId
    ) internal view returns (uint256) {
        CoinCaveLotteryStorage storage contractStorage = lots();
        uint256 roundTotalPot = contractStorage.lotteryRounds[_roundId].totalPot;
        WinnersCount storage winnersCount = contractStorage.winnersCountForTheLotteryRound[
            _roundId
        ];

        // Determine the prize percentage and winner count based on the winning type
        uint256 prizePercentage;
        uint256 winnerCount;

        if (winningType == WinningTypes.GRAND_PRICE) {
            prizePercentage = 60;
            winnerCount = winnersCount.grandPrizeWinnersCount;
        } else if (winningType == WinningTypes.MATCH_DRAW_5_PRICE) {
            prizePercentage = 10;
            winnerCount = winnersCount.matchDraw5WinnersCount;
        } else if (winningType == WinningTypes.MATCH_DRAW_4_PRICE) {
            prizePercentage = 3;
            winnerCount = winnersCount.matchDraw4WinnersCount;
        } else if (winningType == WinningTypes.MATCH_DRAW_3_PRICE) {
            prizePercentage = 2;
            winnerCount = winnersCount.matchDraw3WinnersCount;
        } else if (winningType == WinningTypes.OVER_UNDER_DRAW_PRICE) {
            prizePercentage = 5;
            winnerCount = winnersCount.overUnderDrawWinnersCount;
        } else {
            return 0; // If none of the types match, return 0 prize
        }

        // Calculate the total prize for the winning type
        uint256 totalPrize = (roundTotalPot * prizePercentage) / 100;
        // Ensure there's no division by zero and return the prize per winner
        return winnerCount > 0 ? totalPrize / winnerCount : 0;
    }

    //transfer rewards
    function transferRewards(
        uint256 _roundId,
        uint256 _prize,
        address _usdtToken,
        uint256 _ticketId,
        WinningTypes _winningType
    ) internal {
        IERC20 usdtToken = IERC20(_usdtToken);
        CoinCaveLotteryStorage storage contractStorage = lots();
        CoinCaveUserStorage storage userStorage = us();
        Ticket storage ticket = getIndividualTicketDetail(_ticketId, _roundId, msg.sender);
        //set user claimed rewards
        userStorage.user[msg.sender].claimedRewards[_roundId] += _prize;
        //set total claimed rewards
        contractStorage.lotteryRounds[_roundId].claimedRewards += _prize;
        // transfer reward amount
        // console.log("price_ticket", _prize);
        ticket.winningType = _winningType;
        // contractStorage.ticketMatches[_roundId][_ticketId] = _winningType;
        // console.log("winningType setTo %s ticketId %s", uint256(_winningType), _ticketId);
        require((usdtToken.transfer(msg.sender, _prize)), "CoinCave__Lottery__Claim_Failed");
        emit Claimed(_ticketId, _roundId, msg.sender, _prize);
    }

    function isAWonTicket(uint256 _roundId, uint256 _ticketId) internal view returns (bool) {
        Ticket memory ticket = getIndividualTicketDetail(_ticketId, _roundId, msg.sender);
        WinningTypes _type = ticket.winningType;
        bool check = ticket.winningType == WinningTypes.NONE;
        bool isWon = ticket.winningType == WinningTypes.NONE ? false : true;
        // console.log("ticket %s is a won ticket", _ticketId, uint256(_type), isWon);
        // console.log("isTicketNone", _ticketId, check);

        return isWon;
    }

    function handlePreviousRoundUnusedFunds() internal {
        CoinCaveLotteryStorage storage contractStorage = lots();
        uint256 currentRoundId = getCurrentRoundId();
        uint256 unclaimedPrizeAmount = contractStorage.lotteryRounds[currentRoundId - 1].totalPot -
            contractStorage.lotteryRounds[currentRoundId - 1].claimedRewards;
        if (unclaimedPrizeAmount > 0) {
            contractStorage.lotteryRounds[currentRoundId + 1].totalPot += unclaimedPrizeAmount;
            emit PreviousRoundUnusedFundsCut(
                currentRoundId + 1,
                currentRoundId - 1,
                unclaimedPrizeAmount
            );
        }
    }

    function handlePlaftformShare(address _usdtToken) internal {
        IERC20 usdtToken = IERC20(_usdtToken);
        CoinCaveLotteryStorage storage contractStorage = lots();
        CoinCaveTreasuryStorage storage treasuryStorage = ts();
        uint256 currentRoundId = getCurrentRoundId();
        uint256 previousRoundTotalPot = contractStorage.lotteryRounds[currentRoundId - 1].totalPot;
        uint256 platformWalletShare = (previousRoundTotalPot * 10) / 100;
        uint256 lpShare = (previousRoundTotalPot * 10) / 100;
        if (platformWalletShare > 0) {
            require(
                (usdtToken.transfer(treasuryStorage.i_platform_wallet, platformWalletShare)),
                "CoinCave__Lottery__Claim_Failed"
            );
        }
        if (lpShare > 0) {
            require(
                (usdtToken.transfer(treasuryStorage.i_lpAddress, lpShare)),
                "CoinCave__Lottery__Claim_Failed"
            );
        }
        emit PlatformAndLPShare(currentRoundId - 1, platformWalletShare, lpShare);
    }

    function getTicketWinningType(
        uint256 _ticketId,
        uint256 _roundId
    ) public view returns (WinningTypes) {
        return lots().ticketMatches[_roundId][_ticketId];
    }

    function flipLotteryState(bool _state) external onlyOwner {
        lots().s_isOpen = _state;
    }

    //Ticket Getters

    //@dev this function is only for testing
    function getUserTickets(
        address _user,
        uint256 _roundId
    ) public view returns (uint256[] memory) {
        CoinCaveLotteryStorage storage contractStorage = lots();
        LotteryRound storage currentRound = contractStorage.lotteryRounds[_roundId];
        uint256[] memory tickets = currentRound.boughtTickets[_user];
        return tickets;
    }

    function getIndividualTicketDetail(
        uint256 _ticketId,
        uint256 _roundId,
        address _user
    ) internal view returns (Ticket storage) {
        return lots().tickets[_roundId][_user][_ticketId];
    }

    function getCurrentTicketId(uint256 _roundId) public view returns (uint256) {
        return lots().lotteryRounds[_roundId].currentTicketId;
    }

    //Round Getters
    function getCurrentRoundId() public view returns (uint256) {
        return lots().currentRoundId;
    }

    function totalPot(uint256 _roundId) public view returns (uint256) {
        return lots().lotteryRounds[_roundId].totalPot;
    }

    // Lottery Getters
    function getLotteryStatus() public view returns (bool) {
        return lots().s_isOpen;
    }

    //Winners Count
    function getWinnersCount(uint256 _roundId) public view returns (WinnersCount memory) {
        return lots().winnersCountForTheLotteryRound[_roundId];
    }

    function getWinnerRoots(uint256 _roundId) public view returns (MerkleTrees memory) {
        return lots().winnersForTheRound[_roundId];
    }

    function getRoundDetails(uint256 _roundId) public view returns (uint256, uint256) {
        CoinCaveLotteryStorage storage contractStorage = lots();
        uint256 tp = contractStorage.lotteryRounds[_roundId].totalPot;
        uint256 claimedRewards = contractStorage.lotteryRounds[_roundId].claimedRewards;
        return (tp, claimedRewards);
    }
}
