import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("contractDeployment", (m) => {
  const tokenA = m.contract("TokenA");

  const nftB = m.contract("NFTB");

  const depositReward = m.contract("DepositReward", [tokenA, nftB]);

  return { tokenA, nftB, depositReward };
});
