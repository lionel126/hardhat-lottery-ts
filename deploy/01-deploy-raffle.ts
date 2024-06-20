import { network, ethers } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { verify } from "../utils/verify";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { VRFCoordinatorV2_5Mock } from "../typechain-types";

const VRF_SUB_FUND_AMOUNT = ethers.parseEther("500"); // dev env

const deploy = async ({
  getNamedAccounts,
  deployments,
  ethernal,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId!;
  let vrfCoordinatorV2_5Address,
    subscriptionId,
    vrfCoordinatorV2_5Mock: VRFCoordinatorV2_5Mock;
  if (developmentChains.includes(network.name)) {
    // const vrfCoordinatorV2Mock = await deployments.get("VRFCoordinatorV2Mock") // where is this api
    // const vrfCoordinatorV2Mock = await ethers.getContractAt(
    //     "VRFCoordinatorV2Mock",
    //     (await deployments.get("VRFCoordinatorV2Mock")).address, // ? x getAddress()
    // ) // nomicfoundation/hardhat-ethers
    vrfCoordinatorV2_5Mock = await ethers.getContract("VRFCoordinatorV2_5Mock"); // hardhat-deploy-ethers
    // log(`address: ${(await deployments.get("VRFCoordinatorV2Mock")).address}`)
    vrfCoordinatorV2_5Address = await vrfCoordinatorV2_5Mock.getAddress();
    const txResp = await vrfCoordinatorV2_5Mock.createSubscription(); // ? return s_currentSubId
    // log(`resp: ${JSON.stringify(txResp)}`)
    const txRcpt = await txResp.wait(1);
    // log(`rcpt: ${JSON.stringify(txRcpt)}`)
    // log(`logs: ${JSON.stringify(txRcpt.logs)}`)
    // log(`args: ${txRcpt.logs[0].args.subId}`)
    // subscriptionId = txRcpt.events[0].args.subId // ? https://github.com/ethers-io/ethers.js/discussions/2207
    // subscriptionId = txRcpt?.logs[0].args.subId;
    subscriptionId = BigInt(txRcpt?.logs[0].topics[1]!);
    log(`subId: ${subscriptionId}`); // doesn't print when testing
    // console.log(`subId: ${subscriptionId}`);
    await vrfCoordinatorV2_5Mock.fundSubscription(
      subscriptionId,
      VRF_SUB_FUND_AMOUNT
    ); // # done: tx fee.
    // #todo: how to fund nativeBalance ?
    // await vrfCoordinatorV2_5Mock.fundSubscriptionWithNative(subscriptionId, VRF_SUB_FUND_AMOUNT) // unsupported
  } else {
    vrfCoordinatorV2_5Address = networkConfig[chainId]["vrfCoordinatorV2_5"]; // v2_5 differs
    subscriptionId = networkConfig[chainId]["subscriptionId"];
  }
  const entranceFee = networkConfig[chainId]["entranceFee"];
  const gasLane = networkConfig[chainId]["gasLane"];
  const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
  const interval = networkConfig[chainId]["interval"];
  const args = [
    vrfCoordinatorV2_5Address,
    entranceFee,
    gasLane,
    subscriptionId,
    callbackGasLimit,
    interval,
  ];
  const raffle = await deploy("Raffle", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[chainId]["blockConfirmations"] || 1,
  });
  // addConsumer
  if (developmentChains.includes(network.name)) {
    await vrfCoordinatorV2_5Mock!.addConsumer(subscriptionId!, raffle.address);
  }
  log("------------ raffle deployed --------------");
  console.log("raffle deployed");
  if (!developmentChains.includes(network.name)) {
    // if (!["hardhat"].includes(network.name)) {
    // #todo: custom verify https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify#adding-support-for-other-networks
    await verify(raffle.address, args);
    log("------------ verified ---------------------");
  }
  // for ethernal
  if (network.name == "localhost") {
    await ethernal.push({
      name: "Raffle",
      address: raffle.address,
    });
  }
};

export default deploy;
deploy.tags = ["all", "raffle"];
