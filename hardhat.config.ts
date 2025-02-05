import "@typechain/hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import "hardhat-gas-reporter";
import "hardhat-ethernal";
import "solidity-coverage";
import "hardhat-contract-sizer";
import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "./tasks";

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PK1 = process.env.PK1;
const PK2 = process.env.PK2;
const PK3 = process.env.PK3;
const PK4 = process.env.PK4;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const EHTERNAL_API_TOKEN = process.env.EHTERNAL_API_TOKEN;

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  // allowUnlimitedContractSize: true,
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 31337,
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
        "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
        "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
        "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
        "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
        "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356",
        "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97",
        "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6",
      ],
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      chainId: 11155111,
      //   blockConfirmations: 1, // move to helper-harthat-config
      accounts: [PK1!, PK2!, PK3!, PK4!],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    // customChains: [
    //     {
    //         network: "localhost",
    //         chainId: 31337,
    //         urls: {
    //             apiURL: "https://ethernal.fly.dev/api",
    //             browserURL: "https://ethernal.fly.dev",
    //         },
    //     },
    // ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  gasReporter: {
    enabled: true, // slow #todo
    currency: "USD",
    // coinmarketcap: COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
    token: "ETH",
    noColors: true,
  },
  mocha: {
    timeout: 180000,
  },
  ethernal: {
    apiToken: EHTERNAL_API_TOKEN,
    disabled: false,
    disableSync: false,
    disableTrace: false,
    uploadAst: true,
  },
};

export default config;
