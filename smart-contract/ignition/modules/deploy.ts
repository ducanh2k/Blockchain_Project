import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyDeployContract", (m) => {
  const tokenA = m.contract("TokenA", ["1000000"]);

  const nftB = m.contract("NFTB");

  const depositReward = m.contract("DepositReward", [tokenA, nftB]);

  return { tokenA, nftB, depositReward };
});
