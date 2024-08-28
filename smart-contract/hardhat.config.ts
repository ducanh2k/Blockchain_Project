import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

const oklinkkey = process.env.Oklink_API_key;
const bscScanKey = process.env.BscScan_API_key;

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: "paris",
        },
      },
    ],
  },
  networks: {
    polygonAmoy: {
      url: process.env.RPC_URL,
      accounts: [process.env.Privatekey || ""],
    },
    bscTestnet: {
      url: process.env.RPC_URL_BSC,
      chainId: 97,
      accounts: [process.env.Privatekey || ""],
      gasPrice: 2000000000000,
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: oklinkkey || "",
      bscTestnet: bscScanKey || "",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL:
            "https://www.oklink.com/api/explorer/v1/contract/verify/async/api/polygonAmoy",
          browserURL: "https://www.oklink.com/vi/amoy",
        },
      },
      {
        network: "bscTestnet",
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com/api",
          browserURL: "https://testnet.bscscan.com",
        },
      },
    ],
  },
};

export default config;
