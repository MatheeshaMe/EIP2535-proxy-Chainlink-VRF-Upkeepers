import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import * as dotenv from "dotenv"
import "hardhat-deploy"
import 'hardhat-deploy-ethers';

import "./task/index"

dotenv.config()

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.17",
            },
        ],
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            viaIR:true
        },
    },
    // defaultNetwork: "localhost",
    namedAccounts: {
        deployer: {
            default: 0,
        },
        user1:{
            default:1
        },
        user2:{
            default:2
        },
        user3:{
            default:3
        },
        user4:{
            default:4
        },
        user5:{
            default:5
        },
        user6:{
            default:6
        },
        user7:{
            default:7
        },
        user8:{
            default:8
        },
    },
    networks: {
       hardhat: {
            forking: {
                url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_M!}`,
                enabled: process.env.MAINNET_FORKING_ENABLED === "true",
            },
        },
        sepolia: {
            url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY_T!}`,
            accounts: [process.env.PRIVATE_KEY!],
            chainId: 11155111,
        },
    },
    verify: {
        etherscan: {
            apiKey: process.env.ETHERSCAN_API_KEY!,
        },
    },
}

export default config
