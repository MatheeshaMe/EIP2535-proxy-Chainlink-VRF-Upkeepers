# #ReadMe

# Coin Cave Treasury Documentation

## Deployment

To Deploy new diamond 

```bash
npm run deploy — —network <network> --reset
```

To Deploy updated contract in diamond 

```bash
npm run deploy — —network <network>
```

To verify contracts

```bash
npm run verify — —network <network> 
```

And then grab the contract addresses and modify variables

## Installation

To install the required packages, use the following command:

```bash
npm install --force

```

Make sure to add the necessary details to the `.env` file. Update the file with your specific values for the following environment variables:

```jsx
CHAIN_ID=11155111
ALCHEMY_API_KEY_T=kWgiWL1P3B7n-q6N4fM9Hxv15Rkpe-YP
ALCHEMY_API_KEY_M=Jrdmq7hRlxXBBRmJrinMGmjtkJnzk08v
ETHERSCAN_API_KEY=926TDDAP6DI75ZCZTNRTS51ICPU4WFQTIP
PRIVATE_KEY=8a00f1dc9ea183651f20e0a6b2211576e62538511c2c1ab0a6969da73a80cd64
CMC_API_KEY=f1fee4da-48ed-44c1-8b2e-24c0220c6d3f
PROVIDER_URL=https://eth-sepolia.g.alchemy.com/v2
MAINNET_FORKING_ENABLED=false

# Development utils
MOCK_USDT_TOKEN=0xa2D347817c00E1C516BbF46d7E4D43531B8399AE
OWNER_ADDRESS=0xAaCe684E2825f1C65c5B564ccf930dFc4dc7788E
BACKEND=http://localhost:3001

```

## Smart Contract Deployment

Deploy the smart contract using the following command:

```bash
npm run deploy -- --network sepolia

```

After deployment, verify the smart contract by running:

```bash
npm run verify -- --network sepolia

```

Copy the diamond address and paste it into `utils/config/varbs.ts`:

```tsx
export const COIN_CAVE_DIAMOND_PROXY = "0x32703F3eEEED4b11211f153e25d8366BDad98Ca4"

```

## Automated Tasks with Hardhat

Explore the tasks in the task folder by referencing them according to their file numbers. For example:

```tsx
import "./lottery/00_initial-setup"
import "./lottery/01_mint-tokens"
import "./lottery/02_buy-coins"
import "./lottery/03_enter-lottery"
import "./lottery/04_admin-lottery"
import "./lottery/05_common-actions"

```

Run the following task to set up initial wallets and add funds:

```bash
npx hardhat initial-setup

```

Parameters:

- `wallets`: The number of wallets.
- `isnew`: Should generate new wallets.

Example terminal output:

```bash
0x4478f3e86dD5C53cB15C0f3D72798e234da77E4F
Sent 0.1 ETH to wallet 0x4478f3e86dD5C53cB15C0f3D72798e234da77E4F. Transaction hash:0xac147f26e0737fd0297f8e9433564d84ad97743ed331dac743a915f96ac17e5c
0xd2F5B647653d0dD6C811a3E3Ee75B967058bE641
Address: 0x4478f3e86dD5C53cB15C0f3D72798e234da77E4F... Balance: 0.359581265502047548

```

To mint mock USDT tokens, use the following command:

```bash
npx hardhat mint-tokens

```

Example terminal output:

```bash
✅ Minted 1000 tokens, address:0x4478f3e86dD5C53cB15C0f3D72798e234da77E4F transaction hash: 0x7244fb6fe7e09879a9689a76b63fa9de179dd4ce897cddff2ad16b2974c9ea46
✅ Allowed 1000 tokens, spent on address:0x32703F3eEEED4b11211f153e25d8366BDad98Ca4 from 0x4478f3e86dD5C53cB15C0f3D72798e234da77E4F

```

Now, buy coins with USDT using:

```bash
npx hardhat buy-coins

```

Example terminal output:

```bash
✅ 100 coins bought, address:0x4478f3e86dD5C53cB15C0f3D72798e234da77E4F transaction hash: 0x874b4d93ef51fbe07d339aacb6490377b26182075e245bddf9402bc1e01dc5e0

```

Enter the lottery using:

```bash
npx hardhat enter

```

Lottery entries will be automatically saved to the database.

## Draw Lottery

To draw the lottery and determine winners, run:

```bash
npx hardhat draw-lottery

```

Ensure that the winners count and winners root functions are automatically called on Etherscan transactions.

## Claim Rewards

Use the claim task to claim rewards:

```bash
npx hardhat claim --round 1 --user <user_address> --pk <private_key>

```

Replace `<user_address>` and `<private_key>` with the user's address and private key. View claimable rewards and proceed with the claim process.

This documentation provides a comprehensive guide for developers to interact with the Coin Cave Treasury project.