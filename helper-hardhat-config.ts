import { ethers } from "hardhat";

export interface NetworkConfigItem {
  name: string;
  vrfCoordinatorV2_5?: string;
  entranceFee?: bigint;
  gasLane?: string;
  subscriptionId?: string;
  callbackGasLimit: number;
  interval?: number;
  blockConfirmations?: number;
}

export interface NetworkConfig {
  [key: number]: NetworkConfigItem;
}

const networkConfig: NetworkConfig = {
  11155111: {
    name: "sepolia",
    vrfCoordinatorV2_5: "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B",
    entranceFee: ethers.parseEther("0.01"),
    gasLane:
      "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
    subscriptionId:
      "103821428131120290963009781576554841419713223701863241832351702939791077864154",
    callbackGasLimit: 500000,
    interval: 30,
    blockConfirmations: 1,
  },
  31337: {
    name: "hardhat",
    entranceFee: ethers.parseEther("0.01"),
    gasLane:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    callbackGasLimit: 500000,
    interval: 30,
  },
};
const developmentChains = ["localhost", "hardhat"];

export { developmentChains, networkConfig };
