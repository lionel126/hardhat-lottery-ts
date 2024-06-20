import { deployments, getNamedAccounts, network, ethers } from "hardhat";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import { developmentChains, networkConfig } from "../../helper-hardhat-config";
import { expect, assert } from "chai";
import { Raffle, VRFCoordinatorV2_5Mock } from "../../typechain-types";
import { EventLog } from "ethers";

// BigInt.prototype.toJSON = function () {
//     return this.toString()
// }
// console.log(`${JSON.stringify(network)}`)
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle test", () => {
      let raffle: Raffle,
        vrfCoordinatorV2_5Mock: VRFCoordinatorV2_5Mock,
        deployer: string,
        entranceFee: bigint,
        interval: bigint;
      const chainId = network.config.chainId!;
      //   const { deploy, log } = deployments
      beforeEach(async () => {
        //   raffle = await deploy("Raffle")
        await deployments.fixture(["all"]);
        deployer = (await getNamedAccounts()).deployer;

        raffle = await ethers.getContract("Raffle", deployer);
        entranceFee = await raffle.getEntranceFee();
        interval = await raffle.getInterval();
        vrfCoordinatorV2_5Mock = await ethers.getContract(
          "VRFCoordinatorV2_5Mock",
          deployer
        );
      });

      describe("constructor", () => {
        it("initialize correctly", async () => {
          assert.equal((await raffle.getRaffleState()).toString(), "0");
          assert.equal(interval, BigInt(networkConfig[chainId]["interval"]!));
        });
      });
      describe("enter raffle", () => {
        it("revert if not enought eth", async () => {
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
            raffle,
            "Raffle__NotEnoughETHEntered"
          );
          //   console.log(typeof (await raffle.getNumberOfPlayers()))
          assert.equal(await raffle.getNumberOfPlayers(), 0n);
        });
        it("record the player", async () => {
          await raffle.enterRaffle({ value: entranceFee });
          assert.equal(await raffle.getPlayer(0), deployer);
          // const player = (await getNamedAccounts()).player // type. need to be a signer, not address string
          const player = (await ethers.getSigners())[7];
          raffle = await raffle.connect(player);
          await raffle.enterRaffle({ value: entranceFee });
          console.log(`${await raffle.getPlayer(1)}, ${player}`);
          assert.equal(await raffle.getPlayer(1), player.address);
        });
        it("emit event", async () => {
          await expect(raffle.enterRaffle({ value: entranceFee }))
            .to.emit(raffle, "RaffleEntered")
            .withArgs(deployer);
        });
        it("doesn't allow entrance when raffle is calculating", async () => {
          await raffle.enterRaffle({ value: entranceFee });
          //   console.log(typeof interval)
          //   await network.provider.send("evm_increaseTime", [Number(interval) + 1])
          //   await ethers.provider.send("evm_increaseTime", [Number(interval) + 1])
          //   await network.provider.send("evm_mine", []) // evm_increaseTime has done mining already
          await helpers.time.increase(Number(interval) + 1);
          await raffle.performUpkeep("0x"); // #todo parameter
          await expect(
            raffle.enterRaffle({ value: entranceFee })
          ).to.be.revertedWithCustomError(raffle, "Raffle__NotOpen");
        });
      });
      describe("checkUpkeep", () => {
        it("checkUpkeep runs correctly and return true", async () => {
          await raffle.enterRaffle({ value: entranceFee });
          await helpers.time.increase(Number(interval) + 1);
          //   const { upkeepNeeded } = await raffle.checkUpkeep("0x")
          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x");
          assert(upkeepNeeded);
        });
        it("return false if time hasn't passed ", async () => {
          await raffle.enterRaffle({ value: entranceFee });
          //   await helpers.time.increase(Number(interval) + 1)
          //   const { upkeepNeeded } = await raffle.checkUpkeep("0x")
          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x");
          assert(!upkeepNeeded);
        });
        it("return false if no one entered", async () => {
          //   await raffle.enterRaffle({ value: entranceFee })
          await helpers.time.increase(Number(interval) + 1);
          //   const { upkeepNeeded } = await raffle.checkUpkeep("0x")
          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x");
          assert(!upkeepNeeded);
        });
        it("return false if raffleState is CALCULATING", async () => {
          await raffle.enterRaffle({ value: entranceFee });
          await helpers.time.increase(Number(interval) + 1);
          //   const { upkeepNeeded } = await raffle.checkUpkeep("0x")
          await raffle.performUpkeep("0x"); // [] as args not working
          const { upkeepNeeded } = await raffle.checkUpkeep.staticCall("0x");
          //   console.log(await raffle.getRaffleState())
          assert.equal(await raffle.getRaffleState(), 1n);
          assert(!upkeepNeeded);
        });
      });

      describe("performUpkeep", () => {
        it("performUpkeep runs correctly", async () => {
          await raffle.enterRaffle({ value: entranceFee });
          await helpers.time.increase(Number(interval) + 1);
          await expect(raffle.performUpkeep("0x"))
            .to.be.emit(raffle, "RaffleWinnerRequested")
            .withArgs(1); // #todo: why 1?

          //   const txResponse = await raffle.performUpkeep("0x")
          //   const txReceipt = await txResponse.wait(1)
          //   //   console.log(Object.prototype.toString.call(txReceipt), JSON.stringify(txReceipt))
          //   //   console.log(txReceipt.logs)
          //   assert.equal(txReceipt.logs[1].args.requestId, 1) // ?=1 assert(txReceipt.logs[1].args.requestId > 0)

          assert.equal(await raffle.getRaffleState(), 1n);
        });
        it("revert if not upkeepNeeded", async () => {
          await expect(
            raffle.performUpkeep("0x")
          ).to.be.revertedWithCustomError(raffle, "Raffle__UpKeepNotNeeded");
          //   args = `${await ethers.provider.getBalance(raffle)}, ${await raffle.getNumberOfPlayers()}, ${await raffle.getRaffleState()}`
          //   console.log(args)
          await expect(raffle.performUpkeep("0x"))
            .to.be.revertedWithCustomError(
              raffle,
              "Raffle__UpKeepNotNeeded" // `Raffle__UpKeepNotNeeded(${args})`,
            )
            .withArgs(0, 0, 0);
        });
      });

      describe("fulfillRandomWords", () => {
        beforeEach(async () => {
          await helpers.time.increase(Number(interval) + 1);
          await raffle.enterRaffle({ value: entranceFee });
        });
        it("fulfillRandomWords runs correctly", async () => {
          await raffle.performUpkeep("0x");
          await expect(
            vrfCoordinatorV2_5Mock.fulfillRandomWords(0, raffle)
            //   ).to.be.revertedWith("nonexistent request") // #todo: why 1?
          ).to.be.revertedWithCustomError(
            vrfCoordinatorV2_5Mock,
            "InvalidRequest"
          );
          //   await vrfCoordinatorV2_5Mock.fulfillRandomWords(1, raffle);
          await expect(vrfCoordinatorV2_5Mock.fulfillRandomWords(1, raffle)).to
            .be.not.reverted; // #todo: why 1?
        });

        it("picks a winner, sends the money, reset the lottery", async () => {
          const accounts = await ethers.getSigners();
          const additionalEntrants = 1;
          const startingIndex = 1;
          const startingTimestamp = await raffle.getLatestTimeStamp();
          const balances: { [key: string]: bigint } = {};
          for (
            let i = startingIndex;
            i < startingIndex + additionalEntrants;
            i++
          ) {
            console.log(
              "balance: ",
              accounts[i].address,
              await ethers.provider.getBalance(accounts[i])
            );

            const connectedRaffle = await raffle.connect(accounts[i]);
            await connectedRaffle.enterRaffle({ value: entranceFee });
            balances[accounts[i].address] = await ethers.provider.getBalance(
              accounts[i]
            );
          }

          await new Promise<void>(async (resolve, reject) => {
            raffle.once(raffle.filters.RaffleWinnerPicked, async () => {
              const winner = await raffle.getWinner();
              console.log("winner: ", winner, typeof winner);
              try {
                assert.equal(await ethers.provider.getBalance(raffle), 0n);
                assert.equal(await raffle.getRaffleState(), 0n);
                assert.equal(await raffle.getNumberOfPlayers(), 0n);
                assert.isTrue(
                  (await raffle.getLatestTimeStamp()) > startingTimestamp
                );

                assert.equal(
                  await ethers.provider.getBalance(winner),
                  balances[winner] +
                    entranceFee * BigInt(additionalEntrants + 1) // no gas?
                );
                resolve();
              } catch (e) {
                reject(e);
              }
            });
            console.log("to preformUpkeep...");

            const txResponse = await raffle.performUpkeep("0x");
            const txReceipt = await txResponse.wait(1);
            console.log(txReceipt?.logs);
            const log = txReceipt?.logs.find(
              (log) =>
                raffle.interface.parseLog(log)?.name === "RaffleWinnerRequested"
            ) as EventLog;
            console.log("log: ", log);
            const requestId = log.args.requestId;
            console.log("requestId: ", requestId);
            // const requestId = txReceipt?.logs[1].args.requestId;
            // console.log("requestId:", txReceipt?.logs[1].args.requestId);
            try {
              const txResp = await vrfCoordinatorV2_5Mock.fulfillRandomWords(
                requestId,
                raffle
              );
              const txRcpt = await txResp.wait(1);
              console.log(txRcpt?.logs);
            } catch (e) {
              console.log(e);
            }
          });
        });
      });
      //   describe.skip("debug", () => {
      //     it("insufficient balance", async () => {});
      //   });
    });
