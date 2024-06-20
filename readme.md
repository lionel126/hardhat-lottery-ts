1. ethers 6
2. ethers.BigNumber -> bigint
3. mock.addConsumer(subId, raffle)
4. sol里用不到的参数, hardhat里怎么传? "0x" empty bytes
5. verify:verify. 访问sepolia 需要代理 http_proxy="http://localhost:1087" hh deploy --network sepolia
6. running "hardhat test", deployments.log doesn't show => console.log
7. 使用VRFCoordinatorV2_5Mock 代替 使用VRFCoordinatorV2Mock, 多了构造参数WeiPerUnitLink, 调用fulfillRandomWords的费用计算, 如果不是nativebalance, 使用了这个参数
8. vrf address on sepolia differs. chainlink debugging with tenderly. solidity import "hardhat/console"

---

????

- always import describe from "node:test" automatically
- chai.expect, how to test the event and get the result for the next test step at the same time?
- staticCall ?
- listener? raffle.once()
- payable(msg.sender) sol => string hardhat ?
- 合约自动转出的钱 没有gas?
- hre.deployments.deploy => ? .address vs ethers.getContract() => BaseContract.getAddress()
- 临时修改类型uint64->uint256 and cast back [using a VRFv2Consumer.sol with a VRF 2.5 subscription](https://stackoverflow.com/questions/78519100/vrf-deployment-subscriptionid-out-of-bounds) #todo: upgrade
- when running "hardhat test", no deployment logs show?
- custom verification on localhost
- hh deploy: if "verify" fails(network error), re-runing "hh deploy" will continue, won't re-deploy. ?
- 部署修改后再次部署, 新地址. ethers.getContract 获取最新的?
- 链上debug?

---

for typescript:

- yarn add typescript ts-node typechain @typechain/ethers-v6 @typechain/hardhat @types/mocha
- hh typechain, generate typechain-types directory
- raffle.once: first argument now is raffle.filters.RaffleWinnerPicked, not string
