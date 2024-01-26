import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer} = await hre.getNamedAccounts();
    const { diamond,deploy } = hre.deployments;
 await diamond.deploy("CoinCaveTesting", {
    from: deployer,
    owner:deployer,
    autoMine: true,
    log: true,
    waitConfirmations: 1,
    facets: [
      "InitFacet",
      "Storage",
      "CoinCave__Lottery",
      "UserManager"
    ],
    execute: {
      contract: 'InitFacet',
      methodName: 'init',
      args: []
    },
  })
 if(!hre.network.name || hre.network.name === "hardhat"){
  console.log("deploying Mock__USDTToken locally")
  await deploy('Mock__USDTToken', {
    from: deployer,
    gasLimit: 4000000,
    args: [],
  });
 }
};

deployYourContract.tags = ["InitFacet", "Storage", "CoinCave__Lottery","UserManager","Mock__USDTToken", "all"];
export default deployYourContract;
