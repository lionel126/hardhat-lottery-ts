import { scope } from "hardhat/config";

const ethernalScope = scope("ethernal", "operations for ethernal");
ethernalScope
  .task("reset", "reset the default workspace for ethernal")
  .setAction(async (_taskArgs, hre) => {
    const defaultWorkspace = "Camp Nou";
    await hre.ethernal.resetWorkspace(defaultWorkspace);
  });

export default ethernalScope;
