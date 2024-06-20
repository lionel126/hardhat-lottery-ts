import { network, ethers } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const BASE_FEE = ethers.parseEther("0.25");
const GAS_PRICE_LINK = 1e9;
const WeiPerUnitLink = 1e15; // # error if equal or more than Number.MAX_SAFE_INTEGER = 9007199254740990

const deploy = async ({
  deployments,
  getNamedAccounts,
  ethernal,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const args = [BASE_FEE, GAS_PRICE_LINK, WeiPerUnitLink];
  if (developmentChains.includes(network.name)) {
    log("local network detected, deploying mocks...");
    const vrfCoordinatorV2_5Mock = await deploy("VRFCoordinatorV2_5Mock", {
      from: deployer,
      log: true,
      args: args,
    });

    log("------------ mocks deployed ---------------");
    console.log(
      `VRFCoordinatorV2_5Mock address: ${vrfCoordinatorV2_5Mock.address}`
    );
    //
    if (network.name == "localhost") {
      await ethernal.push({
        name: "VRFCoordinatorV2_5Mock",
        address: vrfCoordinatorV2_5Mock.address,
      });
    }
  }
};

export default deploy;
deploy.tags = ["all", "mocks"];
