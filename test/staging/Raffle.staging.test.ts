const { network, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { expect } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("staging test", () => {
          let raffle, raffleEntranceFee
          beforeEach(async () => {
              const { deployer } = await getNamedAccounts()
              raffle = await ethers.getContract("Raffle", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
              //   await raffle.enterRaffle({ value: raffleEntranceFee }) // tx
          })
          describe("fulfillRandomWords", () => {
              it("works with live chainlink keepers and chainlink vrf ", async () => {
                  await new Promise(async (resolve, reject) => {
                      raffle.once("RaffleWinnerPicked", async () => {
                          const winner = await raffle.getWinner()
                          console.log("winner: ", winner, typeof winner)
                          try {
                              assert.equal(await ethers.provider.getBalance(raffle), 0)
                              assert.equal(await raffle.getRaffleState(), 0)
                              assert.equal(await raffle.getNumberOfPlayers(), 0)
                              const endingTimestamp = await raffle.getLatestTimeStamp()
                              console.log(`${startingTimestamp}, " -> ", ${endingTimestamp}`)
                              assert.isTrue(endingTimestamp > startingTimestamp)

                              assert.equal(
                                  await ethers.provider.getBalance(winner),
                                  balances[winner] + entranceFee * BigInt(additionalEntrants), // no gas?
                              )
                              resolve()
                          } catch (e) {
                              reject(e)
                          }
                      })

                      const accounts = await ethers.getSigners()
                      const additionalEntrants = 1
                      const startingIndex = 0
                      const startingTimestamp = await raffle.getLatestTimeStamp()
                      const balances = {}
                      for (let i = startingIndex; i < startingIndex + additionalEntrants; i++) {
                          console.log(
                              accounts[i].address,
                              await ethers.provider.getBalance(accounts[i]),
                          )

                          const connectedRaffle = await raffle.connect(accounts[i])
                          await connectedRaffle.enterRaffle({ value: raffleEntranceFee }) // tx
                          balances[accounts[i].address] = await ethers.provider.getBalance(
                              accounts[i],
                          )
                      }
                  })
              })
          })
      })
