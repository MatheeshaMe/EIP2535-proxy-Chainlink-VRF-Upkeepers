// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
//0xa2D347817c00E1C516BbF46d7E4D43531B8399AE
contract Mock__USDTToken is ERC20, Ownable {
    constructor() ERC20("Mock__USDTToken", "Mock__USDT") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
