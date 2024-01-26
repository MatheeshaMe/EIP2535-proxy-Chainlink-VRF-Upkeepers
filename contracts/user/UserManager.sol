// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {Storage, CoinCaveLotteryStorage, CoinCaveUserStorage, OVTypes, User, Ticket, LotteryRound} from "../StorageLayer.sol";
import "hardhat/console.sol";

contract UserManager is Storage {
    function getUserDetails(address _user) internal view returns (uint256, uint256, uint256) {
        return (
            us().user[_user].coinBalance,
            us().user[_user].totalPlays,
            us().user[_user].lastPlayedRound
        );
    }
}
