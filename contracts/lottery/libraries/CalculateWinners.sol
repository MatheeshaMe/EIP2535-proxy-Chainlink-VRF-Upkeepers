// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

library CalculateWinners {
    function getWinnersCount(uint256 _winners) internal  pure returns(uint256){
        return _winners + 20;
    }
}