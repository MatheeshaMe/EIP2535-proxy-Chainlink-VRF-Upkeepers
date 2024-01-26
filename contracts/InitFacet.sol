// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {IDiamondLoupe} from "hardhat-deploy/solc_0.8/diamond/interfaces/IDiamondLoupe.sol";
import {IERC173} from "hardhat-deploy/solc_0.8/diamond/interfaces/IERC173.sol";
import {UsingDiamondOwner, IDiamondCut} from "hardhat-deploy/solc_0.8/diamond/UsingDiamondOwner.sol";
import {Storage} from "./StorageLayer.sol";
import "hardhat/console.sol";

contract InitFacet is UsingDiamondOwner, Storage {  
    function init() external onlyOwner {
        //CoinCaveTreasuryStorage
        if (ts().isInitialized) return;
        ts().i_lpAddress = 0xAaCe684E2825f1C65c5B564ccf930dFc4dc7788E;
        ts().i_platform_wallet =0xAaCe684E2825f1C65c5B564ccf930dFc4dc7788E;

        //CoinCaveLotteryStorage
        lots().USDT_THERESHOLD = 1e6;
        lots().GRAND_PRICE_COINS = 3;
        lots().MD_PRICE_COINS = 1;
        lots().OVU_PRICE_COINS = 1;
        lots().s_isOpen = false;
        lots().currentRoundId = 1;
        lots().lotteryRounds[lots().currentRoundId].currentTicketId = 0;
        //LibDiamond.DiamondStorage
        ds().supportedInterfaces[type(IDiamondCut).interfaceId] = true;
        ds().supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;
        ds().supportedInterfaces[type(IERC173).interfaceId] = true;
        
        ts().isInitialized = true;
    }
}